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

/**
 * 从原始 JSON 对象构造 TestCase，处理 steps/requestBody 等可能是数组的情况。
 */
const toTestCase = (raw: any): TestCase => ({
  id: generateId(),
  title: raw.title || '测试用例',
  module: raw.module || '默认模块',
  method: (raw.method || 'POST') as TestCase['method'],
  precondition: raw.precondition || '',
  steps: Array.isArray(raw.steps) ? raw.steps.join('\n') : (raw.steps || ''),
  requestBody: typeof raw.requestBody === 'object' ? JSON.stringify(raw.requestBody, null, 2) : (raw.requestBody || ''),
  expectedResult: raw.expectedResult || '',
  actualResult: raw.actualResult || '',
  caseType: (raw.caseType || 'normal') as TestCase['caseType'],
});

/**
 * 从文本中提取所有 {} 包裹的 JSON 对象，处理多行格式。
 */
const extractJsonObjects = (text: string): any[] => {
  const results: any[] = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        try {
          const obj = JSON.parse(text.slice(start, i + 1));
          if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
            results.push(obj);
          }
        } catch {
          // 跳过解析失败的片段
        }
        start = -1;
      }
    }
  }
  return results;
};

/**
 * 从 AI 返回的文本中提取测试用例，支持多种格式：
 * - 逐行 JSON（纯 JSON lines）
 * - Markdown 代码块 ```json ... ```
 * - 散落在文本中的 {} 对象
 */
const tryExtractTestCases = (
  fullText: string,
  testCases: TestCase[],
  onProgress?: (tc: TestCase) => void
) => {
  // 1. 先提取 Markdown 代码块中的内容
  const blocks = fullText.split(/```(?:json)?/);
  let candidateText = '';

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;
    // 奇数索引是代码块内容（split 后 ``` 之间的部分）
    candidateText += (i % 2 === 1) ? `\n${block}\n` : `\n${block}\n`;
  }

  // 2. 从候选文本中提取所有 {} JSON 对象
  const objs = extractJsonObjects(candidateText);

  for (const obj of objs) {
    if (obj.title || obj.module) {
      const tc = toTestCase(obj);
      onProgress?.(tc);
      testCases.push(tc);
    }
  }
};

export const generateTestCases = async (
  request: GenerateRequest,
  onProgress?: (testCase: TestCase) => void,
  onModeChange?: (mode: 'ai' | 'mock') => void
): Promise<TestCase[]> => {
  const config = getApiConfig();

  if (config.apiKey && config.apiKey.trim()) {
    try {
      return await generateWithApi(config, request, onProgress);
    } catch (error) {
      console.warn('API调用失败，已切换为示例数据:', error instanceof DOMException && error.name === 'AbortError'
        ? '请求超时（120秒），请检查网络或 API Key 是否正确'
        : error);
      onModeChange?.('mock');
      return generateWithMock(onProgress);
    }
  }
  onModeChange?.('mock');

  return generateWithMock(onProgress);
};

/**
 * 从任意文本中提取测试用例 JSON 行，支持"每行一个 JSON 对象"格式。
 * 也能处理非流式的完整 JSON 响应（output.choices[0].message.content 等）。
 */
const extractTextFromPayload = (payload: any): string => {
  // 流式 message 格式: choices[0].message.content[0].text
  const c0 = payload?.output?.choices?.[0]?.message?.content;
  if (typeof c0 === 'string') return c0;
  if (Array.isArray(c0)) {
    const texts = c0.map((c: any) => c?.text ?? c ?? '').join('');
    if (texts) return texts;
  }
  // 旧 text 格式: output.text
  if (payload?.output?.text) return payload.output.text;
  return '';
};

const generateWithApi = async (
  config: ApiConfig,
  request: GenerateRequest,
  onProgress?: (testCase: TestCase) => void
): Promise<TestCase[]> => {
  const { document, prompt } = request;
  const systemPrompt = prompt || '你是一个专业的API测试工程师';
  // 精确指令：让模型直接返回 JSON 数组，不要 markdown 和多余文字
  const fullPrompt = `${systemPrompt}

## API文档
${document}

## 要求
直接输出一个 JSON 数组（不要 markdown、不要代码块、不要多余文字），
每个元素包含：title, module, method(POST/GET/DELETE/PUT), precondition, steps, requestBody, expectedResult, actualResult, caseType("normal"/"exception"/"boundary")。
其中 steps 和 requestBody 用字符串表示。

**非常重要：每个测试点必须同时包含正向用例（normal）和反向用例（异常 exception + 边界 boundary），数量各占约一半。**`;

  const testCases: TestCase[] = [];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

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
        result_format: 'message',
      },
    }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`API请求失败 (${response.status}): ${response.statusText}`);
  }

  // 流式读取，边收边解析（不依赖 SSE 格式）
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let accumulatedRaw = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    accumulatedRaw += decoder.decode(value, { stream: true });

    // 从部分 JSON 中提取 "content":"..." 字段（支持转义引号）
    const m = accumulatedRaw.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (m) {
      tryExtractTestCases(m[1], testCases, onProgress);
    }
  }

  // 流结束：完整 JSON 兜底解析
  if (testCases.length === 0) {
    try {
      const payload = JSON.parse(accumulatedRaw);
      const fullText = extractTextFromPayload(payload);
      if (fullText) tryExtractTestCases(fullText, testCases, onProgress);
    } catch { /* ignore */ }
  }

  if (testCases.length === 0) {
    console.warn('API 响应原文（前 500 字符）:', accumulatedRaw.slice(0, 500));
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