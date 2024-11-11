# Marathon Ranking Project Status

## 当前版本信息
- 最新稳定版本: [新的commit id]
- 最后更新: 2024-11-11
- 部署地址: https://marathon-ranking.vercel.app

## 最近完成的功能
✅ 个人中心优化（2024-11-11）
  - 显示用户生日替代年龄
  - 修改密码改为折叠式显示
  - 优化成绩链接的显示和交互

✅ 成绩验证功能（2024-11-11）
  - 其他用户可验证比赛成绩
  - 显示验证人数和状态
  - 防止重复验证和自验证
  - 完整的数据持久化

✅ 个人中心修改密码功能（2024-11-08）
  - 个人中心添加密码修改模块
  - 修改成功后自动退出登录
  - API：/api/users/[id]/change-password

✅ 忘记密码功能（2024-11-08）
  - 登录页添加忘记密码入口
  - 邮箱验证码验证
  - 密码重置流程
  - 开发环境验证码处理优化

✅ 项目规范强化/开发规范更新（2024-11-08）
  - 明确路由结构规范
  - 添加代码修改原则
  - 总结开发经验教训

     ## 注意事项
       1. 代码修改必须遵循项目的一致性原则
       2. 特别注意动态路由[id]的结构设计
       3. API调用路径需要匹配文件结构
       4. 修改前必须理解现有代码

✅ 邮箱验证功能（2024-11-08）
  - 新用户注册需要验证邮箱
  - 验证码 24 小时有效期
  - 未验证用户显示顶部验证提示
  - 验证成功后需重新登录
  - 旧用户默认已验证

✅ 开发调试优化（2024-11-08）
  - 开发环境邮件统一发送到测试邮箱
  - 开发环境允许重复注册测试

 ✅ 成绩展示和提交优化（2024-11-06）
   - 个人中心比赛成绩列表增加项目列显示
   - 马拉松成绩项目直接显示"26.2英里"
   - 超马成绩显示具体项目类型
   - 修复马拉松成绩提交时的验证问题
   - 优化了数据返回和展示逻辑

 ✅ 数据模型优化（2024-11-05）
   - 简化比赛类型为全程马拉松和超马两类
   - Record模型增加ultraDistance字段
   - 完成数据迁移工作

 ✅ 数据模型优化（2024-11-05）
   - 简化比赛类型为全程马拉松和超马两类
   - Record模型增加ultraDistance字段
   - 完成数据迁移工作

✅ 提交入口优化（2024-11-05）
   - 优化个人中心提交入口
   - 简化超马成绩提交流程
   - 改进提交后的跳转逻辑

✅ 榜单展示优化（2024-11-05）
   - 优化超马榜单展示方式
   - 提升榜单加载性能
   - 改进数据处理逻辑
✅ 页面架构优化（2024-11-05）
   - 新增独立首页
   - 分离 rankings 和首页功能
   - 更新导航栏 logo 为图片

✅ 超马榜单开发（2024-11-05）
   - 创建超马排行榜页面
   - 实现2024年超马成绩展示
   - 添加超马成绩提交入口

✅ 成绩提交流程优化（2024-11-05）
   - 创建分步骤提交界面
   - 实现比赛类型和年份选择
   - 区分不同入口的默认设置
     - ranking页面点击提交成绩默认2024年、全程马拉松
     - ultra-ranking页面点击提交成绩默认2024年、非全程马拉松
     - users页面点击提交成绩选择10个年份、全部比赛类型

✅ 比赛管理功能增强（2024-11-05）
   - 添加比赛类型字段（必填）
   - 增加地点和官网字段（选填）
   - 优化数据结构和验证

✅ 管理员权限系统（2024-11-03）
   - 管理员分级控制（超级管理员/普通管理员）
   - 管理员控制台实现
   - 用户权限管理
   - 用户锁定管理

✅ 管理员功能详细说明
   A. 超级管理员(admin)权限：
   - 设置/取消其他用户的管理员权限
   - 锁定/解锁用户账号
   - 查看所有用户信息
   
   B. 普通管理员权限：
   - 锁定/解锁普通用户
   - 查看用户列表
   
   C. 用户锁定机制：
   - 锁定用户时可设置原因
   - 被锁定用户无法登录
   - 被锁定用户的成绩在排行榜隐藏
   - 解锁后自动恢复所有功能

 ✅ 个人中心功能（2024-11-02）
   - 实现用户个人中心页面
   - 个人成绩列表展示
   - 个人简介编辑功能
   - 用户权限控制

 ✅ 排行榜功能增强（2024-11-01）
   - 实现用户名链接到个人中心
   - 优化比赛日期显示
   - 添加年龄组和性别筛选

 ✅ 比赛管理功能（2024-10-30）
   - 创建 Race 模型
   - 实现比赛添加和选择
   - API 路由实现

 ✅ 成绩记录优化（2024-10-30）
   - 移除冗余字段（性别和年龄）
   - 关联比赛信息
   - 优化数据结构

✅ 用户注册功能（2024-10-25）
   - 添加性别字段
   - 注册后自动登录
   - 自动跳转到成绩提交页面



## 数据模型
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

// Race Model
{
  name: String,
  date: Date,
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

// Race Model 更新
{
  name: String,
  date: Date,
  raceType: {
    type: String,
    required: true,
    enum: [
      '全程马拉松','超马']
  },
  location: String,
  website: String,
  addedBy: ObjectId (ref: User)
}

## API 路由
- POST /api/auth/register - 用户注册
- GET /api/races - 获取比赛列表
- POST /api/races - 添加新比赛
- GET /api/records - 获取成绩列表
- POST /api/records/create - 提交新成绩
- GET /api/users/[id] - 获取用户信息
- PATCH /api/users/[id]/update - 更新用户信息
- POST /api/admin/set-admin - 设置管理员权限
- PATCH /api/admin/toggle-lock - 锁定/解锁用户
- GET /api/admin/users - 获取用户列表
- POST /api/records/create - 提交新成绩（更新字段）
       新增 ultraDistance 字段，用于记录超马项目类
- POST /api/auth/verify-email - 验证邮箱验证码
用户相关API：
  - /api/users/[id]/change-password：用户修改密码
auth相关API：
  - /api/auth/forgot-password：发送重置验证码
  - /api/auth/verify-reset-code：验证重置验证码
  - /api/auth/reset-password：重置密码

## 注意事项
1. 管理员权限控制
   - 只有 admin 账号可以管理管理员权限
   - 管理员账号不能被锁定
   - 不能修改 admin 账号的权限
2. 用户锁定影响
   - 对排行榜显示有影响
   - 对用户登录状态有影响
3. 数据安全
   - 需要定期备份用户权限数据
   - 谨慎使用锁定功能
4. 年龄计算逻辑：根据比赛日期计算参赛年龄
5. 环境变量配置需要同步更新到 Vercel
6. 测试数据需要维护合理的日期范围
7. 代码修改后需要重启开发服务器（npm run dev）
8. 用户资料编辑需要进行权限控制
9. 比赛类型数据处理
    - rankings.js 中旧数据默认显示为马拉松类型
    - 此逻辑须保留到数据迁移完成
    - 后续优化需确保所有记录有正确的比赛类型
10. 提交入口差异
    - rankings 页面：限定2024年马拉松
    - ultra-rankings 页面：限定2024年非马拉松
    - 个人中心：自由选择年份和类型

11. Resend 邮件服务
# 免费额度
- 每月100封邮件
- 开发环境统一发送到测试邮箱
- 基本邮件功能支持

# 监控方法
1. 登录 Resend 控制台
2. 查看邮件发送统计
3. 监控发送量接近限制

# 避免超额
1. 开发环境使用测试邮箱
2. 生产环境谨慎使用
3. 设置额度提醒


### 环境配置
```.env.local
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://marathon-ranking.vercel.app
RESEND_API_KEY=your_api_key（邮件服务密钥）
```

## 每次新对话开始时复制：
项目：Marathon Ranking
仓库：https://github.com/imalasong-admin/marathon-ranking
部署：https://marathon-ranking.vercel.app
状态：

