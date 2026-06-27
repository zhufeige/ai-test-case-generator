import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Statistics } from '../types';

interface StatisticsChartProps {
  statistics: Statistics;
}

const COLORS = {
  normal: '#10B981',
  exception: '#EF4444',
  boundary: '#F59E0B',
};

export const StatisticsChart: React.FC<StatisticsChartProps> = ({ statistics }) => {
  const { total, normal, exception, boundary } = statistics;

  const data = [
    { name: '正例', value: normal, color: COLORS.normal },
    { name: '异常例', value: exception, color: COLORS.exception },
    { name: '边界例', value: boundary, color: COLORS.boundary },
  ];

  if (total === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-semibold text-gray-700">测试用例统计</span>
        </div>
        <p className="text-sm text-gray-400">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-5 h-5 text-blue-500" />
        <span className="text-sm font-semibold text-gray-700">测试用例统计</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value} 条`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.normal }} />
              <span className="text-sm text-gray-600">正例</span>
              <span className="text-sm font-semibold text-gray-800">{normal}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.exception }} />
              <span className="text-sm text-gray-600">异常例</span>
              <span className="text-sm font-semibold text-gray-800">{exception}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.boundary }} />
              <span className="text-sm text-gray-600">边界例</span>
              <span className="text-sm font-semibold text-gray-800">{boundary}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-sm text-gray-600">总计</span>
              <span className="text-sm font-semibold text-gray-800">{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};