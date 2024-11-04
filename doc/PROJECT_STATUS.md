# Marathon Ranking Project Status

## 当前版本信息
- 最新稳定版本: e1df740
- 最后更新: 2024-11-03
- 部署地址: https://marathon-ranking.vercel.app

## 最近完成的功能
1. ✅ 管理员权限系统（2024-11-03）
   - 管理员分级控制（超级管理员/普通管理员）
   - 管理员控制台实现
   - 用户权限管理
   - 用户锁定管理

2. ✅ 管理员功能详细说明
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

3. ✅ 个人中心功能（2024-11-02）
   - 实现用户个人中心页面
   - 个人成绩列表展示
   - 个人简介编辑功能
   - 用户权限控制

4. ✅ 排行榜功能增强（2024-11-01）
   - 实现用户名链接到个人中心
   - 优化比赛日期显示
   - 添加年龄组和性别筛选

5. ✅ 比赛管理功能（2024-10-30）
   - 创建 Race 模型
   - 实现比赛添加和选择
   - API 路由实现

6. ✅ 成绩记录优化（2024-10-30）
   - 移除冗余字段（性别和年龄）
   - 关联比赛信息
   - 优化数据结构

7. ✅ 用户注册功能（2024-10-25）
   - 添加性别字段
   - 注册后自动登录
   - 自动跳转到成绩提交页面

## 下一步计划
1. 待定

2. 🚧 数据展示优化
   - 添加数据导出功能
   - 优化移动端显示
   - 完善筛选功能

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
  proofUrl: String
}
```

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

## 环境配置
```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://marathon-ranking.vercel.app
```

## 每次新对话开始时复制：
```markdown
项目：Marathon Ranking
仓库：https://github.com/imalasong-admin/marathon-ranking
部署：https://marathon-ranking.vercel.app
状态：
✅ 最近完成：
- 管理员权限系统（分级控制、锁定功能）
- 个人中心功能（含简介编辑）
- 排行榜功能增强（用户链接和筛选）
- 比赛管理和成绩记录优化
- 用户注册和认证功能



本次目标：[描述要实现的功能]
```