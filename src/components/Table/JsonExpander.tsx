import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { highlightJson } from '../../utils/jsonFormatter';

interface JsonExpanderProps {
  jsonString: string;
}

export const JsonExpander: React.FC<JsonExpanderProps> = ({ jsonString }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="w-full">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        <span>{isExpanded ? '收起请求体' : '展开查看请求体'}</span>
      </button>
      
      {isExpanded && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200 overflow-auto max-h-48">
          <pre
            className="text-xs font-mono whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: highlightJson(jsonString) }}
          />
        </div>
      )}
    </div>
  );
};