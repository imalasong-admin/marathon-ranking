# Marathon Ranking Project

马拉松成绩排行榜系统 - 一个用于记录和展示马拉松赛事成绩的在线平台。

## 📌 项目信息
- **在线访问**: https://marathon-ranking.vercel.app
- **GitHub**: https://github.com/imalasong-admin/marathon-ranking
- **当前版本**: 8f6be35

## ✨ 功能特性
- 🔐 **用户认证系统**
  - 用户注册与登录
  - 个人信息管理
  - 安全认证保护
- 📊 **成绩管理**
  - 个人成绩提交
  - 成绩记录验证
  - 历史成绩查看
- 📈 **数据展示**
  - 实时排行榜
  - 性别分组排名
  - 年龄分组统计

## 🛠 技术栈
- **前端框架**: Next.js + TailwindCSS
- **后端服务**: Next.js API Routes
- **数据存储**: MongoDB Atlas
- **用户认证**: NextAuth.js
- **项目部署**: Vercel

## ⚙️ 本地开发配置
1. **克隆项目**
```bash
git clone https://github.com/imalasong-admin/marathon-ranking.git
cd marathon-ranking
```

2. **安装依赖**
```bash
npm install
```

3. **环境变量配置**
创建 `.env.local` 文件并设置：
```env
MONGODB_URI=你的MongoDB连接串
NEXTAUTH_SECRET=你的密钥
NEXTAUTH_URL=http://localhost:3000
```

4. **启动开发服务器**
```bash
npm run dev
```

访问 http://localhost:3000 开始开发

## 🚀 部署流程
1. 代码推送到 main 分支
2. Vercel 自动触发部署
3. 部署完成后测试验证

## 📝 项目维护指南
### 代码管理规范
- 重要更改创建新分支
- 本地测试后再部署
- 提交信息清晰明确

### 数据库操作规范
- 本地环境先行测试
- 定期数据库备份
- 谨慎操作生产数据

### 功能测试规范
- 本地完整测试
- 部署后再次验证
- 保留测试记录

## 🔧 常见问题
### 部署问题
```bash
# 手动触发部署
git commit --allow-empty -m "Trigger Vercel deployment"
git push origin main

# 代码回滚
git reset --hard <commit-id>
git push -f origin main
```

## 📅 项目进度
- ✅ 项目基础设置
- ✅ 用户认证系统
- ✅ 成绩提交功能
- ✅ 排行榜显示
- 🚧 数据分析功能
- 🚧 用户档案页面

## 📮 联系方式
- **管理员**: imalasong2024@gmail.com
- **问题反馈**: [提交 Issue](https://github.com/imalasong-admin/marathon-ranking/issues)

## 🔄 新对话参考模板
```markdown
项目：Marathon Ranking
状态文档：[复制 PROJECT_STATUS.md 的内容]
本次目标：[描述要实现的功能]
```

## 📄 许可证
MIT License