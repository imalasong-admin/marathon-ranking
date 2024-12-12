// components/mobile/MobileStatsPage.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, Map } from 'lucide-react';
import {
  MobilePageContainer,
  MobileTitle,
  MobileCard,
  MobileCollapsible
} from './common';

const StatItem = ({ label, value, unit = '' }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium">
      {value}
      {unit && <span className="text-gray-500 ml-1">{unit}</span>}
    </span>
  </div>
);

const formatTime = (seconds) => {
    if (!seconds) return '-';
    
    // 计算时分秒
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
  
    // 格式化，确保分钟和秒钟都是两位数
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

const StatsSection = ({ title, stats }) => (
  <div className="space-y-3">
    <h3 className="font-medium text-gray-900">{title}</h3>
    <div className="bg-white rounded-lg p-4 space-y-2">
      <StatItem label="完赛人数" value={stats.runners} unit="人" />
      <StatItem label="完赛场次" value={stats.races} unit="场" />
     
      <StatItem label="平均成绩" value={formatTime(stats.avgFinishTime)} />
      <StatItem label="BQ达标" value={stats.bqCount} unit="人" />
      <StatItem label="3小时内" value={stats.sub3Count} unit="人" />
      <StatItem label="3:30内" value={stats.sub330Count} unit="人" />
    </div>
  </div>
);

const RegionStats = ({ region, stats }) => (
  <MobileCollapsible
    icon={Map}
    title={region}
    color="blue"
  >
    <div className="space-y-4">
      <StatsSection title="总体统计" stats={stats.totalStats} />
      <StatsSection title="男子统计" stats={stats.maleStats} />
      <StatsSection title="女子统计" stats={stats.femaleStats} />
    </div>
  </MobileCollapsible>
);
// 新增州统计图表组件
const StateStatsChart = ({ stateStats }) => {
    const chartData = stateStats
      .filter(state => state.totalStats.runners > 0)
      .sort((a, b) => b.totalStats.runners - a.totalStats.runners)
      .map(state => ({
        state: state.region,
        total: state.totalStats.runners,
        male: state.maleStats.runners,
        female: state.femaleStats.runners
      }));
  
    // 不再使用 MobileCard，改为直接返回图表内容
    return (
      <div style={{ 
        width: '100%', 
        height: `${Math.max(400, chartData.length * 25 + 51)}px`
      }}>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
          >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="state" 
                type="category"
                width={5}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Bar 
                dataKey="total" 
                name="总人数" 
                fill="#6366f1"
                fillOpacity={0.8}
                barSize={16}
              />
              <Bar 
                dataKey="male" 
                name="男子" 
                fill="#22c55e"
                fillOpacity={0.9}
                barSize={10}
              />
              <Bar 
                dataKey="female" 
                name="女子" 
                fill="#eab308"
                fillOpacity={1}
                barSize={10}
              />
        </BarChart>
      </ResponsiveContainer>
    </div>

    );
  };
  
export const MobileStatsPage = ({ stats }) => {
  if (!stats) {
    return (
      <MobilePageContainer>
        <div className="text-center py-8 text-gray-500">
          暂无统计数据
        </div>
      </MobilePageContainer>
    );
  }

  return (
    <MobilePageContainer>
      <MobileCard className="bg-blue-50 p-4 mb-4">
        <div className="flex items-start gap-2">
          <Trophy size={20} className="text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-medium text-gray-900">2024年北美华人马拉松统计</h2>
            <p className="text-sm text-gray-600 mt-1">
                共计{stats.northAmerica.totalStats.runners}人完赛{stats.northAmerica.totalStats.races}场全马，
{stats.northAmerica.totalStats.bqCount}场BQ。其中：
</p>
            <p className="text-sm text-gray-600 mt-1">
男子{stats.northAmerica.maleStats.runners}人完赛{stats.northAmerica.maleStats.races}场，
{stats.northAmerica.maleStats.bqCount}场BQ。
</p>
            <p className="text-sm text-gray-600 mt-1">
女子{stats.northAmerica.femaleStats.runners}人完赛{stats.northAmerica.femaleStats.races}场，
{stats.northAmerica.femaleStats.bqCount}场BQ。
</p>
<p className="text-sm text-gray-600 mt-2">
    请居住在北美地区的华人跑者加入统计数据，让数字说话：我们是一个充满活力，积极向上的族裔。
</p>
<p className="text-sm text-gray-600 mt-2">
<a 
      href="/users/submit" 
      className="bg-blue-600 text-white px-5 py-1 rounded-md hover:bg-blue-700 transition-colors"
    > {/* 增加按钮的水平内边距 */}
      提交成绩
    </a>
    </p>
            <p className="text-sm text-gray-600 mt-1">
              统计数据最近更新时间：
              {new Date(stats.lastUpdated).toLocaleString('zh-CN', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            
          </div>
        </div>
        
      </MobileCard>
{/* 添加州统计图表 */}
<MobileCollapsible
        icon={Map}
        title="各州完赛人数统计"
        color="blue"
      >
        <StateStatsChart stateStats={stats.stateStats} />
      </MobileCollapsible>

      {/* 北美整体统计 */}
      <RegionStats
        region="北美整体统计"
        stats={stats.northAmerica}
      />

      {/* 各州统计数据 */}
      <div className="space-y-4 mt-4">
        {stats.stateStats
          .filter(state => state.totalStats.runners > 0)
          .sort((a, b) => b.totalStats.runners - a.totalStats.runners)
          .map((state) => (
            <RegionStats
              key={state.region}
              region={state.region}
              stats={state}
            />
          ))}
      </div>
    </MobilePageContainer>
  );
};