import { TestCase } from '../types';
import { generateId } from './jsonFormatter';

interface GenerateRequest {
  document: string;
  prompt: string;
}

interface ApiConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
}

const getApiConfig = (): ApiConfig => {
  const saved = localStorage.getItem('apiConfig');
  if (saved) {
    try {
      const cfg = JSON.parse(saved);
      return cfg;
    } catch {
      // ignore invalid config
    }
  }
  return {
    apiKey: '',
    apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    model: 'qwen-max',
  };
};

const parseJsonFromStream = (chunk: string): TestCase | null => {
  try {
    const jsonMatch = chunk.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // ignore parse errors
  }
  return null;
};

export const generateTestCases = async (
  request: GenerateRequest,
  onProgress?: (testCase: TestCase) => void
): Promise<TestCase[]> => {
  const config = getApiConfig();

  // 有API Key就走阿里百炼，否则直接走Mock
  if (config.apiKey && config.apiKey.trim()) {
    try {
      return await generateWithApi(config, request, onProgress);
    } catch (error) {
      console.warn('API调用失败，切换到Mock模式:', error);
      return generateWithMock(onProgress);
    }
  }

  return generateWithMock(onProgress);
};

const generateWithApi = async (
  config: ApiConfig,
  request: GenerateRequest,
  onProgress?: (testCase: TestCase) => void
): Promise<TestCase[]> => {
  const { document, prompt } = request;
  const systemPrompt = prompt || '你是一个专业的API测试工程师，请根据提供的API文档生成全面的测试用例，包括正例、异常例和边界例。';
  const fullPrompt = `${systemPrompt}\n\nAPI文档：\n${document}\n\n请生成测试用例，每行返回一个JSON对象，包含以下字段：title, module, method(POST/GET/DELETE), precondition, steps, requestBody, expectedResult, actualResult, caseType(normal/exception/boundary)。`;

  const testCases: TestCase[] = [];

  // 30秒超时
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      input: {
        messages: [{ role: 'user', content: fullPrompt }],
      },
      parameters: {
        result_format: 'text',
        stream: true,
      },
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        const raw = parseJsonFromStream(data);
        if (raw) {
          const processedCase: TestCase = {
            id: generateId(),
            title: raw.title || '测试用例',
            module: raw.module || '默认模块',
            method: (raw.method || 'POST') as TestCase['method'],
            precondition: raw.precondition || '',
            steps: raw.steps || '',
            requestBody: raw.requestBody || '',
            expectedResult: raw.expectedResult || '',
            actualResult: raw.actualResult || '',
            caseType: (raw.caseType || 'normal') as TestCase['caseType'],
          };
          if (onProgress) onProgress(processedCase);
          testCases.push(processedCase);
        }
      }
    }
  }

  // 如果API没有返回任何用例，抛出异常让外层走Mock
  if (testCases.length === 0) {
    throw new Error('API返回结果为空');
  }

  return testCases;
};

const generateWithMock = async (
  onProgress?: (testCase: TestCase) => void
): Promise<TestCase[]> => {
  const mockCases: TestCase[] = [
    {
      id: generateId(),
      title: '正常创建用户',
      module: '用户管理',
      method: 'POST',
      precondition: '系统已初始化，数据库连接正常',
      steps: '1. 构造合法的用户数据\n2. 调用POST /api/users\n3. 验证响应状态码和返回数据',
      requestBody: '{"username": "testuser", "email": "test@example.com", "password": "password123"}',
      expectedResult: '返回201状态码，包含用户ID和创建时间',
      actualResult: '',
      caseType: 'normal',
    },
    {
      id: generateId(),
      title: '创建用户-缺少必填字段',
      module: '用户管理',
      method: 'POST',
      precondition: '系统已初始化',
      steps: '1. 构造缺少username的请求体\n2. 调用POST /api/users\n3. 验证响应',
      requestBody: '{"email": "test@example.com", "password": "password123"}',
      expectedResult: '返回400状态码，提示缺少username字段',
      actualResult: '',
      caseType: 'exception',
    },
    {
      id: generateId(),
      title: '创建用户-邮箱格式错误',
      module: '用户管理',
      method: 'POST',
      precondition: '系统已初始化',
      steps: '1. 构造邮箱格式错误的请求体\n2. 调用POST /api/users\n3. 验证响应',
      requestBody: '{"username": "testuser", "email": "invalid-email", "password": "password123"}',
      expectedResult: '返回400状态码，提示邮箱格式错误',
      actualResult: '',
      caseType: 'exception',
    },
    {
      id: generateId(),
      title: '查询用户列表',
      module: '用户管理',
      method: 'GET',
      precondition: '系统中存在至少一条用户记录',
      steps: '1. 调用GET /api/users\n2. 验证返回的数据列表',
      requestBody: '{}',
      expectedResult: '返回200状态码，包含用户列表',
      actualResult: '',
      caseType: 'normal',
    },
    {
      id: generateId(),
      title: '查询单个用户',
      module: '用户管理',
      method: 'GET',
      precondition: '系统中存在指定ID的用户',
      steps: '1. 调用GET /api/users/{id}\n2. 验证返回的用户信息',
      requestBody: '{}',
      expectedResult: '返回200状态码，包含完整用户信息',
      actualResult: '',
      caseType: 'normal',
    },
    {
      id: generateId(),
      title: '查询不存在的用户',
      module: '用户管理',
      method: 'GET',
      precondition: '系统已初始化',
      steps: '1. 使用不存在的ID调用GET /api/users/{id}\n2. 验证响应',
      requestBody: '{}',
      expectedResult: '返回404状态码，提示用户不存在',
      actualResult: '',
      caseType: 'exception',
    },
    {
      id: generateId(),
      title: '删除用户',
      module: '用户管理',
      method: 'DELETE',
      precondition: '系统中存在指定ID的用户',
      steps: '1. 调用DELETE /api/users/{id}\n2. 验证响应\n3. 查询该用户确认已删除',
      requestBody: '{}',
      expectedResult: '返回204状态码，用户已删除',
      actualResult: '',
      caseType: 'normal',
    },
    {
      id: generateId(),
      title: '删除不存在的用户',
      module: '用户管理',
      method: 'DELETE',
      precondition: '系统已初始化',
      steps: '1. 使用不存在的ID调用DELETE /api/users/{id}\n2. 验证响应',
      requestBody: '{}',
      expectedResult: '返回404状态码，提示用户不存在',
      actualResult: '',
      caseType: 'exception',
    },
    {
      id: generateId(),
      title: '用户名边界测试-最大长度',
      module: '用户管理',
      method: 'POST',
      precondition: '系统已初始化',
      steps: '1. 构造用户名长度达到最大限制的请求\n2. 调用POST /api/users\n3. 验证响应',
      requestBody: '{"username": "' + 'a'.repeat(100) + '", "email": "test@example.com", "password": "password123"}',
      expectedResult: '返回201状态码，用户创建成功',
      actualResult: '',
      caseType: 'boundary',
    },
    {
      id: generateId(),
      title: '用户名边界测试-超过最大长度',
      module: '用户管理',
      method: 'POST',
      precondition: '系统已初始化',
      steps: '1. 构造用户名长度超过最大限制的请求\n2. 调用POST /api/users\n3. 验证响应',
      requestBody: '{"username": "' + 'a'.repeat(101) + '", "email": "test@example.com", "password": "password123"}',
      expectedResult: '返回400状态码，提示用户名过长',
      actualResult: '',
      caseType: 'boundary',
    },
  ];

  const testCases: TestCase[] = [];

  for (let i = 0; i < mockCases.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const mock = mockCases[i];
    const tc: TestCase = { ...mock, id: generateId() };
    if (onProgress) onProgress(tc);
    testCases.push(tc);
  }

  return testCases;
};