import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';
import { TestCase, RequestMethod, CaseType } from '../../types';
import { useTestCaseStore } from '../../store/testCaseStore';
import { generateId } from '../../utils/jsonFormatter';

interface AddTestCaseModalProps {
  onClose: () => void;
}

const defaultForm = {
  title: '',
  module: '',
  method: 'POST' as RequestMethod,
  precondition: '',
  steps: '',
  requestBody: '',
  expectedResult: '',
  actualResult: '',
  caseType: 'normal' as CaseType,
};

export const AddTestCaseModal: React.FC<AddTestCaseModalProps> = ({ onClose }) => {
  const [form, setForm] = useState(defaultForm);
  const addTestCase = useTestCaseStore((s) => s.addTestCase);

  const handleChange = (field: keyof TestCase, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    addTestCase({
      id: generateId(),
      ...form,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">新增测试用例</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldInput label="标题 *" value={form.title} onChange={(v) => handleChange('title', v)} placeholder="必填" />
            <FieldInput label="模块" value={form.module} onChange={(v) => handleChange('module', v)} placeholder="如：用户管理" />

            <FieldSelect
              label="请求方法"
              value={form.method}
              options={[
                { value: 'GET', label: 'GET' },
                { value: 'POST', label: 'POST' },
                { value: 'DELETE', label: 'DELETE' },
                { value: 'PUT', label: 'PUT' },
              ]}
              onChange={(v) => handleChange('method', v)}
            />

            <FieldSelect
              label="用例类型"
              value={form.caseType}
              options={[
                { value: 'normal', label: '正例' },
                { value: 'exception', label: '异常例' },
                { value: 'boundary', label: '边界例' },
              ]}
              onChange={(v) => handleChange('caseType', v as CaseType)}
            />
          </div>

          <FieldTextarea label="前置条件" value={form.precondition} onChange={(v) => handleChange('precondition', v)} />
          <FieldTextarea label="测试步骤" value={form.steps} onChange={(v) => handleChange('steps', v)} />
          <FieldTextarea label="请求体 (JSON)" value={form.requestBody} onChange={(v) => handleChange('requestBody', v)} />
          <FieldTextarea label="预期结果" value={form.expectedResult} onChange={(v) => handleChange('expectedResult', v)} />
          <FieldTextarea label="实际结果" value={form.actualResult} onChange={(v) => handleChange('actualResult', v)} />
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!form.title.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            添加
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const FieldInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

const FieldTextarea: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

const FieldSelect: React.FC<{ label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }> = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);
