# Marathon Ranking 移动端开发标准文档
### 版本控制
- GitHub 仓库：https://github.com/imalasong-admin/marathon-ranking
- 最新稳定版本：[e10440a]
- 最后更新：2024-12-1

### 移动端适配的开发，应该保持适配方案一致性，以rankings.js为例：
   - 第一步: 创建rankings.js的桌面端组件 components/desktop/DesktopRankings.js
            直接复制现有的 rankings.js 的内容，只改组件名称
   - 第二步: 创建对应的移动端组件components/mobile/MobileRankings.js
            参考 MobileRankings.js 的结构
   - 第三步: 修改 rankings.js 并添加设备检测
            参考修改后的pages/rankings.js


## 一、设备检测与路由
1. 设备检测实现
```javascript
// lib/deviceDetection.js
import { useState, useEffect } from 'react';

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
};

export const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => setIsMobile(isMobileDevice());
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
};
```

2. 页面适配方案
```javascript
// pages/[page].js
const Page = () => {
  const isMobile = useDeviceDetection();
  return isMobile ? <MobileComponent /> : <DesktopComponent />;
};
```

## 二、移动端布局规范

### 1. 页面基础结构
```javascript
<div className="flex flex-col min-h-screen bg-gray-50">
  {/* 固定头部 */}
  <div className="sticky top-0 bg-white shadow-sm z-10 p-4">
    {/* 标题、搜索框等 */}
  </div>

  {/* 主内容区域 */}
  <div className="flex-1 p-4 space-y-2">
    {/* 内容列表 */}
  </div>
</div>
```
### 2. 导航栏结构
```javascript
// 导航栏布局
<nav className="bg-white shadow">
  <div className="px-4">
    <div className="flex justify-between items-center h-16">
      {/* 左侧区域 */}
      <div className="flex items-center">
        <button className="p-2">
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-2">当前页面标题</span>
      </div>

      {/* 右侧区域 */}
      <div className="flex items-center">
        {/* 根据登录状态显示不同内容 */}
        {session ? (
          <div className="flex items-center space-x-4">
            <a href="/user/profile">{用户名}</a>
            <button>退出</button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <a href="/login">登录</a>
            <a href="/register">注册</a>
          </div>
        )}
      </div>
    </div>
  </div>
  
  {/* 菜单内容 */}
  <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50">
    {/* 菜单选项 */}
  </div>
</nav>

### 2. 卡片布局标准
```javascript
<div className="bg-white rounded-lg shadow-sm overflow-hidden">
  {/* 主视图 - 网格布局 */}
  <div className="grid grid-cols-[2.5rem_1fr_2.5rem_4.5rem] items-center gap-1 px-4 py-3">
    {/* 四列布局：序号、标题、操作按钮、数据 */}
  </div>

  {/* 展开内容 */}
  {isExpanded && (
    <div className="px-4 pb-3 text-sm text-gray-600 border-t divide-y">
      {/* 分组信息 */}
    </div>
  )}
</div>
```

### 3. 间距规范
页面内边距：p-4
卡片间距：space-y-2
网格间隙：gap-1
文本间距：space-x-2/space-x-3
区块间隔：divide-y
导航栏高度：h-16
菜单宽度：w-64

## 三、交互设计规范

## 1.导航栏交互

汉堡菜单点击区域：p-2
菜单展开动画：transform transition-transform duration-200
遮罩层：bg-black bg-opacity-50
用户操作区域间距：space-x-4


### 2. 点击区域
- 最小可点击区域：w-6 h-6
- 按钮内边距：p-2
- 文字链接区域：px-2 py-1

### 3. 展开/收起交互
- 使用固定位置的展开按钮
- 展开内容使用边框分隔
- 信息分组显示

### 4. 状态显示
```javascript
// 验证状态图标
<CheckCircle 
  size={16} 
  className={`ml-1.5 shrink-0 ${
    record.verificationStatus === 'verified'
      ? 'text-green-500'
      : record.reportedBy?.length > 0
      ? 'text-red-500'
      : 'text-gray-400'
  }`}
/>
```

## 四、状态管理规范

### 1. 导航状态
// 菜单展开状态
const [isMenuOpen, setIsMenuOpen] = useState(false);

// 当前页面标题
const getCurrentTitle = () => {
  switch (router.pathname) {
    case '/rankings': return '马拉松成绩榜';
    case '/age-adjusted-rankings': return '马拉松跑力榜';
    case '/ultra-rankings': return '超马越野榜';
    default: return '马拉松成绩榜';
  }
};

// 路由监听
const router = useRouter();

### 2. 用户状态管理
// 会话状态
const { data: session } = useSession();

// 登录状态显示逻辑
{session ? (
  // 已登录显示
) : (
  // 未登录显示
)}

### 3. 列表渲染优化
- 使用唯一且稳定的 key
- 避免不必要的嵌套组件
- 合理使用 memo 组件

### 4. 展开状态管理
```javascript
const [expandedCard, setExpandedCard] = useState(null);
// 只展开一个卡片
const handleExpand = (id) => {
  setExpandedCard(expandedCard === id ? null : id);
};
```

### 4. 条件渲染优化
- 使用短路逻辑控制显示
- 避免不必要的条件判断嵌套
- 优先使用三元运算符

## 五、移动端特有功能

### 1. 搜索优化
- 固定头部搜索框
- 即时搜索响应
- 清晰的空结果提示

### 2. 简化的数据展示
- 主视图只显示核心信息
- 次要信息放入展开区域
- 使用图标表示状态

### 3. 交互反馈
- 点击状态样式
- 加载状态提示
- 错误信息展示

## 六、代码组织规范

### 1. 文件结构
```
/components
  /mobile
    /MobileNavbar.js        - 主导航栏组件
    /MobileNavMenu.js       - 菜单内容组件
    /MobileLayout.js
    /MobileRankings.js
    /MobileAgeAdjustedRankings.js
    /MobileUltraRankings.js
   --users
       /MobileUserProfile.js
     --[id]
         /MobileEditProfile.js   
  /desktop
    /DesktopNavbar.js
    /DesktopRankings.js
    /DesktopAgeAdjustedRankings.js
    /DesktopUltraRankings.js
   --users
       /DesktopUserProfile.js
     --[id]
         /MobileEditProfile.js  
```

### 2. 组件命名规范
- 移动端组件使用 Mobile 前缀
- 使用 PascalCase 命名组件
- 使用 camelCase 命名函数和变量

### 3. 样式组织
- 使用 Tailwind 工具类
- 遵循移动优先原则
- 避免自定义 CSS

## 七、测试和调试

### 1. 设备测试
- 使用 Chrome DevTools 的设备模拟器
- 测试不同尺寸设备
- 验证横竖屏显示

### 2. 性能测试
- 检查列表滚动性能
- 验证展开/收起动画流畅度
- 确认搜索响应速度

### 3. 兼容性测试
- 测试主流移动浏览器
- 验证触摸事件响应
- 确认字体显示效果

## 八、注意事项

1. 代码复用原则
   - 提取共用逻辑到 hooks
   - 保持数据处理逻辑一致
   - 共享类型定义和常量

2. 性能考虑
   - 避免频繁重渲染
   - 合理使用缓存数据
   - 优化列表渲染策略

3. 用户体验
   - 保持交互反馈及时
   - 提供清晰的视觉提示
   - 确保操作简单直观