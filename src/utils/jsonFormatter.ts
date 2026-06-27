export const formatJson = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return jsonString;
  }
};

export const highlightJson = (jsonString: string): string => {
  const formatted = formatJson(jsonString);
  return formatted
    .replace(/"([^"]+)":/g, '<span class="text-blue-600">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="text-green-600">"$1"</span>')
    .replace(/: (\d+)/g, ': <span class="text-orange-600">$1</span>')
    .replace(/: (true|false)/g, ': <span class="text-purple-600">$1</span>')
    .replace(/: null/g, ': <span class="text-gray-400">null</span>');
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};