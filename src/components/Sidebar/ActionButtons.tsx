import React from 'react';
import { Sparkles, Download, Trash2 } from 'lucide-react';
import { useTestCaseStore } from '../../store/testCaseStore';

interface ActionButtonsProps {
  onGenerate: () => void;
  onExport: () => void;
  onClear: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onGenerate, onExport, onClear }) => {
  const { isGenerating, testCases, selectedIds } = useTestCaseStore();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col gap-3">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? '生成中...' : '生成测试用例'}
        </button>

        <button
          onClick={onExport}
          disabled={testCases.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          导出Excel
          {selectedIds.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-green-600 rounded-full text-xs">
              {selectedIds.length}
            </span>
          )}
        </button>

        <button
          onClick={onClear}
          disabled={testCases.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          清除全部
        </button>
      </div>
    </div>
  );
};