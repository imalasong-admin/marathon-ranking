// components/mobile/MobileStatsPage.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trophy, Map, Timer, Award, Flag } from 'lucide-react';
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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
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

const StatsBarChart = ({ data }) => {
    return (
      <div style={{ 
        width: '100%', 
        height: `${Math.max(400, data.length * 25 + 51)}px`
      }}>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="state" 
              type="category"
              width={20}
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />
            <Bar 
              dataKey="total" 
              name="总数" 
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
  
  // 完赛人数统计图表
  const RunnersStatsChart = ({ stateStats }) => {
    const data = stateStats
      .filter(state => state.totalStats.runners > 0)
      .sort((a, b) => b.totalStats.runners - a.totalStats.runners)
      .map(state => ({
        state: state.region,
        total: state.totalStats.runners,
        male: state.maleStats.runners,
        female: state.femaleStats.runners
      }));
  
    return <StatsBarChart data={data} title="各州完赛人数统计" />;
  };
  
  // 完赛场次统计图表
  const RacesStatsChart = ({ stateStats }) => {
    const data = stateStats
      .filter(state => state.totalStats.races > 0)
      .sort((a, b) => b.totalStats.races - a.totalStats.races)
      .map(state => ({
        state: state.region,
        total: state.totalStats.races,
        male: state.maleStats.races,
        female: state.femaleStats.races
      }));
  
    return <StatsBarChart data={data} title="各州完赛场次统计" />;
  };
  
  // BQ统计图表
  const BQStatsChart = ({ stateStats }) => {
    const data = stateStats
      .filter(state => state.totalStats.bqCount > 0)
      .sort((a, b) => b.totalStats.bqCount - a.totalStats.bqCount)
      .map(state => ({
        state: state.region,
        total: state.totalStats.bqCount,
        male: state.maleStats.bqCount,
        female: state.femaleStats.bqCount
      }));
  
    return <StatsBarChart data={data} title="各州BQ达标统计" />;
  };
  
  // 平均成绩统计图表
  const AvgTimeStatsChart = ({ stateStats }) => {
    const data = stateStats
      .filter(state => state.totalStats.avgFinishTime > 0)
      .sort((a, b) => a.totalStats.avgFinishTime - b.totalStats.avgFinishTime)
      .map(state => ({
        state: state.region,
        total: state.totalStats.avgFinishTime / 60, // 转换为分钟
        male: state.maleStats.avgFinishTime / 60,
        female: state.femaleStats.avgFinishTime / 60
      }));
  
    return (
      <div style={{ 
        width: '100%', 
        height: `${Math.max(400, data.length * 25 + 51)}px`
      }}>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number"
              tickFormatter={(value) => `${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2, '0')}`}
            />
            <YAxis 
              dataKey="state" 
              type="category"
              width={20}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => `${Math.floor(value/60)}:${String(Math.floor(value%60)).padStart(2, '0')}`}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar 
              dataKey="total" 
              name="平均" 
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

<MobileCard className="bg-gradient-to-br from-blue-50 to-white p-2 mb-2 rounded-xl shadow-sm">
  <div className="flex items-start gap-3">
    <Trophy 
      size={24} 
      className="text-blue-600 flex-shrink-0 mt-1 drop-shadow-sm" 
    />
    <div className="space-y-2">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          2024年北美华人马拉松统计
        </h2>
        <div className="mt-1 space-y-1 text-sm">
          <div className="text-gray-700">
            共计<span className="font-medium mx-1">{stats.northAmerica.totalStats.runners}</span>人完赛
            <span className="font-medium mx-1">{stats.northAmerica.totalStats.races}</span>场全马，
            <span className="font-medium mx-1">{stats.northAmerica.totalStats.bqCount}</span>场BQ
          </div>
          <div className="flex flex-col px-4 gap-1 text-gray-600">
            <div>
              男子<span className="font-medium mx-1">{stats.northAmerica.maleStats.runners}</span>人完赛
              <span className="font-medium mx-1">{stats.northAmerica.maleStats.races}</span>场，
              <span className="font-medium mx-1">{stats.northAmerica.maleStats.bqCount}</span>场BQ
            </div>
            <div>
              女子<span className="font-medium mx-1">{stats.northAmerica.femaleStats.runners}</span>人完赛
              <span className="font-medium mx-1">{stats.northAmerica.femaleStats.races}</span>场，
              <span className="font-medium mx-1">{stats.northAmerica.femaleStats.bqCount}</span>场BQ
            </div>
            
          </div>
          <div className="text-gray-700">
          <p className="text-sm text-gray-600 mt-2 border-t border-blue-100 pt-2">
  共计{stats.ultraStats.runners}人完赛{stats.ultraStats.races}场超马越野赛，其中：
</p>
<p className="text-sm px-4 text-gray-600 mt-1">
  男子{stats.ultraStats.maleRunners}人完赛{stats.ultraStats.maleRaces}场，
</p>
<p className="text-sm px-4 text-gray-600 mt-1">
  女子{stats.ultraStats.femaleRunners}人完赛{stats.ultraStats.femaleRaces}场。
</p>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 border-t border-blue-100 pt-2">
      <p className="text-sm text-gray-600 mt-1">
        居住在北美地区的华人跑者是一个充满活力、积极向上的群体，活跃在全世界的马拉松和超马赛场。
        </p>
        <p className="text-sm text-gray-600 mt-1">
        请大家把完赛成绩加入统计，看看我们2024年度跑的怎么样！
        </p>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <button 
          onClick={() => window.location.href='/users/submit'}
          className="bg-blue-600 text-white px-6 py-1 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
        >
          提交成绩
        </button>
        
        <div className="text-xs text-right text-gray-500">
          统计数据最近更新时间：
          {new Date(stats.lastUpdated).toLocaleString('zh-CN', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  </div>
</MobileCard>
{/* 添加州统计图表 */}
<MobileCollapsible
        icon={Map}
        title="各州完赛人数统计"
        color="blue"
      >
        <RunnersStatsChart stateStats={stats.stateStats} />
      </MobileCollapsible>

      <MobileCollapsible
        icon={Flag}
        title="各州完赛场次统计"
        color="blue"
      >
        <RacesStatsChart stateStats={stats.stateStats} />
      </MobileCollapsible>

      <MobileCollapsible
        icon={Timer}
        title="各州平均成绩统计"
        color="blue"
      >
        <AvgTimeStatsChart stateStats={stats.stateStats} />
      </MobileCollapsible>

      <MobileCollapsible
        icon={Award}
        title="各州BQ达标统计"
        color="blue"
      >
        <BQStatsChart stateStats={stats.stateStats} />
      </MobileCollapsible>


    </MobilePageContainer>
  );
};