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
│   └── User.js          # 用户模型
├── pages/               # 页面组件和 API 路由
│   ├── users/
│   │   └── [id].js      # 用户个人中心页面
│   ├── api/
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
│   ├── login.js
│   ├── rankings.js
│   ├── register.js
│   └── submit.js
├── styles/              # 样式文件
│   └── globals.css      # 全局样式
├── .env.local          # 本地环境变量
├── .gitignore          # Git 忽略配置
├── package.json        # 项目依赖配置
├── package-lock.json   # 依赖版本锁定
├── postcss.config.js   # PostCSS 配置
└── tailwind.config.js  # Tailwind CSS 配置
```

## 3. 数据模型
```javascript
// User Model
{
  name: String,
  email: String,
  password: String (hashed),
  birthDate: Date,
  gender: String (M/F),
  bio: {
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
- POST /api/auth/register - 用户注册
- GET /api/races - 获取比赛列表
- POST /api/races - 添加新比赛
- GET /api/records - 获取成绩列表
- POST /api/records/create - 提交新成绩
- GET /api/users/[id] - 获取用户信息
- PATCH /api/users/[id]/update - 更新用户信息

## 5. 配置文件
### tailwind.config.js
- 配置了页面和组件的样式处理范围
- 未添加额外的主题配置
- 未使用插件

### package.json
- 包含基本的 Next.js 开发和构建脚本
- 定义了项目依赖和版本

### 环境配置
```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://marathon-ranking.vercel.app
```

## 6. 开发说明
1. 代码风格：
   - 使用 JavaScript (未使用 TypeScript)
   - 页面级组件位于 pages 目录
   - API 路由使用 Next.js API Routes 特性

2. 部署信息：
   - 部署平台：Vercel
   - 访问地址：https://marathon-ranking.vercel.app

3. 注意事项：
   - 年龄计算：根据比赛日期计算参赛年龄
   - 环境变量：需要同步更新到 Vercel
   - 测试数据：需要维护合理的日期范围
   - 代码修改：需要重启开发服务器(npm run dev)使更改生效
   - 权限控制：用户只能编辑自己的个人资料

## 7. 版本控制
- GitHub 仓库：https://github.com/imalasong-admin/marathon-ranking
- 最新稳定版本：[新的commit号]
- 最后更新：2024-11-02