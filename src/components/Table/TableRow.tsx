import React, { useState } from 'react';
import { Trash2, Pencil, ChevronDown, ChevronRight } from 'lucide-react';
import { TestCase } from '../../types';
import { TextTooltip } from './TextTooltip';
import { EditTestCaseModal } from './EditTestCaseModal';
import { highlightJson } from '../../utils/jsonFormatter';

const getMethodBadge = (method: string) => {
  const colors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-700',
    POST: 'bg-green-100 text-green-700',
    DELETE: 'bg-red-100 text-red-700',
    PUT: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[method] || 'bg-gray-100 text-gray-700'}`}>
      {method}
    </span>
  );
};

const getCaseTypeBadge = (caseType: string) => {
  const map: Record<string, { label: string; color: string }> = {
    normal: { label: '正例', color: 'bg-green-50 text-green-600' },
    exception: { label: '异常例', color: 'bg-red-50 text-red-600' },
    boundary: { label: '边界例', color: 'bg-yellow-50 text-yellow-700' },
  };
  const info = map[caseType] || { label: caseType, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${info.color}`}>
      {info.label}
    </span>
  );
};

interface TableRowProps {
  testCase: TestCase;
  index: number;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleExpand: (id: string) => void;
}

export const TableRow: React.FC<TableRowProps> = ({
  testCase,
  index,
  isSelected,
  isExpanded,
  onToggleSelect,
  onDelete,
  onToggleExpand,
}) => {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <tr
        className={`zebra-stripe hover:bg-blue-50 transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50' : ''}`}
        onClick={() => onToggleExpand(testCase.id)}
      >
        <td className="sticky left-0 bg-inherit z-10 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(testCase.id)}
              className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
            />
          </div>
        </td>
        <td className="sticky left-10 z-10 bg-inherit px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{index + 1}</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-blue-500" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
          </div>
        </td>
        <td className="px-4 py-3 border-b border-gray-200">
          <TextTooltip text={testCase.title} />
        </td>
        <td className="px-4 py-3 border-b border-gray-200">
          {getMethodBadge(testCase.method)}
        </td>
        <td className="px-4 py-3 border-b border-gray-200">
          <span className="text-sm text-gray-600">{testCase.module}</span>
        </td>
        <td className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {getCaseTypeBadge(testCase.caseType)}
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
              title="编辑"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(testCase.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <DetailField label="前置条件" value={testCase.precondition} />
              <DetailField label="测试步骤" value={testCase.steps} />
              <DetailField label="预期结果" value={testCase.expectedResult} />
              <DetailField label="实际结果" value={testCase.actualResult || '待执行'} />
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">请求体</label>
                {testCase.requestBody ? (
                  <pre
                    className="bg-gray-100 rounded-lg p-3 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-48 border border-gray-200"
                    dangerouslySetInnerHTML={{ __html: highlightJson(testCase.requestBody) }}
                  />
                ) : (
                  <span className="text-sm text-gray-400">-</span>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
      {editing && (
        <EditTestCaseModal
          testCase={testCase}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
};

const DetailField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
    <div className="text-sm text-gray-700 bg-white rounded-lg p-3 border border-gray-100 min-h-[36px] whitespace-pre-wrap">{value || '-'}</div>
  </div>
);