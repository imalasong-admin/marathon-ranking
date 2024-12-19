# Marathon Ranking 数据优化技术文档
Version: 1.0
Last Updated: 2024-12-16

### 优化实施的前提：谨慎细致，不影响优化页面的正常运行。
### 优化实施流程示例：
      文件结构:
      /pages
        /rankings.js           # 保持现有文件
        /rankings-v2.js        # 新版本
      /components
        /desktop
          /DesktopRankings.js      # 保持现有文件
          /DesktopRankings-v2.js   # 新版本
        /mobile  
          /MobileRankings.js       # 保持现有文件
          /MobileRankings-v2.js    # 新版本
      /api/records
          /index.js           # 保持现有文件
          /index-v2.js        # 新版本

      优点:
      - 代码清晰，没有复杂的条件判断
      - 可以完全独立开发和测试
      - 确认无误后直接替换文件名即可
      - 出问题可以快速回滚
      - 便于代码审查

      缺点:
      - 暂时会有重复代码(但最终会替换掉)

## 一、优化目标

### 1.1 核心目标
- 优化数据获取和处理流程
- 提升网站性能和响应速度
- 完善代码质量和可维护性

### 1.2 具体目标
1. 数据处理优化
   - 将数据筛选和排序迁移到数据库层面
   - 实现服务器端分页
   - 减少数据传输量

2. 代码质量提升
   - 清理测试代码
   - 规范化代码注释
   - 优化工具函件的使用

## 二、优化范围
      优化目标顺序
      1 马拉松完赛榜移动端桌面端(Rankings)
      2 马拉松实力榜移动端桌面端(age-adjusted-rankings)
      3 马拉松BQ榜移动端桌面端(bq-rankings)
      4 超马越野榜移动端桌面端(ultra-rankings)
      5 统计相关(Stats)(StatsPages)

### 2.1 核心文件
- `/pages/api/records/index.js`（主要修改）
- `/pages/rankings.js`
- `/components/mobile/MobileRankings.js`
- `/components/desktop/DesktopRankings.js`

- `/pages/age-adjusted-rankings.js`
- `/components/mobile/MobileAgeAdjustedRankings.js`
- `/components/desktop/DesktopAgeAdjustedRankings.js`

- `/pages/bq-rankings.js`
- `/components/mobile/MobileBQRankings.js`
- `/components/desktop/DesktopBQRankings.js`

### 2.2 相关工具文件
- `/lib/ageFactors.js`
- `/lib/ageUtils.js`
- `/lib/auth.js`
- `/lib/bqStandards.js`
- `/lib/deviceDetection.js`
- `/lib/rateLimiter.js`
- `/lib/timeUtils.js`
- `/lib/urlUtils.js`
- `/lib/statsService.js`
- `/lib/statsUtils.js`
- `/lib/email.js`
- `/lib/Mongodb.js`
- `/lib/styles.js`
- `/lib/us-cities-data.js`

## 三、API改造方案

### 3.1 records/index.js 改造
```javascript
// 添加查询参数支持
const {
  page = 1,
  pageSize = 100,
  ranking = 'marathon', // marathon/bq/adjusted
  year = 2024,
  gender
} = req.query;

// 基础查询条件
const baseQuery = {
  'raceId.seriesId.raceType': '全程马拉松',
  'raceId.date': {
    $gte: new Date(`${year}-01-01`),
    $lte: new Date(`${year}-12-31`)
  }
};

// 榜单特定查询
if (ranking === 'bq') {
  baseQuery.isBQ = true;
}
if (gender) {
  baseQuery['userId.gender'] = gender;
}

// 榜单排序规则
const sortOptions = {
  marathon: { totalSeconds: 1 },
  bq: { bqDiff: -1 },
  adjusted: { adjustedSeconds: 1 }
}[ranking];

// 计算总数
const total = await Record.countDocuments(baseQuery);

// 获取分页数据
const records = await Record.find(baseQuery)
  .sort(sortOptions)
  .skip((page - 1) * pageSize)
  .limit(pageSize)
  .populate([...]) // 保持现有的 populate 设置
```

### 3.2 API 返回格式
```javascript
{
  success: true,
  data: {
    records: [], // 记录数据
    pagination: {
      total,     // 总记录数
      page,      // 当前页
      pageSize,  // 每页大小
      totalPages: Math.ceil(total / pageSize)
    }
  }
}
```

## 四、前端改造方案

### 4.1 通用改造
- 移除前端的数据筛选逻辑
- 使用API提供的分页数据
- 保持现有的展示逻辑

### 4.2 示例代码
```javascript
// rankings.js 示例
const [records, setRecords] = useState([]);
const [pagination, setPagination] = useState({});

const fetchRecords = async (page = 1) => {
  const res = await fetch(
    `/api/records?ranking=marathon&page=${page}&pageSize=100`
  );
  const data = await res.json();
  if (data.success) {
    setRecords(data.data.records);
    setPagination(data.data.pagination);
  }
};
```

## 五、工具函数优化

### 5.1 复用现有工具
- 使用 timeUtils.js 处理时间相关计算
- 使用 ageFactors.js 处理年龄相关计算
- 使用 bqStandards.js 处理BQ相关逻辑

### 5.2 代码注释规范
```javascript
/**
 * 函数名称
 * @description 功能描述
 * @param {Type} paramName - 参数说明
 * @returns {Type} 返回值说明
 * @example
 * // 使用示例
 * const result = functionName(param);
 */
```

## 六、实施步骤

### 6.1 准备工作
1. 代码审查
   - 识别临时测试代码
   - 检查已有工具函数
   - 评估数据库索引需求

### 6.2 实施顺序
1. API改造
   - 实现基础分页功能
   - 添加榜单特定查询
   - 优化数据库查询

2. 前端改造
   - 马拉松榜改造并测试
   - 实力榜改造并测试
   - BQ榜改造并测试

3. 收尾工作
   - 清理测试代码
   - 补充代码注释
   - 更新技术文档


## 八、注意事项

### 8.1 数据库性能
- 添加必要的索引
- 监控查询性能
- 避免大量数据查询

### 8.2 代码维护
- 删除注释掉的测试代码
- 不保留未使用的变量
- 确保错误处理完整

### 8.3 兼容性
- 保持API向后兼容
- 保留关键日志记录
- 考虑极端场景处理

## 九、验收标准

### 9.1 功能验收
- [x] 各榜单数据正确
- [x] 分页功能正常
- [x] 筛选条件有效

### 9.2 性能验收
- [x] 响应时间提升50%以上
- [x] 数据传输量减少70%以上
- [x] 服务器负载降低

### 9.3 代码质量
- [x] 无冗余代码
- [x] 注释完整规范
- [x] 工具函数复用