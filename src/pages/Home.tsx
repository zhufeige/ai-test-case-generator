import React, { useState, useMemo } from 'react';
import { TestTube, Menu, X, Sparkles, Download, Trash2 } from 'lucide-react';
import { FileUploader } from '../components/Sidebar/FileUploader';
import { SystemPrompt } from '../components/Sidebar/SystemPrompt';
import { ActionButtons } from '../components/Sidebar/ActionButtons';
import { ApiConfig } from '../components/Sidebar/ApiConfig';
import { TestCaseTable } from '../components/Table/TestCaseTable';
import { SearchFilter } from '../components/SearchFilter';
import { StatisticsChart } from '../components/StatisticsChart';
import { useTestCaseStore } from '../store/testCaseStore';
import { generateTestCases } from '../utils/aiClient';
import { exportToExcel } from '../utils/excelExporter';
import { TestCase, Statistics } from '../types';

export const Home: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [documentContent, setDocumentContent] = useState('');
  const [mockBannerDismissed, setMockBannerDismissed] = useState(false);
  const [mockReason, setMockReason] = useState<'noKey' | 'apiError' | null>(null);

  const {
    testCases,
    selectedIds,
    searchFilter,
    expandedRowId,
    isGenerating,
    isMockData,
    setIsGenerating,
    setIsMockData,
    addTestCase,
    toggleSelect,
    toggleSelectAll,
    deleteSelected,
    clearAll,
    setExpandedRowId,
  } = useTestCaseStore();

  const filteredTestCases = useMemo(() => {
    return testCases.filter((tc) => {
      const { keyword, module, method, caseType } = searchFilter;
      const matchKeyword =
        !keyword ||
        tc.title.toLowerCase().includes(keyword.toLowerCase()) ||
        tc.module.toLowerCase().includes(keyword.toLowerCase()) ||
        tc.steps.toLowerCase().includes(keyword.toLowerCase());
      const matchModule = !module || tc.module === module;
      const matchMethod = method === 'all' || tc.method === method;
      const matchCaseType = caseType === 'all' || tc.caseType === caseType;
      return matchKeyword && matchModule && matchMethod && matchCaseType;
    });
  }, [testCases, searchFilter]);

  const statistics: Statistics = useMemo(() => {
    return {
      total: testCases.length,
      normal: testCases.filter((tc) => tc.caseType === 'normal').length,
      exception: testCases.filter((tc) => tc.caseType === 'exception').length,
      boundary: testCases.filter((tc) => tc.caseType === 'boundary').length,
      modules: [...new Set(testCases.map((tc) => tc.module))] as string[],
    };
  }, [testCases]);

  const handleFileRead = (content: string) => {
    setDocumentContent(content);
  };

  const hasMockApiKey = () => {
    try {
      const cfg = JSON.parse(localStorage.getItem('apiConfig') || '{}');
      return !!(cfg.apiKey && cfg.apiKey.trim());
    } catch {
      return false;
    }
  };

  const showMockBanner = testCases.length > 0 && !hasMockApiKey() && !mockBannerDismissed;

  const mockBannerText = mockReason === 'apiError'
    ? 'AI 请求失败（超时或 API 错误），系统已切换到内置 Mock 数据。请检查 API Key 和网络连接后重试。'
    : '未配置 API Key，系统使用内置 Mock 数据演示。请在侧边栏填写阿里百炼 API Key 获取真实 AI 生成结果。';

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMockReason(null);

    const doc = documentContent || `API接口列表：
- POST /api/users 创建用户
- GET /api/users 获取用户列表
- GET /api/users/{id} 获取单个用户
- DELETE /api/users/{id} 删除用户

字段说明：
- username: 字符串，必填，最大长度100
- email: 字符串，必填，需符合邮箱格式
- password: 字符串，必填，长度6-20位`;

    try {
      await generateTestCases(
        {
          document: doc,
          prompt: useTestCaseStore.getState().systemPrompt,
        },
        (testCase: TestCase) => {
          addTestCase(testCase);
        },
        (mode) => {
          setIsMockData(mode === 'mock');
          if (mode === 'mock' && hasMockApiKey()) {
            setMockReason('apiError');
          } else if (mode === 'mock') {
            setMockReason('noKey');
          }
        }
      );
    } catch (error) {
      console.error('生成测试用例失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    const exportCases =
      selectedIds.length > 0
        ? testCases.filter((tc) => selectedIds.includes(tc.id))
        : testCases;
    const cols = useTestCaseStore.getState().columnConfigs;
    exportToExcel(exportCases, cols);
  };

  const handleClear = () => {
    if (confirm('确定要清除所有测试用例吗？')) {
      clearAll();
      setMockBannerDismissed(false);
      setDocumentContent('');
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const handleDeleteTestCase = (id: string) => {
    useTestCaseStore.getState().deleteTestCase(id);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <TestTube className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-800">API测试用例管理</h1>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <span className="text-sm text-gray-500">
                共 {testCases.length} 条测试用例
              </span>
              {selectedIds.length > 0 && (
                <span className="text-sm text-blue-600 font-medium">
                  已选择 {selectedIds.length} 条
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {showMockBanner && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-screen-2xl mx-auto px-4 py-2.5 flex items-center gap-2 text-sm text-amber-800">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              <strong>示例数据提示：</strong>{mockBannerText}
            </span>
            <button
              onClick={() => setMockBannerDismissed(true)}
              className="ml-auto text-amber-600 hover:text-amber-800 shrink-0"
              title="关闭提示"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex max-w-screen-2xl mx-auto">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:w-[300px] w-full fixed lg:sticky top-[57px] h-[calc(100vh-57px)] bg-gray-50 border-r border-gray-200 z-40 flex flex-col transition-transform duration-300`}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <FileUploader onFileRead={handleFileRead} />
            <ApiConfig />
            <SystemPrompt />
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-6">
          <div className="space-y-4">
            {selectedIds.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-blue-700">
                    已选择 {selectedIds.length} 条测试用例
                  </span>
                  <button
                    onClick={() => toggleSelectAll()}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    取消全选
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    导出选中
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    删除选中
                  </button>
                </div>
              </div>
            )}
            <StatisticsChart statistics={statistics} />
            <SearchFilter modules={statistics.modules} />
            <TestCaseTable
              testCases={filteredTestCases}
              selectedIds={selectedIds}
              expandedRowId={expandedRowId}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onDelete={handleDeleteTestCase}
              onToggleExpand={handleToggleExpand}
            />
          </div>
        </main>
      </div>

      {/* 浮动操作按钮 */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="group relative flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all"
          title="生成测试用例"
        >
          <Sparkles className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {isGenerating ? '生成中...' : '生成测试用例'}
          </span>
        </button>

        <button
          onClick={handleExport}
          disabled={testCases.length === 0}
          className="group relative flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-all"
          title="导出Excel"
        >
          <Download className="w-5 h-5" />
          {selectedIds.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {selectedIds.length}
            </span>
          )}
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            导出Excel
          </span>
        </button>

        <button
          onClick={handleClear}
          disabled={testCases.length === 0}
          className="group relative flex items-center justify-center w-12 h-12 bg-white text-red-500 rounded-full shadow-lg hover:shadow-xl hover:bg-red-50 border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="清除全部"
        >
          <Trash2 className="w-5 h-5" />
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            清除全部
          </span>
        </button>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">生成测试用例中</h3>
                <p className="text-sm text-gray-500">AI正在为您生成测试用例，请稍候...</p>
              </div>
            </div>
            <div className="space-y-2">
              {testCases.slice(-3).map((tc) => (
                <div key={tc.id} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="truncate">{tc.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};