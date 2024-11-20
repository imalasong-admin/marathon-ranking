
# Marathon Ranking Project
马拉松成绩排行榜系统 - 一个用于记录和展示马拉松赛事成绩的在线平台。# Marathon Ranking 技术概览文档

## 项目开发规范和注意事项

### 1. 代码修改原则
- 在修改代码前，必须先完整阅读和理解现有代码
- 保持项目的一致性，不随意改变已有的结构
- 尊重项目的设计模式，特别是路由结构

### 2. 路由结构说明
- API路由设计采用一致的模式
- 用户相关API统一在 users/[id] 目录下
- API调用路径需要匹配文件结构
  例如：用户密码修改
  - API文件位置：/pages/api/users/[id]/change-password.js
  - 调用路径：/api/users/${id}/change-password

### 3. 开发经验教训
✘ 错误做法：
- 不理解现有代码就开始修改
- 试图改变已证明可行的结构
- 武断地认为某种模式是错误的

✓ 正确做法：
- 先阅读和理解现有代码
- 遵循项目已有的设计模式
- 保持项目的一致性和连续性
- 在修改前确认问题的真正原因

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

## Resend 邮件服务
### 新增依赖
- Resend: ^1.0.0 (邮件服务)

## 2. 项目结构
```
/
├── .next/                  # Next.js 构建输出目录
├── components/            # React 组件
│   └── Navbar.js         # 导航栏组件
│   └── VerificationAlert.js # 验证码提醒
├── lib/                  # 工具库
│   └── mongodb.js        # MongoDB 连接配置
│   └── email.js         # 邮件服务工具
├── models/               # 数据模型
│   ├── Race.js          # 场次模型
│   ├── Record.js        # 记录模型
│   ├── Series.js         # 赛事模型
│   └── User.js          # 用户模型
├── pages/               # 页面组件和 API 路由
│   ├── index.js        # 默认首页
│   ├── rankings.js     # 马拉松排行榜页面
│   ├── ultra-rankings.js # 超马排行榜页面
│   ├── verify-email.js # 邮箱验证页面
│   ├── reset-password.js # 重置密码
│   ├── _app_.js        # 应用入口 
│   ├── login.js        # 登录页面
│   └── register.js     # 注册页面
│   ├── users/
│   │   ├── [id].js    # 用户个人中心页面
│   │   └── submit.js  # 分步骤提交页面
│   │   └── ultra-submit.js # 超马成绩提交页面
│   ├── admin/         # 管理员页面
│   │   ├── index.js        # 用户管理
│   │   ├── series.js       # 赛事管理
│   │   ├── races.js        # 场次管理
│   │   └── records.js      # 成绩管理（新增）
│   └── api/          # API 路由
│       ├── admin/    # 管理员API
│       ├── auth/     # 认证相关
│       ├── races/    # 场次管理
│       ├── records/  # 成绩记录
│       └── users/    # 用户管理
│       └── series/   # 赛事管理
├── public/           # 静态资源
└── styles/          # 样式文件
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
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockReason: {
    type: String,
    default: ''
  },
  emailVerified: {
    type: Boolean,
    default: true  // 旧用户默认已验证
  },
  verificationCode: {
    type: String,
    length: 4
  },
  verificationExpires: {
    type: Date
  }
}

// Race Model（更新）
{
  seriesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {             // 新增
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}

 // Series Model（新增）
const seriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  raceType: {
    type: String,
    required: true,
    enum: ['全程马拉松', '超马']
  },
  location: String,
  website: String,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {             // 新增
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Record Model（更新）
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  raceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Race',
    required: true
  },
  finishTime: {
    hours: Number,
    minutes: Number,
    seconds: Number
  },
  totalSeconds: Number,
  proofUrl: String,
  ultraDistance: {
    type: String,
    enum: ['50K', '50M', '100K', '100M', '计时赛', '多日赛', '其他距离'],
    required: function() {
      return this.raceId?.raceType === '超马';
    }
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedCount: {
    type: Number,
    default: 0
  },
  verifiedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  }],
  reportedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: Date,
    reason: String
  }]
}
```
## 日期处理规范
1. 数据库存储
- 所有日期统一使用 UTC 时间存储
- 存储时统一设置为当天的 12:00:00（UTC）
- 示例：date: "2024-02-01T12:00:00.000Z"

2. API 处理
- POST/PUT 请求时：date + 'T12:00:00.000Z'
- 示例：
```javascript
const adjustedDate = new Date(date + 'T12:00:00.000Z');

3. 前端显示
- 统一使用 UTC 时区显示
- 使用标准格式化函数：
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC'
    });
  } catch (error) {
    return '-';
  }
};

## 4. API 路由
### 用户认证
- POST /api/auth/register - 用户注册
- [...nextauth] - Next Auth 认证路由

### 验证相关
- POST /api/auth/verify-email - 验证邮箱验证码
- POST /api/auth/forgot-password - 发送重置验证码
- POST /api/auth/verify-reset-code - 验证重置验证码
- POST /api/auth/reset-password - 重置密码

### 管理员功能（新增）
- GET /api/admin/users - 获取用户列表
- POST /api/admin/set-admin - 设置管理员权限
- PATCH /api/admin/toggle-lock - 锁定/解锁用户

### 用户管理
- GET /api/users/[id] - 获取用户信息（包含验证状态）
- PATCH /api/users/[id]/update - 更新用户信息
- POST /api/users/[id]/change-password - 修改密码


### 成绩管理
- GET /api/records - 获取成绩列表
- POST /api/records/create - 提交新成绩
- POST /api/records/[id]/verify - 验证/举报成绩

### 赛事管理

GET /api/series - 获取赛事列表
POST /api/series - 添加赛事
GET /api/series/[id] - 获取单个赛事
PUT /api/series/[id] - 更新赛事

### 场次管理

POST /api/races - 添加场次
GET /api/races - 获取场次列表
PUT /api/races/[id] - 更新场次（更新：支持修改关联赛事）
PATCH /api/races/[id]/toggle-lock - 切换锁定状态

### 成绩管理 - 编辑成绩/删除成绩
PUT /api/admin/records/[id]
Request:
{
  raceId: string,
  hours: number,
  minutes: number,
  seconds: number,
  totalSeconds: number,
  proofUrl: string
}
Response:
{
  success: boolean,
  record: Record, // 包含关联的用户和比赛信息
  message: string
}

// 删除成绩记录
DELETE /api/admin/records/[id]
Response:
{
  success: boolean,
  message: string
}

## 5. 权限控制机制
### 管理员等级
1. 超级管理员(admin)
   - 可以设置/取消其他用户的管理员权限
   - 可以锁定/解锁任何普通用户
   - 可以访问所有管理功能

2. 普通管理员
   - 可以锁定/解锁普通用户
   - 可以查看用户列表
   - 不能修改其他用户的管理员权限

### 成绩验证规则
1. 验证权限控制
   - 用户不能验证自己的记录
   - 不能重复验证同一记录
   - 被锁定用户无法进行验证

2. 验证状态管理
   - pending: 待验证（默认）
   - verified: 已验证
   - rejected: 已拒绝

### 访问控制
- 使用 Next Auth 中间件验证
- API 路由权限检查
- 页面级别的权限控制

## 6. 开发说明
1. 代码风格：
   - 使用 JavaScript
   - 页面级组件位于 pages 目录
   - API 路由使用 Next.js API Routes
   - 复用组件和逻辑避免重复代码

2. 部署信息：
   - 部署平台：Vercel
   - 访问地址：https://marathon-ranking.vercel.app

3. 注意事项：
   - 权限检查：所有管理员API需要验证权限
   - 锁定状态：影响用户登录和排行榜显示
   - 数据关联：用户锁定状态影响相关数据展示
   - 环境变量：需要同步更新到 Vercel
   - 代码修改：需要重启开发服务器(npm run dev)
   - 不同入口：成绩提交流程有不同限制
   - 类型字段：比赛类型和验证状态字段处理需要特别注意

4. 验证相关说明
   - 成绩验证为非强制性功能
   - 验证状态会影响成绩显示
   - 举报功能需要管理员及时处理
   - 验证记录需要完整保存

## 7. 版本控制
- GitHub 仓库：https://github.com/imalasong-admin/marathon-ranking
- 最新稳定版本：[9df781e]
- 最后更新：2024-11-17