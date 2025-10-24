# 📚 书签管理系统

> **完全重构版本** - 数据库改为 D1，原项目在 [back 分支](https://github.com/deerwan/nav/tree/back)

基于 Cloudflare Pages + D1 + Vue 3 构建的现代化书签管理系统。

## ✨ 功能特性

- 📑 **分类管理**：创建、编辑、删除书签分类
- 🔖 **书签管理**：添加、编辑、删除书签，支持拖拽排序
- 🔒 **私密书签**：支持设置私密书签，仅登录后可见
- 🔍 **实时搜索**：按名称或URL快速搜索书签
- 📥 **导入导出**：支持导出为 JSON/HTML 格式，导入浏览器书签
- 🎨 **主题切换**：支持明暗主题切换
- 🔐 **登录保护**：管理功能需要登录认证
- 📱 **响应式设计**：完美适配桌面端和移动端
- ⚡ **边缘部署**：基于 Cloudflare Pages，全球加速

## 🛠️ 技术栈

- **前端框架**：Vue 3 + Composition API
- **构建工具**：Vite
- **后端**：Cloudflare Pages Functions
- **数据库**：Cloudflare D1 (SQLite)
- **认证**：JWT Token
- **样式**：原生 CSS (现代化设计)

## 🚀 快速部署

### 1. 创建 D1 数据库
在 [Cloudflare Dashboard](https://dash.cloudflare.com/) 中：
- 进入 `Workers & Pages` > `D1`
- 点击 `Create database`，名称：`bookmark-db`
- 进入数据库 > `Console`，复制 `schema.sql` 内容并执行

**重要：获取数据库 ID**
- 创建数据库后，在数据库详情页面可以看到 `Database ID`
- 复制这个 ID，稍后需要替换到 `wrangler.toml` 文件中

### 2. 部署 Pages 项目
- Fork [本仓库](https://github.com/deerwan/nav) 到你的 GitHub
- 在 Cloudflare Dashboard 创建 Pages 项目
- 连接 GitHub 仓库
- 构建设置：
  - 构建命令：`npm run build`
  - 输出目录：`dist`

**重要：更新数据库 ID**
- Fork 仓库后，编辑 `wrangler.toml` 文件
- 将第8行的 `database_id` 替换为你刚创建的数据库 ID
- 提交并推送到你的 GitHub 仓库

### 3. 绑定数据库
在 Pages 项目中：
- `Settings` > `Functions` > `D1 database bindings`
- 添加绑定：变量名 `DB`，选择 `bookmark-db`

**注意：** 如果绑定失败，请确保：
- 数据库名称与 `wrangler.toml` 中的 `database_name` 一致
- 数据库 ID 已正确更新到 `wrangler.toml` 文件中

### 4. 配置环境变量
在 `Settings` > `Environment variables` > `Production` 添加：
```
ADMIN_USERNAME = admin
ADMIN_PASSWORD = 你的密码
JWT_SECRET = 至少32位的随机字符串
```

完成！访问你的 Pages URL 即可使用。

## 💡 使用说明

### 访客模式
- 浏览所有公开书签
- 使用搜索功能
- 切换主题

### 登录后
1. 点击"登录"输入用户名和密码
2. 点击"设置"按钮可以：
   - 添加书签（可设置为私密）
     - 输入URL后点击"自动获取"可自动抓取网页标题和描述
   - 添加分类
   - 导入/导出书签
   - 查看统计信息
   - 调整界面设置（搜索栏、空分类显示）
3. 点击"编辑"按钮可以：
   - 拖拽排序书签
   - 拖拽移动到其他分类
   - 编辑/删除书签
   - 编辑/删除分类

### 私密书签
- 创建书签时勾选"私密书签"
- 私密书签带有🔒锁图标标识
- 仅登录后可见私密书签
- 退出登录后自动隐藏

## 🎯 已实现功能

- [x] 私密书签（登录可见）
- [x] 书签导入/导出（支持 JSON/HTML 格式，支持Chrome嵌套书签）
- [x] 独立设置页面
- [x] 拖拽排序（跨分类移动）
- [x] 实时搜索（可开关，带防抖优化）
- [x] 主题切换
- [x] 批量导入（自动去重）
- [x] Toast 通知系统
- [x] 数据库索引优化
- [x] 图片懒加载
- [x] Token 过期自动处理
- [x] 安全响应头（CSP、XSS 防护）
- [x] 隐藏空分类选项
- [x] 自动获取网页标题和描述

## 🚧 待实现功能

- [ ] 批量编辑
- [ ] 书签标签系统
- [ ] 多用户支持
- [ ] 书签分享功能
- [ ] 浏览器扩展

## 📝 许可证

Apache License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

[GitHub 仓库](https://github.com/deerwan/nav)

---

Made with ❤️ using Vue 3 and Cloudflare

