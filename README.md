# 书签卡片（Workers + Pages）

基于 Cloudflare Pages + Functions 构建的现代化书签管理系统，支持卡片式展示、拖拽排序、权限控制和自动备份。

## 🚀 快速开始

1. **Fork 本仓库** 到您的 GitHub 账号
2. **连接 Cloudflare Pages**：
   - 在 Cloudflare 控制台创建 Pages 项目
   - 连接到您的 GitHub 仓库
   - 构建命令：`npm run build`
   - 输出目录：`web/dist`
3. **配置 KV 存储**：
   - 创建 KV 命名空间
   - 绑定变量名：`BOOKMARKS_KV`
4. **设置环境变量**：
   - `ADMIN_PASSWORD`：管理密码（默认：admin）不设置变量则使用默认密码

   - 自建 JWT（可选）：
   - `JWT_SECRET`：签名密钥（强随机字符串）
   - `ADMIN_PASSWORD`：登录密码（默认 admin）
   - `JWT_EXPIRES_IN`：过期秒数（默认 900 = 15 分钟）

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

