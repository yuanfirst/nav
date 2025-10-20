<div align="center">

# 📚 Nav

**现代化书签管理系统**

基于 Cloudflare Pages + Functions 构建的响应式书签管理平台

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/deerwan/nav)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

</div>

---

## ✨ 特性

<table>
<tr>
<td width="50%">

### 🎨 现代化界面
- 响应式卡片布局
- 暗色/亮色主题切换
- 流畅动画效果
- 移动端适配

### 🔐 权限管理
- 公共/私密书签分类
- JWT 认证系统
- Cloudflare Access 集成
- 登录状态持久化

</td>
<td width="50%">

### 🖱️ 交互体验
- 拖拽排序功能
- 智能导航高亮
- 模态框管理
- 确认对话框

### 💾 数据管理
- 自动备份系统
- 手动备份恢复
- 数据版本控制
- KV 存储持久化

</td>
</tr>
</table>

## 📱 预览

<div align="center">

![image.png](https://img.106996.xyz/file/1760920055809_image.png)
![image.png](https://img.106996.xyz/file/1760920353935_image.png)

*现代化书签管理界面*

</div>


## 🚀 快速开始

### 1️⃣ Fork 仓库
```bash
# 点击右上角 Fork 按钮
```

### 2️⃣ 部署到 Cloudflare Pages

1. 进入 [Cloudflare Pages](https://pages.cloudflare.com/)
2. 创建新项目 → 连接到 GitHub
3. 选择您的仓库
4. 配置构建设置：
   - **构建命令**: `npm run build`
   - **输出目录**: `web/dist`
   - **Node.js 版本**: 18

### 3️⃣ 配置 KV 存储

```bash
# 创建 KV 命名空间
wrangler kv:namespace create BOOKMARKS_KV

# 在 Pages 项目中绑定
# 变量名: BOOKMARKS_KV
# 命名空间: 选择刚创建的 KV
```

### 4️⃣ 设置环境变量

| 变量名 | 说明 | 默认值 | 必需 |
|--------|------|--------|------|
| `ADMIN_PASSWORD` | 管理密码 | `admin` | ❌ |
| `JWT_SECRET` | JWT 签名密钥 | - | ❌ |
| `JWT_EXPIRES_IN` | JWT 过期时间（秒） | `900` | ❌ |

### 5️⃣ 完成部署

访问您的 Pages 域名，开始使用！



## 📖 API 文档

### 书签管理
```http
GET    /api/bookmarks?visibility=public|all
POST   /api/bookmarks
PUT    /api/bookmarks/:id
DELETE /api/bookmarks/:id
```

### 分类管理
```http
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### 其他功能
```http
POST   /api/sort              # 拖拽排序
GET    /api/backups           # 备份列表
POST   /api/backups/restore   # 恢复备份
POST   /api/login             # 用户登录
POST   /api/logout            # 用户登出
```

## 🏗️ 技术栈

<table>
<tr>
<td width="33%">

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **TailwindCSS** - 样式框架
- **dnd-kit** - 拖拽功能

</td>
<td width="33%">

### 后端
- **Cloudflare Pages Functions** - 无服务器函数
- **Hono** - Web 框架
- **JWT** - 身份认证
- **Zod** - 数据验证

</td>
<td width="33%">

### 存储
- **Cloudflare KV** - 键值存储
- **自动备份** - 数据安全
- **版本控制** - 变更追踪

</td>
</tr>
</table>

## 🔧 高级配置

### Cloudflare Access 集成

如果您希望使用 Cloudflare Access 进行统一身份验证：

1. 进入 Cloudflare 控制台 → **Access** → **Applications**
2. 创建新应用，选择 **Self-hosted**
3. 设置域名和路径（如：`your-domain.com/*`）
4. 配置访问策略，添加允许的用户或组
5. 系统会自动检测 Access JWT 并跳过自建登录

### 定时任务配置

在 Pages 项目 → Functions → Settings → Triggers → Cron triggers 添加：

```cron
0 3 * * *  # 每天 03:00 执行备份清理
```


</div>



## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

## 🙏 致谢

- [Cloudflare](https://cloudflare.com/) - 提供强大的边缘计算平台
- [React](https://reactjs.org/) - 优秀的 UI 框架
- [TailwindCSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [dnd-kit](https://dndkit.com/) - 现代化的拖拽库

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个 Star！**

[⬆ 回到顶部](#-nav)

</div>