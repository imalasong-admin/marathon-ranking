# Marathon Ranking 项目资源使用及监控指南

## ⚠️ 重要说明
本项目现阶段严格使用免费资源，不使用任何付费服务。任何需要付费的功能或服务都需要项目负责人的明确批准。

## 服务使用情况

### 1. Vercel 托管
#### 免费额度
- 带宽：100GB/月
- 构建时间：100 小时/月
- 无服务器函数执行：100GB-小时/月
- 团队成员：最多 1 人
- 自动 HTTPS/SSL
- 持续部署

#### 付费触发点
- 超过任何以上限制
- 需要添加团队成员
- 需要更多自定义域名
- 需要企业级功能（如SAML SSO）

#### 监控方法
1. 登录 Vercel 控制台
2. 查看 Usage 页面中的：
   - Bandwidth Usage
   - Build Minutes
   - Serverless Function Execution
3. 设置邮件通知，在接近限制时收到提醒

### 2. MongoDB Atlas (M0 免费版)
#### 免费额度
- 存储空间：512MB
- 共享 RAM
- 每个集群最多 100 连接
- 基本备份功能
- 共享集群资源

#### 付费触发点
- 数据存储超过 512MB
- 需要专用资源（不共享）
- 需要更多并发连接
- 需要高级备份功能
- 需要特定地区的服务器

#### 监控方法
1. 登录 MongoDB Atlas
2. 在集群概览页面查看：
   - 数据存储使用量
   - 连接数
   - 操作数统计
3. 定期检查数据增长趋势

### 3. Next.js 框架
- 完全免费（开源软件）
- 无使用限制
- 无需监控额度

## 月度检查清单
每月初进行以下检查：

1. Vercel 使用量
- [ ] 检查带宽使用量
- [ ] 检查构建时间
- [ ] 检查函数执行情况

2. MongoDB Atlas 使用量
- [ ] 检查数据库大小
- [ ] 检查连接数峰值
- [ ] 检查性能指标

## 预警机制
1. 当任何服务达到免费额度的 80% 时：
   - 通知开发团队
   - 评估增长趋势
   - 制定应对策略

2. 触发预警时的处理流程：
   - 立即停止非必要的资源消耗
   - 评估是否需要数据清理
   - 考虑优化方案
   - 必要时请求提高限额审批

## 避免意外收费
1. 确保不要：
   - 创建任何 AWS 服务
   - 升级到付费版本
   - 启用额外功能

2. 定期检查：
   - 所有服务的账单
   - 使用量统计
   - 服务配置

3. 保持警惕：
   - 仔细阅读所有升级提示
   - 不随意点击"升级"或"试用"按钮
   - 对任何可能产生费用的操作进行二次确认

## 项目扩展建议
如果项目需要扩展，请按以下优先级考虑：
1. 优化现有资源使用
2. 在免费额度内寻找替代方案
3. 仅在必要时提出付费服务申请

## 文档更新记录
- 2024-11-03：初始版本
- [未来更新记录...]