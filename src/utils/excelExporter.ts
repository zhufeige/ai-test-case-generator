import * as XLSX from 'xlsx';
import { TestCase, ColumnConfig } from '../types';

export const exportToExcel = (testCases: TestCase[], columnConfigs: ColumnConfig[]) => {
  const visibleColumns = columnConfigs.filter((col) => col.visible);
  
  const headers = visibleColumns.map((col) => col.label);
  
  const data = testCases.map((testCase, rowIndex) =>
    visibleColumns.map((col) => {
      if (col.key === 'id') return rowIndex + 1;
      const value = testCase[col.key];
      if (col.key === 'requestBody') {
        try {
          return JSON.stringify(JSON.parse(value), null, 2);
        } catch {
          return value;
        }
      }
      return value;
    })
  );

  const worksheetData = [headers, ...data];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '测试用例');

  worksheet['!cols'] = visibleColumns.map((col) => ({
    wch: col.width ? col.width / 6 : 20,
  }));

  XLSX.writeFile(workbook, `测试用例_${new Date().toISOString().split('T')[0]}.xlsx`);
};