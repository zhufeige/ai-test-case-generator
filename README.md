# AI 测试用例生成器 · AI Test Case Generator

> 上传 API 文档，AI 自动生成全面的测试用例（正例 / 异常例 / 边界例）。

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## 功能特性

- **📄 上传 API 文档** — 支持 Markdown / 纯文本格式
- **🤖 AI 自动生成** — 通义千问驱动，流式输出实时可见；无 API Key 时自动 Mock 降级
- **📊 三类用例覆盖** — 正例（normal）、异常例（exception）、边界例（boundary），饼图直观统计
- **🔍 多维筛选** — 按关键词、模块、请求方法、用例类型快速过滤
- **📝 表格编辑** — 行展开查看详情、弹窗编辑、列自定义（显隐 / 重命名）
- **📎 批量操作** — 多选、批量删除、一键清空
- **📥 Excel 导出** — 支持选中导出或全部导出
- **🎨 深色模式** — 内置主题切换支持

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

## 使用指南

1. **启动应用** → `npm run dev`，访问 `http://localhost:5173`
2. **配置 AI**（可选）— 在侧边栏填写阿里百炼 API Key、接口地址和模型名
   - 默认模型：`qwen-max`
   - 默认接口：`https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation`
   - 无 API Key 时自动使用 Mock 数据演示
3. **上传文档** — 粘贴或上传 API 文档内容
4. **生成用例** — 点击"生成测试用例"，AI 逐条返回结果
5. **管理用例** — 查看、编辑、筛选、删除、导出

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 样式 | TailwindCSS 3 |
| 状态 | Zustand 4 |
| 路由 | React Router 7 |
| 图表 | Recharts 3 |
| 导出 | xlsx (SheetJS) |
| 图标 | lucide-react |
| AI | 阿里云百炼（通义千问）/ Mock |

## 项目结构

```
src/
├── components/
│   ├── Sidebar/       # 侧边栏（文件上传、API 配置、提示词）
│   ├── Table/          # 表格（行展示、编辑弹窗、列设置、JSON 展开）
│   ├── SearchFilter.tsx
│   └── StatisticsChart.tsx
├── pages/
│   └── Home.tsx        # 主页面编排
├── store/
│   └── testCaseStore.ts # Zustand 全局状态
├── utils/
│   ├── aiClient.ts      # AI 生成（阿里百炼 + Mock 降级）
│   ├── excelExporter.ts # Excel 导出
│   └── jsonFormatter.ts # JSON 格式化 & 语法高亮
├── types/
│   └── index.ts         # 类型定义
├── hooks/
│   └── useTheme.ts      # 主题切换
└── lib/
    └── utils.ts         # 工具函数（cn）
```

## 截图

> *（欢迎贡献截图）*

## 开源协议

本项目基于 [MIT License](LICENSE) 开源。
