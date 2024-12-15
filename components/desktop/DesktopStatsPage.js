import React, { useState } from 'react';
import { Trophy, Map, Users } from 'lucide-react';

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
      <StatItem label="平均成绩" value={formatTime(stats.avgFinishTime)} />
      <StatItem label="BQ达标" value={stats.bqCount} unit="人" />
      <StatItem label="3小时内" value={stats.sub3Count} unit="人" />
      <StatItem label="330内" value={stats.sub330Count} unit="人" />
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
  const [expandedTables, setExpandedTables] = useState({
    total: true,    // 默认展开总体统计
    male: false,    // 默认折叠男子统计
    female: false   // 默认折叠女子统计
  });

  const [sortConfig, setSortConfig] = useState({
    total: { key: 'totalStats.runners', direction: 'descending' },
    male: { key: 'maleStats.runners', direction: 'descending' },
    female: { key: 'femaleStats.runners', direction: 'descending' }
  });

  if (!stats) {
    return <div>暂无统计数据</div>;
  }

  const allRegions = stats.stateStats
  .filter(state => state.totalStats.runners > 0)
  .sort((a, b) => b.totalStats.runners - a.totalStats.runners);

  const toggleTable = (tableName) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const TableHeader = ({ title, bgColor, textColor, isExpanded, onClick }) => (
    <div
      className={`p-4 border-b ${bgColor} cursor-pointer flex justify-between items-center`}
      onClick={onClick}
    >
      <h2 className={`text-lg font-semibold ${textColor}`}>{title}</h2>
      <div className="text-gray-600">
        {isExpanded ? '收起 ▼' : '展开 ▶'}
      </div>
    </div>
  );

  const requestSort = (tableName, key) => {
    let direction = 'ascending';
    if (sortConfig[tableName].key === key && sortConfig[tableName].direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig(prev => ({
      ...prev,
      [tableName]: { key, direction }
    }));
  };

  const sortedRegions = (regions, key, direction) => {
    return regions.sort((a, b) => {
      const aValue = key.includes('avgFinishTime') ? a[key.split('.')[0]][key.split('.')[1]] : a[key.split('.')[0]][key.split('.')[1]];
      const bValue = key.includes('avgFinishTime') ? b[key.split('.')[0]][key.split('.')[1]] : b[key.split('.')[0]][key.split('.')[1]];
  
      if (direction === 'ascending') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const getSortIcon = (tableName, key) => {
    if (sortConfig[tableName].key === key) {
      return sortConfig[tableName].direction === 'ascending' ? '↑' : '↓';
    }
    return '';
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
{/* 标题和统计信息卡片 */}
<div className="mb-4">
  <h1 className="text-2xl font-semibold text-gray-900 mb-6">2024北美华人马拉松统计</h1>
  <div className="text-gray-700">
            
          </div>
          <div className="mt-6">
    <div className="text-gray-600 mb-4">
      居住在北美地区的华人跑者是一个充满活力、积极向上的群体，活跃在全世界的马拉松和超马赛场。
      请大家把完赛成绩加入统计，看看我们2024年度跑的怎么样！
    
    <div className="text-center">
      
      <button 
        onClick={() => window.location.href='/users/submit'}
        className="bg-blue-600 text-white px-10 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        提交成绩
      </button>
    </div>
    </div>
  </div>
  {/* 统计卡片区域 */}
  <div className="grid grid-cols-4 gap-4">
     {/* 马拉松统计 */}
     <div className="bg-blue-50 rounded-lg p-6">
      <div className="flex items-center gap-2 text-blue-600 mb-4">
        <Users size={20} />
        <h2 className="text-lg font-medium">马拉松</h2>
      </div>
      <div className="text-gray-600">
      共计<span className="font-medium mx-1">{stats.northAmerica.totalStats.runners}</span>人完赛
      <span className="font-medium mx-1">{stats.northAmerica.totalStats.races}</span>场全马
      </div>
      <div className="font-medium text-gray-600 mt-2">
        <div>平均完赛成绩 : {formatTime(stats.northAmerica.totalStats.avgFinishTime)} </div>
        <div>BQ : {stats.northAmerica.totalStats.bqCount}场</div>
        <div>Sub 300 : {stats.northAmerica.totalStats.sub3Count}场</div>
        <div>Sub 330 : {stats.northAmerica.totalStats.sub330Count}场</div>
      </div>
    </div>

    {/* 男子马拉松统计 */}
    <div className="bg-pink-50 rounded-lg p-6">
      <div className="flex items-center gap-2 text-blue-900 mb-4">
        <Users size={20} />
        <h2 className="text-lg font-medium">马拉松男子</h2>
      </div>
      <div className="text-gray-600">
        共计<span className="font-medium mx-1">{stats.northAmerica.maleStats.runners}</span>人完赛
        <span className="font-medium mx-1">{stats.northAmerica.maleStats.races}</span>场马拉松
      </div>
      <div className="font-medium text-gray-600 mt-2">
        <div>平均完赛成绩 : {formatTime(stats.northAmerica.maleStats.avgFinishTime)}</div>
        <div>BQ : {stats.northAmerica.maleStats.bqCount}场</div>
        <div>Sub 3 : {stats.northAmerica.maleStats.sub3Count}场</div>
        <div>Sub 330 : {stats.northAmerica.maleStats.sub330Count}场</div>
      </div>
    </div>

    {/* 女子马拉松统计 */}
    <div className="bg-yellow-50 rounded-lg p-6">
      <div className="flex items-center gap-2 text-pink-600 mb-4">
        <Users size={20} />
        <h2 className="text-lg font-medium">马拉松女子</h2>
      </div>
      <div className="text-gray-600">
        共计<span className="font-medium mx-1">{stats.northAmerica.femaleStats.runners}</span>人完赛
        <span className="font-medium mx-1">{stats.northAmerica.femaleStats.races}</span>场马拉松。
      </div>
      <div className="font-medium text-gray-600 mt-2">
        <div>平均完赛成绩 : {formatTime(stats.northAmerica.femaleStats.avgFinishTime)}</div>
        <div>BQ : {stats.northAmerica.femaleStats.bqCount}场</div>
        <div>Sub 3 : {stats.northAmerica.femaleStats.sub3Count}场</div>
        <div>Sub 330 : {stats.northAmerica.femaleStats.sub330Count}场</div>
      </div>
    </div>

    {/* 超马统计 */}
    <div className="bg-red-50 rounded-lg p-6">
      <div className="flex items-center gap-2 text-yellow-600 mb-4">
        <Users size={20} />
        <h2 className="text-lg font-medium">超马越野</h2>
      </div>
      <div className="text-gray-600">
        共计{stats.ultraStats.runners}人完赛{stats.ultraStats.races}场超马越野赛
      </div>
      <div className="font-medium text-gray-600 mt-2">
        <div>男子{stats.ultraStats.maleRunners}人完赛{stats.ultraStats.maleRaces}场</div>
        <div>女子{stats.ultraStats.femaleRunners}人完赛{stats.ultraStats.femaleRaces}场</div>
      </div>
    </div>
  </div>
      <div className="mt-2 text-sm text-right text-gray-500">
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

      {/* 统计表格 - 重新设计 */}
      <div className="space-y-6">
        {/* 总体统计 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <TableHeader
            title="总体统计"
            bgColor="bg-gray-50"
            textColor="text-gray-800"
            isExpanded={expandedTables.total}
            onClick={() => toggleTable('total')}
          />
          {expandedTables.total && (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left cursor-pointer" onClick={() => requestSort('total', 'region')}>地区 {getSortIcon('total', 'region')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('total', 'totalStats.runners')}>完赛人数 {getSortIcon('total', 'totalStats.runners')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('total', 'totalStats.races')}>完赛场次 {getSortIcon('total', 'totalStats.races')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('total', 'totalStats.avgFinishTime')}>平均成绩 {getSortIcon('total', 'totalStats.avgFinishTime')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('total', 'totalStats.bqCount')}>BQ达标 {getSortIcon('total', 'totalStats.bqCount')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('total', 'totalStats.sub3Count')}>Sub 3 {getSortIcon('total', 'totalStats.sub3Count')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('total', 'totalStats.sub330Count')}>Sub 330 {getSortIcon('total', 'totalStats.sub330Count')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedRegions(allRegions, sortConfig.total.key, sortConfig.total.direction).map((region, index) => (
                  region && (
                    <tr key={`total-${region.region}`} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">{region.region}</td>
                      <td className="px-6 py-3 text-center">{region.totalStats.runners}</td>
                      <td className="px-6 py-3 text-center">{region.totalStats.races}</td>
                      <td className="px-6 py-3 text-center">{formatTime(region.totalStats.avgFinishTime)}</td>
                      <td className="px-6 py-3 text-center">{region.totalStats.bqCount}</td>
                      <td className="px-6 py-3 text-center">{region.totalStats.sub3Count}</td>
                      <td className="px-6 py-3 text-center">{region.totalStats.sub330Count}</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 男子统计 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <TableHeader
            title="男子统计"
            bgColor="bg-blue-50"
            textColor="text-blue-800"
            isExpanded={expandedTables.male}
            onClick={() => toggleTable('male')}
          />
          {expandedTables.male && (
            <table className="w-full text-sm">
              <thead className="bg-blue-50/50">
                <tr>
                  <th className="px-6 py-3 text-left cursor-pointer" onClick={() => requestSort('male', 'region')}>地区 {getSortIcon('male', 'region')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('male', 'maleStats.runners')}>完赛人数 {getSortIcon('male', 'maleStats.runners')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('male', 'maleStats.races')}>完赛场次 {getSortIcon('male', 'maleStats.races')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('male', 'maleStats.avgFinishTime')}>平均成绩 {getSortIcon('male', 'maleStats.avgFinishTime')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('male', 'maleStats.bqCount')}>BQ达标 {getSortIcon('male', 'maleStats.bqCount')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('male', 'maleStats.sub3Count')}>Sub 3 {getSortIcon('male', 'maleStats.sub3Count')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('male', 'maleStats.sub330Count')}>Sub 330 {getSortIcon('male', 'maleStats.sub330Count')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedRegions(allRegions, sortConfig.male.key, sortConfig.male.direction).map((region, index) => (
                  region && (
                    <tr key={`male-${region.region}`} className="hover:bg-blue-50/30">
                      <td className="px-6 py-3 font-medium">{region.region}</td>
                      <td className="px-6 py-3 text-center">{region.maleStats.runners}</td>
                      <td className="px-6 py-3 text-center">{region.maleStats.races}</td>
                      <td className="px-6 py-3 text-center">{formatTime(region.maleStats.avgFinishTime)}</td>
                      <td className="px-6 py-3 text-center">{region.maleStats.bqCount}</td>
                      <td className="px-6 py-3 text-center">{region.maleStats.sub3Count}</td>
                      <td className="px-6 py-3 text-center">{region.maleStats.sub330Count}</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 女子统计 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <TableHeader
            title="女子统计"
            bgColor="bg-pink-50"
            textColor="text-pink-800"
            isExpanded={expandedTables.female}
            onClick={() => toggleTable('female')}
          />
          {expandedTables.female && (
            <table className="w-full text-sm">
              <thead className="bg-pink-50/50">
                <tr>
                  <th className="px-6 py-3 text-left cursor-pointer" onClick={() => requestSort('female', 'region')}>地区 {getSortIcon('female', 'region')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('female', 'femaleStats.runners')}>完赛人数 {getSortIcon('female', 'femaleStats.runners')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('female', 'femaleStats.races')}>完赛场次 {getSortIcon('female', 'femaleStats.races')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('female', 'femaleStats.avgFinishTime')}>平均成绩 {getSortIcon('female', 'femaleStats.avgFinishTime')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('female', 'femaleStats.bqCount')}>BQ达标 {getSortIcon('female', 'femaleStats.bqCount')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('female', 'femaleStats.sub3Count')}>Sub 3 {getSortIcon('female', 'femaleStats.sub3Count')}</th>
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('female', 'femaleStats.sub330Count')}>Sub 330 {getSortIcon('female', 'femaleStats.sub330Count')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedRegions(allRegions, sortConfig.female.key, sortConfig.female.direction).map((region, index) => (
                  region && (
                    <tr key={`female-${region.region}`} className="hover:bg-pink-50/30">
                      <td className="px-6 py-3 font-medium">{region.region}</td>
                      <td className="px-6 py-3 text-center">{region.femaleStats.runners}</td>
                      <td className="px-6 py-3 text-center">{region.femaleStats.races}</td>
                      <td className="px-6 py-3 text-center">{formatTime(region.femaleStats.avgFinishTime)}</td>
                      <td className="px-6 py-3 text-center">{region.femaleStats.bqCount}</td>
                      <td className="px-6 py-3 text-center">{region.femaleStats.sub3Count}</td>
                      <td className="px-6 py-3 text-center">{region.femaleStats.sub330Count}</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}