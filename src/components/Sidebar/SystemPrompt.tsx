import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { useTestCaseStore } from '../../store/testCaseStore';

export const SystemPrompt: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { systemPrompt, setSystemPrompt } = useTestCaseStore();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-700">系统提示词/业务背景</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4">
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="请输入系统提示词或业务背景，帮助AI生成更贴合业务的测试用例...

例如：
- 这是一个电商平台的用户管理系统
- 用户注册需要验证手机号
- 密码长度至少6位
- 用户名不能包含特殊字符"
            className="w-full h-32 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
};