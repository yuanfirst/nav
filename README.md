# 📚 书签管理系统

> **完全重构版本** - 数据库改为 D1，原项目在 [back 分支](https://github.com/deerwan/nav/tree/back)

基于 Cloudflare Pages + D1 + Vue 3 构建的现代化书签管理系统。

## ✨ 功能特性

- 📑 **分类管理**：创建、编辑、删除书签分类，支持多级嵌套分类
- 🔖 **书签管理**：添加、编辑、删除书签，支持拖拽排序
- 🔒 **私密书签**：支持设置私密书签，仅登录后可见
- 🔍 **实时搜索**：按名称或URL快速搜索书签，支持防抖优化
- 📥 **导入导出**：支持导出为 JSON/HTML 格式，导入浏览器书签（支持进度显示）
- ⚡ **批量操作**：批量移动、批量编辑属性（私密/公开）、批量删除书签和分类
- 🧹 **清理空分类**：自动检测并清理空分类
- 📊 **数据统计**：显示书签总数和私密书签统计
- 🎨 **主题切换**：支持明暗主题切换
- 🔐 **登录保护**：管理功能需要登录认证
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🔔 **更新通知**：版本更新提示功能
- ⬆️ **回到顶部**：滚动时显示回到顶部按钮
- ⚡ **边缘部署**：基于 Cloudflare Pages，全球加速
- 🤖 **AI 智能助手**：智能生成书签描述、智能推荐分类、批量生成描述，支持所有 OpenAI 兼容 API

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

**数据库迁移**（如果是现有项目升级）：
- 如需启用多级嵌套分类功能，在 D1 Console 中执行 `migrations/001_add_nested_categories.sql` 中的 SQL 语句

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

# AI 功能配置（可选）
OPENAI_API_KEY = sk-...              # OpenAI API Key 或兼容服务的密钥
OPENAI_BASE_URL = https://api.openai.com/v1  # API 基础地址（可选）
OPENAI_MODEL = gpt-4o-mini           # 模型名称（可选）
```

**AI 功能说明**：
- 也可以在设置界面中配置 AI（登录后进入"设置" → "AI 助手"）
- 支持所有 OpenAI 兼容的 API 服务（包括 Azure OpenAI、本地部署模型等）
完成！访问你的 Pages URL 即可使用。


## 📝 许可证

Apache License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

[GitHub 仓库](https://github.com/deerwan/nav)

---

Made with ❤️ using Vue 3 and Cloudflare

