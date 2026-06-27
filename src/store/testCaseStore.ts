import { create } from 'zustand';
import { TestCase, SearchFilter, ColumnConfig } from '../types';

interface TestCaseStore {
  testCases: TestCase[];
  selectedIds: string[];
  searchFilter: SearchFilter;
  columnConfigs: ColumnConfig[];
  uploadedFile: File | null;
  systemPrompt: string;
  isGenerating: boolean;
  expandedRowId: string | null;

  addTestCase: (testCase: TestCase) => void;
  addTestCases: (testCases: TestCase[]) => void;
  updateTestCase: (id: string, updates: Partial<TestCase>) => void;
  deleteTestCase: (id: string) => void;
  deleteSelected: () => void;
  clearAll: () => void;

  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;

  setSearchFilter: (filter: Partial<SearchFilter>) => void;
  resetSearchFilter: () => void;

  updateColumnConfig: (key: ColumnConfig['key'], config: Partial<ColumnConfig>) => void;

  setUploadedFile: (file: File | null) => void;
  setSystemPrompt: (prompt: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setExpandedRowId: (id: string | null) => void;
}

const defaultColumns: ColumnConfig[] = [
  { key: 'id', label: '序号', visible: true, width: 80 },
  { key: 'title', label: '标题', visible: true, width: 180 },
  { key: 'module', label: '模块', visible: true, width: 120 },
  { key: 'method', label: '请求方法', visible: true, width: 100 },
  { key: 'precondition', label: '前置条件', visible: true, width: 150 },
  { key: 'steps', label: '测试步骤', visible: true, width: 200 },
  { key: 'requestBody', label: '请求体', visible: true, width: 200 },
  { key: 'expectedResult', label: '预期结果', visible: true, width: 180 },
  { key: 'actualResult', label: '实际结果', visible: true, width: 180 },
];

const defaultFilter: SearchFilter = {
  keyword: '',
  module: '',
  method: 'all',
  caseType: 'all',
};

export const useTestCaseStore = create<TestCaseStore>((set, get) => ({
  testCases: [],
  selectedIds: [],
  searchFilter: defaultFilter,
  columnConfigs: defaultColumns,
  uploadedFile: null,
  systemPrompt: '',
  isGenerating: false,
  expandedRowId: null,

  addTestCase: (testCase) =>
    set((state) => ({ testCases: [...state.testCases, testCase] })),

  addTestCases: (testCases) =>
    set((state) => ({ testCases: [...state.testCases, ...testCases] })),

  updateTestCase: (id, updates) =>
    set((state) => ({
      testCases: state.testCases.map((tc) =>
        tc.id === id ? { ...tc, ...updates } : tc
      ),
    })),

  deleteTestCase: (id) =>
    set((state) => ({
      testCases: state.testCases.filter((tc) => tc.id !== id),
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    })),

  deleteSelected: () =>
    set((state) => ({
      testCases: state.testCases.filter((tc) => !state.selectedIds.includes(tc.id)),
      selectedIds: [],
    })),

  clearAll: () =>
    set({ testCases: [], selectedIds: [], uploadedFile: null, expandedRowId: null }),

  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((sid) => sid !== id)
        : [...state.selectedIds, id],
    })),

  toggleSelectAll: () =>
    set((state) => {
      const visibleCases = state.testCases.filter((tc) => {
        const { keyword, module, method, caseType } = state.searchFilter;
        const matchKeyword = !keyword || tc.title.includes(keyword) || tc.module.includes(keyword);
        const matchModule = !module || tc.module === module;
        const matchMethod = method === 'all' || tc.method === method;
        const matchCaseType = caseType === 'all' || tc.caseType === caseType;
        return matchKeyword && matchModule && matchMethod && matchCaseType;
      });

      return {
        selectedIds:
          state.selectedIds.length === visibleCases.length
            ? []
            : visibleCases.map((tc) => tc.id),
      };
    }),

  setSearchFilter: (filter) =>
    set((state) => ({ searchFilter: { ...state.searchFilter, ...filter } })),

  resetSearchFilter: () => set({ searchFilter: defaultFilter }),

  updateColumnConfig: (key, config) =>
    set((state) => ({
      columnConfigs: state.columnConfigs.map((col) =>
        col.key === key ? { ...col, ...config } : col
      ),
    })),

  setUploadedFile: (file) => set({ uploadedFile: file }),
  setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
  setIsGenerating: (generating) => set({ isGenerating: generating }),
  setExpandedRowId: (id) => set({ expandedRowId: id }),
}));