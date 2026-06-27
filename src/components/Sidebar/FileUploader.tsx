import React, { useState, useRef } from 'react';
import { Upload, X, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useTestCaseStore } from '../../store/testCaseStore';

interface FileUploaderProps {
  onFileRead: (content: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileRead }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadedFile, setUploadedFile } = useTestCaseStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
        onFileRead(content);
        setUploadedFile(file);
        setIsCollapsed(true);
      };
      reader.readAsText(file);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setFileContent('');
    setIsCollapsed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleView = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (uploadedFile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
              {uploadedFile.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleView}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="查看内容"
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            <button
              onClick={handleRemove}
              className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="删除文件"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {!isCollapsed && (
          <div className="p-4">
            <pre className="text-xs text-gray-600 max-h-40 overflow-auto whitespace-pre-wrap">
              {fileContent}
            </pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 text-center">
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600">点击或拖拽上传API文档</p>
            <p className="text-xs text-gray-400 mt-1">支持 .txt, .json, .md 格式</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.json,.md"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};