# 部署指南

## 部署（Cloudflare Pages + Functions + KV）详解

### 前置条件
- Cloudflare 账号，并具有 Pages 权限
- 本仓库代码（已连接到 GitHub/GitLab/Bitbucket 任一）
- Node.js 18+ 与 npm（本地构建/调试时需要）
- Wrangler CLI（可选，本地运行 Pages Functions 时使用）

### 一、连接仓库并配置构建
- Cloudflare 控制台 > Pages > 创建项目 > 连接到 Git，选择本仓库
- 构建命令：`npm ci && npm run build`
- 构建输出目录：`web/dist`
- 环境：Node.js 18（或更高）
- 创建完成后，Pages 会自动识别 `/functions` 目录为 Pages Functions

### 二、创建并绑定 KV（BOOKMARKS_KV）
- 在 Cloudflare 控制台 > Workers & KV > KV 创建一个命名空间（例如：bookmarks-kv）
- 在 Pages 项目 > Functions > Settings > KV Bindings 添加绑定：
  - Variable name：`BOOKMARKS_KV`（必须与代码一致）
  - Namespace：选择上一步创建的 KV
- 预览环境（Preview）与生产环境（Production）需要分别绑定一次
- 可选（用于本地开发）：
  - `npx wrangler kv:namespace create BOOKMARKS_KV`
  - `npx wrangler kv:namespace create --preview BOOKMARKS_KV`
  - 将生成的 id 与 preview_id 写入 wrangler.toml，便于 pages dev 使用

### 三、配置环境变量与密钥
- 位置：Pages 项目 > Settings > Environment variables（分别在 Preview 和 Production 设置）
- 变量说明：
  - `JWT_SECRET`：自建 JWT 的签名密钥（强随机字符串）
  - `ADMIN_PASSWORD`：管理密码（默认 admin，可修改）
  - `JWT_EXPIRES_IN`：JWT 过期秒数（默认 900 = 15 分钟）

### 四、可选：启用 Cloudflare Access 保护
- 如果你希望通过 Cloudflare Access 统一鉴权，可在 Access > Applications 创建应用，保护整个站点或 `/api/*` 路由
- 部署后，后端会自动识别请求头 `cf-access-jwt-assertion`，检测通过则视为已登录，无需再走自建 JWT
- 也可以不启用 Access，而是使用自建 JWT（`/api/login` 设置 cookie）

### 五、可选：配置定时任务（Scheduled Functions）
- 仓库内提供 `functions/_scheduled.ts`，用于清理备份，仅保留最近 10 次快照
- 在 Pages 项目 > Functions > Settings > Triggers > Cron triggers 新增计划任务：
  - 例如：`0 3 * * *` 表示每天 03:00 执行一次
- 不需要定时清理可跳过

### 六、本地开发与预览
- **方式 A：仅前端开发**
  - `npm run dev`（Vite 开发服务器）
  - 接口可指向已部署的预览/生产环境
- **方式 B：本地模拟 Pages + Functions（推荐调试 API）**
  - 终端 1：`npm -w web run build -- --watch`（持续输出到 web/dist）
  - 终端 2：`npx wrangler pages dev web/dist`（本地同时托管静态站点与 Functions）
  - 如需本地 KV，请在 wrangler.toml 写好 kv_namespaces 的 id/preview_id
  - 健康检查：`curl http://127.0.0.1:8788/api/health` 应返回 `{ ok: true }`

### 七、首次部署与验证
- 将代码推送到默认分支，Cloudflare Pages 会自动构建并发布
- 打开生产域名，确认页面可访问
- 健康检查：`GET /api/health` 返回 `{ ok: true }`
- 如使用自建 JWT：在管理界面进行登录（使用 ADMIN_PASSWORD），并验证私密书签可见
- 备份功能：任意写操作会自动备份，可调用 `GET /api/backups` 查看，`POST /api/backups/restore` 恢复

## 上线前检查清单
- [ ] KV 已绑定，变量名严格为 `BOOKMARKS_KV`
- [ ] `JWT_SECRET`、`ADMIN_PASSWORD`、（可选）`JWT_EXPIRES_IN` 已在 Preview 与 Production 分别配置
- [ ] 如启用 Cloudflare Access，访问策略已生效；未启用则确保 `/api/login` 正常
- [ ] Cron 触发器（如需）已启用
- [ ] 构建产物目录为 `web/dist`
- [ ] 自定义域名（如需）已绑定并通过 HTTPS

## 常见问题

### 🔧 部署问题
- **401 Unauthorized**：未登录、Access 未生效，或未设置 JWT_SECRET/ADMIN_PASSWORD
- **500/数据为空**：未绑定 KV 或绑定名不是 BOOKMARKS_KV
- **本地 API 报错 Missing KV**：未在 wrangler.toml 配置 kv_namespaces 或未使用 pages dev
- **预览与生产行为不一致**：请分别在 Preview 与 Production 配置同样的环境变量和 KV 绑定

### 🔍 调试技巧
1. **检查浏览器控制台**：查看Network标签页的API请求状态
2. **查看Cloudflare日志**：在Pages项目的Functions标签页查看错误日志
3. **验证环境变量**：确保所有必需的环境变量都已正确设置
4. **测试API端点**：使用 `GET /api/health` 检查服务状态
