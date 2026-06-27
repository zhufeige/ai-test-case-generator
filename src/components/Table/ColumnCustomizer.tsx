import React, { useState } from 'react';
import { Settings, Check, X, ChevronDown } from 'lucide-react';
import { ColumnConfig } from '../../types';
import { useTestCaseStore } from '../../store/testCaseStore';

export const ColumnCustomizer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { columnConfigs, updateColumnConfig } = useTestCaseStore();

  const handleLabelChange = (key: ColumnConfig['key'], newLabel: string) => {
    updateColumnConfig(key, { label: newLabel });
  };

  const handleVisibilityToggle = (key: ColumnConfig['key']) => {
    const config = columnConfigs.find((col) => col.key === key);
    if (config) {
      updateColumnConfig(key, { visible: !config.visible });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Settings className="w-4 h-4" />
        <span>列设置</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">自定义列</h3>
            <p className="text-xs text-gray-500">点击列名可编辑，勾选框控制显示/隐藏</p>
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {columnConfigs.map((column) => (
              <div
                key={column.key}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg"
              >
                <button
                  onClick={() => handleVisibilityToggle(column.key)}
                  className="flex-shrink-0 w-4 h-4 rounded border border-gray-300 flex items-center justify-center"
                  style={{
                    backgroundColor: column.visible ? '#3B82F6' : 'transparent',
                    borderColor: column.visible ? '#3B82F6' : '#D1D5DB',
                  }}
                >
                  {column.visible && <Check className="w-3 h-3 text-white" />}
                </button>
                <input
                  type="text"
                  value={column.label}
                  onChange={(e) => handleLabelChange(column.key, e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
};