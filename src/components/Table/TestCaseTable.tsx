import React from 'react';
import { TestCase } from '../../types';
import { TableRow } from './TableRow';
import { ColumnCustomizer } from './ColumnCustomizer';

interface TestCaseTableProps {
  testCases: TestCase[];
  selectedIds: string[];
  expandedRowId: string | null;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

export const TestCaseTable: React.FC<TestCaseTableProps> = ({
  testCases,
  selectedIds,
  expandedRowId,
  onToggleSelect,
  onToggleSelectAll,
  onDelete,
  onToggleExpand,
}) => {
  const isAllSelected = testCases.length > 0 && testCases.every((tc) => selectedIds.includes(tc.id));

  if (testCases.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">暂无测试用例</p>
          <p className="text-sm text-gray-400 mt-1">上传API文档后点击"生成测试用例"开始</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-end px-4 py-2 border-b border-gray-100 bg-gray-50/50">
        <ColumnCustomizer />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-20 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 bg-gray-50 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onToggleSelectAll}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
                />
              </th>
              <th className="sticky left-10 z-20 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 bg-gray-50 w-14">
                序号
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                标题
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-24">
                请求方法
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-28">
                模块
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-36">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {testCases.map((testCase, index) => (
              <TableRow
                key={testCase.id}
                testCase={testCase}
                index={index}
                isSelected={selectedIds.includes(testCase.id)}
                isExpanded={expandedRowId === testCase.id}
                onToggleSelect={onToggleSelect}
                onDelete={onDelete}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};