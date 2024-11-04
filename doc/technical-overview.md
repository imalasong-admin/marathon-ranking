# Marathon Ranking 技术概览文档

## 1. 技术栈
### 核心框架
- Next.js: 13.4.19
- React: 18.2.0
- React DOM: 18.2.0

### 样式方案
- Tailwind CSS: 3.4.14
- PostCSS: 8.4.47 (用于处理 CSS)

### 数据库和认证
- MongoDB: 5.7.0
- Mongoose: 7.8.2
- Next-auth: 4.22.1
- bcryptjs: 2.4.3 (密码加密)

### 状态管理
- 使用 React 内置状态管理（useState, useContext）
- 未使用额外的状态管理库

### 表单处理
- 使用原生表单处理方式
- 未使用专门的表单处理库

## 2. 项目结构
```
/
├── .next/                  # Next.js 构建输出目录
│   ├── cache
│   ├── server
│   └── static
├── components/            # React 组件
│   └── Navbar.js         # 导航栏组件
├── lib/                  # 工具库
│   └── mongodb.js        # MongoDB 连接配置
├── models/               # 数据模型
│   ├── Race.js          # 比赛模型
│   ├── Record.js        # 记录模型
│   └── User.js          # 用户模型（新增管理员字段）
├── pages/               # 页面组件和 API 路由
│   ├── admin/          # 管理员相关页面（新增）
│   │   └── index.js    # 管理员控制台
│   ├── users/
│   │   └── [id].js     # 用户个人中心页面
│   ├── api/
│   │   ├── admin/      # 管理员 API（新增）
│   │   │   ├── users.js
│   │   │   ├── set-admin.js
│   │   │   └── toggle-lock.js
│   │   ├── auth/
│   │   │   ├── [...nextauth].js
│   │   │   └── register.js
│   │   ├── users/
│   │   │   └── [id]/
│   │   │       ├── index.js    # 获取用户信息
│   │   │       └── update.js   # 更新用户信息
│   │   ├── records/
│   │   │   ├── create.js
│   │   │   └── index.js
│   │   └── races.js
│   ├── _app.js
│   ├── index.js
│   ├── login.js        # 更新锁定状态处理
│   ├── rankings.js     # 更新过滤逻辑
│   ├── register.js
│   └── submit.js
├── styles/              # 样式文件
│   └── globals.css      # 全局样式
```

## 3. 数据模型
```javascript
// User Model（更新）
{
  name: String,
  email: String,
  password: String (hashed),
  birthDate: Date,
  gender: String (M/F),
  bio: {
    type: String,
    default: ''
  },
  isAdmin: {            // 新增管理员字段
    type: Boolean,
    default: false
  },
  isLocked: {           // 新增锁定字段
    type: Boolean,
    default: false
  },
  lockReason: {         // 新增锁定原因
    type: String,
    default: ''
  }
}

// Race Model
{
  name: String,
  date: Date,
  addedBy: ObjectId (ref: User)
}

// Record Model
{
  userId: ObjectId (ref: User),
  raceId: ObjectId (ref: Race),
  finishTime: {
    hours: Number,
    minutes: Number,
    seconds: Number
  },
  totalSeconds: Number,
  proofUrl: String,
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}
```

## 4. API 路由
### 用户认证
- POST /api/auth/register - 用户注册
- [...nextauth] - Next Auth 认证路由

### 管理员功能（新增）
- GET /api/admin/users - 获取用户列表
- POST /api/admin/set-admin - 设置管理员权限
- PATCH /api/admin/toggle-lock - 锁定/解锁用户

### 用户管理
- GET /api/users/[id] - 获取用户信息
- PATCH /api/users/[id]/update - 更新用户信息

### 比赛管理
- GET /api/races - 获取比赛列表
- POST /api/races - 添加新比赛

### 成绩管理
- GET /api/records - 获取成绩列表（更新过滤逻辑）
- POST /api/records/create - 提交新成绩

## 5. 权限控制机制
### 管理员等级（新增）
1. 超级管理员(admin)
   - 可以设置/取消其他用户的管理员权限
   - 可以锁定/解锁任何普通用户
   - 可以访问所有管理功能

2. 普通管理员
   - 可以锁定/解锁普通用户
   - 可以查看用户列表
   - 不能修改其他用户的管理员权限

### 访问控制
- 使用 Next Auth 中间件验证
- API 路由权限检查
- 页面级别的权限控制

## 6. 开发说明
1. 代码风格：
   - 使用 JavaScript (未使用 TypeScript)
   - 页面级组件位于 pages 目录
   - API 路由使用 Next.js API Routes 特性

2. 部署信息：
   - 部署平台：Vercel
   - 访问地址：https://marathon-ranking.vercel.app

3. 注意事项：
   - 权限检查：所有管理员API需要验证权限
   - 锁定状态：影响用户登录和排行榜显示
   - 数据关联：用户锁定状态影响相关数据展示
   - 环境变量：需要同步更新到 Vercel
   - 代码修改：需要重启开发服务器(npm run dev)

## 7. 版本控制
- GitHub 仓库：https://github.com/imalasong-admin/marathon-ranking
- 最新稳定版本：e1df740
- 最后更新：2024-11-03