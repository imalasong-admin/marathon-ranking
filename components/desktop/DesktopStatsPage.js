// components/desktop/DesktopStatsPage.js
import React from 'react';
import { Trophy, Map } from 'lucide-react';

const StatItem = ({ label, value, unit = '' }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
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

const StatsPanel = ({ title, stats }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    <div className="space-y-3">
      <StatItem label="完赛人数" value={stats.runners} unit="人" />
      <StatItem label="完赛场次" value={stats.races} unit="场" />
      //<StatItem label="平均年龄" value={stats.avgAge.toFixed(1)} unit="岁" />
      <StatItem label="平均成绩" value={formatTime(stats.avgFinishTime)} />
      <StatItem label="BQ达标" value={stats.bqCount} unit="人" />
      <StatItem label="3小时内" value={stats.sub3Count} unit="人" />
      <StatItem label="3:30内" value={stats.sub330Count} unit="人" />
    </div>
  </div>
);

const RegionStats = ({ region, stats }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center gap-2 mb-6">
      <Map className="text-blue-600" size={24} />
      <h2 className="text-xl font-semibold text-gray-900">{region}</h2>
    </div>
    <div className="grid grid-cols-3 gap-6">
      <StatsPanel title="总体统计" stats={stats.totalStats} />
      <StatsPanel title="男子统计" stats={stats.maleStats} />
      <StatsPanel title="女子统计" stats={stats.femaleStats} />
    </div>
  </div>
);

export const DesktopStatsPage = ({ stats }) => {
    if (!stats) {
      return <div>暂无统计数据</div>;
    }
  
    // 先处理北美整体数据和各州数据
    const allRegions = [
      { region: 'North America', ...stats.northAmerica },
      ...stats.stateStats
        .filter(state => state.totalStats.runners > 0)
        .sort((a, b) => b.totalStats.runners - a.totalStats.runners)
    ];
  
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* 标题和更新时间 */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <Trophy size={24} className="text-blue-600 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">2024年北美华人马拉松统计</h1>
              <p className="text-gray-600 mt-2">
                统计数据更新时间：
                {new Date(stats.lastUpdated).toLocaleString('zh-CN', {
                  year: 'numeric', month: 'numeric', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
  

 
        {/* 统计表格 */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">地区</th>
                  <th className="px-4 py-3 text-left">完赛人数</th>
                  <th className="px-4 py-3 text-left">完赛场次</th>
                  <th className="px-4 py-3 text-left">平均成绩</th>
                  <th className="px-4 py-3 text-left">BQ人数</th>
                  <th className="px-4 py-3 text-left">Sub 3</th>
                  <th className="px-4 py-3 text-left">Sub 3:30</th>
                </tr>
              </thead>
              
              <tbody className="divide-y">
                
                {allRegions.map((region, index) => (
                  <tr key={region.region} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{region.region}</td>
                    <td className="px-4 py-3">
                      {region.totalStats.runners} [M{region.maleStats.runners} F{region.femaleStats.runners}]
                    </td>
                    <td className="px-4 py-3">
                      {region.totalStats.races} [M{region.maleStats.races} F{region.femaleStats.races}]
                    </td>
                    <td className="px-4 py-3">
                      {formatTime(region.totalStats.avgFinishTime)} 
                      [M{formatTime(region.maleStats.avgFinishTime)} 
                       F{formatTime(region.femaleStats.avgFinishTime)}]
                    </td>
                    <td className="px-4 py-3">
                      {region.totalStats.bqCount} [M{region.maleStats.bqCount} F{region.femaleStats.bqCount}]
                    </td>
                    <td className="px-4 py-3">
                      {region.totalStats.sub3Count} [M{region.maleStats.sub3Count} F{region.femaleStats.sub3Count}]
                    </td>
                    <td className="px-4 py-3">
                      {region.totalStats.sub330Count} [M{region.maleStats.sub330Count} F{region.femaleStats.sub330Count}]
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };