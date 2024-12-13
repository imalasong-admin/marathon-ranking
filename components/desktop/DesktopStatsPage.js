import React, { useState } from 'react';
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

  // 先处理北美整体数据和各州数据
  const allRegions = [
    { region: 'North America', ...stats.northAmerica },
    ...stats.stateStats
      .filter(state => state.totalStats.runners > 0)
      .sort((a, b) => b.totalStats.runners - a.totalStats.runners)
  ];

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
    const naRegion = regions.find(region => region.region === 'North America');
    const otherRegions = regions.filter(region => region.region !== 'North America');

    const sortedOtherRegions = otherRegions.sort((a, b) => {
      const aValue = key.includes('avgFinishTime') ? a[key.split('.')[0]][key.split('.')[1]] : a[key.split('.')[0]][key.split('.')[1]];
      const bValue = key.includes('avgFinishTime') ? b[key.split('.')[0]][key.split('.')[1]] : b[key.split('.')[0]][key.split('.')[1]];

      if (direction === 'ascending') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return [naRegion, ...sortedOtherRegions];
  };

  const getSortIcon = (tableName, key) => {
    if (sortConfig[tableName].key === key) {
      return sortConfig[tableName].direction === 'ascending' ? '↑' : '↓';
    }
    return '';
  };

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
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('total', 'totalStats.sub330Count')}>Sub 3:30 {getSortIcon('total', 'totalStats.sub330Count')}</th>
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
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('male', 'maleStats.sub330Count')}>Sub 3:30 {getSortIcon('male', 'maleStats.sub330Count')}</th>
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
                  <th className="px-6 py-3 text-center cursor-pointer" onClick={() => requestSort('female', 'femaleStats.sub330Count')}>Sub 3:30 {getSortIcon('female', 'femaleStats.sub330Count')}</th>
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