import React from 'react';
import { Search, X } from 'lucide-react';
import { useTestCaseStore } from '../store/testCaseStore';
import { RequestMethod, CaseType } from '../types';

interface SearchFilterProps {
  modules: string[];
}

export const SearchFilter: React.FC<SearchFilterProps> = ({ modules }) => {
  const { searchFilter, setSearchFilter, resetSearchFilter, testCases } = useTestCaseStore();

  const hasActiveFilters =
    searchFilter.keyword || searchFilter.module || searchFilter.method !== 'all' || searchFilter.caseType !== 'all';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-2 py-1.5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索测试用例..."
            value={searchFilter.keyword}
            onChange={(e) => setSearchFilter({ keyword: e.target.value })}
            className="w-full pl-8 pr-2.5 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={searchFilter.module}
          onChange={(e) => setSearchFilter({ module: e.target.value })}
          className="px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">全部模块</option>
          {modules.map((module) => (
            <option key={module} value={module}>
              {module}
            </option>
          ))}
        </select>

        <select
          value={searchFilter.method}
          onChange={(e) => setSearchFilter({ method: e.target.value as RequestMethod | 'all' })}
          className="px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="all">全部方法</option>
          <option value="POST">POST</option>
          <option value="GET">GET</option>
          <option value="DELETE">DELETE</option>
        </select>

        <select
          value={searchFilter.caseType}
          onChange={(e) => setSearchFilter({ caseType: e.target.value as CaseType | 'all' })}
          className="px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="all">全部类型</option>
          <option value="normal">正例</option>
          <option value="exception">异常例</option>
          <option value="boundary">边界例</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={resetSearchFilter}
            className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            重置筛选
          </button>
        )}
      </div>
    </div>
  );
};