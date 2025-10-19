# 书签卡片（Workers + Pages）

基于 Cloudflare Pages + Functions 构建的现代化书签管理系统，支持卡片式展示、拖拽排序、权限控制和自动备份。

## 🚀 快速开始

1. **Fork 本仓库** 到您的 GitHub 账号
2. **连接 Cloudflare Pages**：
   - 在 Cloudflare 控制台创建 Pages 项目
   - 连接到您的 GitHub 仓库
   - 构建命令：`npm ci && npm run build`
   - 输出目录：`web/dist`
3. **配置 KV 存储**：
   - 创建 KV 命名空间
   - 绑定变量名：`BOOKMARKS_KV`
4. **设置环境变量**：
   - `JWT_SECRET`：JWT签名密钥
   - `ADMIN_PASSWORD`：管理密码（默认：admin）
5. **部署完成**！访问您的 Pages 域名即可使用

## ✨ 主要特性

- 🎨 **现代化UI**：响应式布局、暗色主题切换
- 🔐 **权限控制**：公共/私密书签，支持登录后查看私密
- 🎯 **智能导航**：自动高亮当前分类（IntersectionObserver）
- 🖱️ **拖拽排序**：管理模式下可拖拽排序、添加/删除/编辑书签
- 💾 **自动备份**：KV 自动备份，保留最近 10 次快照

## 技术栈
- 前端：React 18 + Vite + TypeScript + TailwindCSS + dnd-kit
- 后端：Cloudflare Pages Functions + Hono
- 存储：Cloudflare KV（BOOKMARKS_KV）
- 鉴权：Cloudflare Access 或自建 JWT（15 分钟过期）

## 快速开始
1. 安装依赖（根目录与 web 使用 npm workspaces）
   - npm install
2. 本地开发
   - npm run dev  # 启动 web（Vite），API 请使用 wrangler pages dev 或 Cloudflare Pages 预览
3. 构建
   - npm run build

## KV/环境变量
- 绑定 KV：BOOKMARKS_KV
- 自建 JWT（可选）：
  - JWT_SECRET：签名密钥
  - ADMIN_PASSWORD：登录密码（默认 admin）
  - JWT_EXPIRES_IN：过期秒数（默认 900 = 15 分钟）

## API 简述
- GET /api/bookmarks?visibility=public|all
- POST /api/bookmarks（新增）
- PUT /api/bookmarks/:id（更新）
- DELETE /api/bookmarks/:id（删除）
- POST /api/categories（新增分类）
- PUT /api/categories/:id（更新分类）
- POST /api/sort（拖拽排序持久化）
- GET /api/backups（列出快照）
- POST /api/backups/restore（从快照恢复）
- POST /api/login、/api/logout（自建 JWT 模式）

## 部署

本项目基于 Cloudflare Pages + Functions + KV 构建，支持一键部署。

**快速开始：**
1. Fork 本仓库到你的 GitHub 账号
2. 在 Cloudflare Pages 中连接你的仓库
3. 按照 [部署指南](DEPLOYMENT.md) 完成配置

**详细部署说明请查看：[DEPLOYMENT.md](DEPLOYMENT.md)**

## 功能特性

### ✨ 最新改进（v1.1）
- **完善的错误处理**：所有API操作都有详细的错误提示和用户反馈
- **登录状态保持**：修复了刷新页面后自动退出登录的问题
- **Cookie兼容性**：支持HTTP和HTTPS环境的Cookie设置
- **智能认证检查**：页面加载时自动检查登录状态

### 🎯 核心功能
- **卡片式书签管理**：直观的卡片布局，支持拖拽排序
- **分类管理**：灵活的书签分类系统
- **权限控制**：公共/私密书签，支持登录后查看私密内容
- **主题切换**：支持亮色/暗色主题
- **数据备份**：自动备份，支持恢复历史版本
- **响应式设计**：适配各种设备尺寸

## 常见问题

### 🐛 已修复问题
- **添加书签失败**：已添加完整的错误处理和用户反馈
- **刷新页面退出登录**：修复了Cookie设置，现在支持HTTP环境
- **API调用静默失败**：所有操作现在都有明确的成功/失败提示

**部署相关问题请查看：[DEPLOYMENT.md](DEPLOYMENT.md)**

## 📝 更新日志

### v1.1.0 (2024-12-19)
- ✅ **修复登录状态保持问题**：解决了刷新页面后自动退出登录的bug
- ✅ **完善错误处理机制**：所有API操作现在都有详细的错误提示
- ✅ **改进Cookie兼容性**：支持HTTP和HTTPS环境的Cookie设置
- ✅ **优化用户体验**：添加操作成功/失败的明确反馈
- ✅ **智能认证检查**：页面加载时自动检查登录状态

### v1.0.0 (2024-12-18)
- 🎉 **初始版本发布**：完整的书签管理系统
- 🎨 响应式卡片布局
- 🔐 权限控制和私密书签
- 🖱️ 拖拽排序功能
- 💾 自动备份系统
