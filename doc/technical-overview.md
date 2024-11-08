# Marathon Ranking 技术概览文档

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
│   └── VerificationAlert.js         # 验证码提醒
├── lib/                  # 工具库
│   └── mongodb.js        # MongoDB 连接配置
│   └── email.js         # 邮件服务工具
├── models/               # 数据模型
│   ├── Race.js          # 比赛模型（已更新字段）
│   ├── Record.js        # 记录模型
│   └── User.js          # 用户模型
├── pages/               # 页面组件和 API 路由
│   ├── index.js        # 新增：默认首页
│   ├── rankings.js     # 马拉松排行榜页面
│   ├── ultra-rankings.js # 新增：超马排行榜页面
│   ├── submit.js       # 原始提交页面（rankings.js使用。2024年、全程马拉松限定）
│   ├── verify-email.js  # 邮箱验证页面
│   ├── reset-password.js         # 重置密码
│   ├── _app_.js         # 
│   ├── login.js         # 登录
│   └── registerr.js         # 注册
│   ├── users/
│   │   ├── [id].js    # 用户个人中心页面
│   │   └── submit.js  # 新增：分步骤提交页面（用户个人中心使用）
│   │   └── ultra-submit.js  # 新增：分步骤提交页面(ultra-ranking.js使用。2024年、非全程马拉松限定)
│   ├── admin/         # 管理员相关页面
│   │   └── index.js   # 管理员控制台
│   └── api/          # API 路由
│       ├── admin/    # 管理员API
│       ├── auth/     # 认证相关
│       ├── races/    # 比赛管理
│       ├── records/  # 成绩记录
│       └── users/    # 用户管理
├── public/           # 静态资源
│   └── images/      # 新增：图片资源目录
│       └── logo.png # 网站 logo
├── styles/          # 样式文件
└── scripts/         # 新增：脚本目录
└── migrations/  # 数据迁移脚本

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
  name: String,
  date: Date,
  raceType: {
    type: String,
    required: true,
    enum: ['全程马拉松', '超马']
  },
  location: String,        
  website: String,         
  addedBy: ObjectId (ref: User)
}

// Record Model（更新）
{
  userId: ObjectId (ref: User),
  raceId: ObjectId (ref: Race),
  finishTime: {
    hours: Number,
    minutes: Number,
    seconds: Number
  },
  totalSeconds: Number,
  proofUrl: String,  // 选填
  ultraDistance: {    // 更新了验证规则
    type: String,
    enum: ['50K', '50M', '100K', '100M', '计时赛', '多日赛', '其他距离'],
    required: function() {
      return this.raceId?.raceType === '超马';
    }
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
     新增 ultraDistance 字段，用于记录超马项目类型

### 验证邮箱验证码
- POST /api/auth/verify-email - 验证邮箱验证码

### 身份验证相关：
- /api/auth/forgot-password - 发送重置验证码
- /api/auth/verify-reset-code - 验证重置验证码
- /api/auth/reset-password - 重置密码

### 密码管理：
- 修改密码：/api/users/[id]/change-password
- 重置密码：/api/auth/reset-password



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
   - 新增：不同入口的提交流程有不同限制
   - 新增：比赛类型字段的处理需要特别注意
4. 未来扩展考虑：
   - 预留多语言支持
   - 考虑响应式设计
   - 保持代码结构的可扩展性

5. 邮箱验证机制
   1. 验证流程：
   - 新用户注册时生成4位验证码
   - 发送验证邮件
   - 24小时内完成验证
   - 验证成功需重新登录

  2. 开发环境：
   - 验证码统一发送到测试邮箱
   - 测试邮箱：imalasong2024@gmail.com
   - 允许重复注册测试
   - 完整日志记录

  3. 生产环境：
   - 严格邮箱唯一性检查
   - 真实邮箱验证
   - 额度监控

## 7. 版本控制
- GitHub 仓库：https://github.com/imalasong-admin/marathon-ranking
- 最新稳定版本：340adc7
- 最后更新：2024-11-06