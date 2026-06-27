export type RequestMethod = 'POST' | 'GET' | 'DELETE';
export type CaseType = 'normal' | 'exception' | 'boundary';

export interface TestCase {
  id: string;
  title: string;
  module: string;
  method: RequestMethod;
  precondition: string;
  steps: string;
  requestBody: string;
  expectedResult: string;
  actualResult: string;
  caseType: CaseType;
}

export interface ColumnConfig {
  key: keyof TestCase;
  label: string;
  visible: boolean;
  width?: number;
}

export interface SearchFilter {
  keyword: string;
  module: string;
  method: RequestMethod | 'all';
  caseType: CaseType | 'all';
}

export interface Statistics {
  total: number;
  normal: number;
  exception: number;
  boundary: number;
  modules: string[];
}