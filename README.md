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

## 📝 更新日志

### v1.2.0 (2025-10-22)

#### 🆕 新功能
- **书签导入导出**：支持 JSON 和 HTML 格式的书签导入导出
- **自动元数据获取**：自动获取网站标题、描述和图标
- **元数据 API**：新增 `/api/metadata` 端点用于获取网站元数据
- **导入导出 API**：新增 `/api/import` 和 `/api/export` 端点

#### 🔧 改进
- **移除默认分类**：新用户不再显示"默认"、"工作"、"学习"三个预设分类
- **空状态引导**：新用户首次访问时显示友好的引导界面，提供快捷操作入口
- **用户体验优化**：为自动获取功能添加反爬虫机制提醒
- **数据验证增强**：使用 Zod 进行更严格的数据验证
- **错误处理改进**：更好的错误提示和异常处理

#### 🐛 修复
- **导入功能修复**：修复 JSON 和 HTML 书签导入问题
- **数据一致性**：确保导入的数据正确保存到 KV 存储
- **分类 ID 映射**：修复导入时分类 ID 不一致的问题

#### 📚 技术改进
- **代码重构**：提取公共组件和自定义 Hook
- **类型安全**：完善 TypeScript 类型定义
- **性能优化**：优化数据获取和渲染逻辑
- **安全性增强**：改进 JWT 验证和 Cookie 安全设置

### v1.1.0 (2025-12-19)

#### 🆕 新功能
- **拖拽排序**：支持书签和分类的拖拽排序
- **备份恢复**：自动备份和手动恢复功能
- **权限管理**：公共/私密书签分类
- **响应式设计**：移动端适配优化

### v1.0.0 (2025-10-19)

#### 🎉 初始版本
- **基础书签管理**：添加、编辑、删除书签
- **分类管理**：创建和管理书签分类
- **用户认证**：JWT 登录系统
- **数据持久化**：Cloudflare KV 存储

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