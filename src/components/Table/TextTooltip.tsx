import React from 'react';

interface TextTooltipProps {
  text: string;
  maxChars?: number;
}

export const TextTooltip: React.FC<TextTooltipProps> = ({ text, maxChars = 30 }) => {
  const needsTruncation = text.length > maxChars;
  const displayText = needsTruncation ? text.slice(0, maxChars) + '...' : text;

  return (
    <div className="relative inline-block max-w-full group">
      <span className="block cursor-default" title={text}>
        {displayText}
      </span>
      {needsTruncation && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-3 py-2 bg-white rounded-lg shadow-lg border border-gray-200 text-sm whitespace-normal break-words max-w-xs invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {text}
        </div>
      )}
    </div>
  );
};