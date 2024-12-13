import { Users, Trophy, Zap } from 'lucide-react';
import { formatTime } from '../../lib/timeUtils';
import { formatBQTimeDiff } from '../../lib/bqStandards';
import { useState } from 'react';

// 桌面端 TopTen 展示组件
const TopTenDisplay = ({ records, gender }) => {
  const formatTime = (time) => {
    if (!time) return '-';
    return `${time.hours}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch (error) {
      return '-';
    }
  };

  return (
    <div className={`bg-${gender === 'M' ? 'blue' : 'pink'}-50 rounded-lg p-6 shadow-md`}>
      <div className="flex items-center gap-3 mb-4">
        <Trophy size={20} className={`text-${gender === 'M' ? 'blue' : 'pink'}-600`} />
        <h2 className="text-xl font-semibold">
          {gender === 'M' ? '2024男子最速 Top 10' : '2024女子最速 Top 10'}
        </h2>
      </div>
      <div className="divide-y">
        {records.map((record, index) => (
          <div
            key={record._id}
            className={`py-3 ${index < 3 ? `bg-${gender === 'M' ? 'blue' : 'pink'}-100 bg-opacity-50 -mx-6 px-6` : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold ${
                  index < 3 ? `text-${gender === 'M' ? 'blue' : 'pink'}-600` : 'text-gray-500'
                }`}>
                  #{index + 1}
                </span>
                <a
                  href={`/users/${record.userId?._id || record.userId}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {record.userName}
                </a>
              </div>
              <span className="font-mono font-bold text-lg">
                {formatTime(record.finishTime)}
              </span>
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {record.raceId?.seriesId?.name} ({formatDate(record.raceId?.date)})
              {record.state && record.city && (
                <span className="ml-2">
                  [{record.state} - {record.city}]
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 新增 AdjustedTopTenDisplay 组件
const AdjustedTopTenDisplay = ({ records }) => {
  const formatTime = (time) => {
    if (!time) return '-';
    return `${time.hours}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch (error) {
      return '-';
    }
  };

  const getTimeFromSeconds = (seconds) => {
    if (!seconds) return null;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return { hours, minutes, seconds: remainingSeconds };
  };

  return (
    <div className="bg-purple-50 rounded-lg p-6 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <Zap size={20} className="text-purple-600" />
        <h2 className="text-xl font-semibold">2024马拉松跑力最强 Top 10</h2>
      </div>
      <div className="divide-y">
        {records.map((record, index) => (
          <div
            key={record._id}
            className={`py-3 ${index < 3 ? 'bg-purple-100 bg-opacity-50 -mx-6 px-6' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`text-lg font-bold ${
                  index < 3 ? 'text-purple-600' : 'text-gray-500'
                }`}>
                  #{index + 1}
                </span>
                <div>
                  <a
                    href={`/users/${record.userId?._id || record.userId}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {record.userName}
                  </a>
                  <span className="ml-2 text-sm text-gray-600">
                    ({record.gender === 'M' ? '男' : '女'} {record.age}岁)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">原始成绩: {formatTime(record.finishTime)}</div>
                <div className="font-mono font-bold text-lg text-purple-600">
                  跑力值: {formatTime(getTimeFromSeconds(record.adjustedSeconds))}
                </div>
              </div>
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {record.raceId?.seriesId?.name} ({formatDate(record.raceId?.date)})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HundredMilersDisplay = ({ records }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch (error) {
      return '-';
    }
  };

  const formatTime = (time) => {
    if (!time) return '-';
    return `${time.hours}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  };

  return (
    <div className="bg-yellow-50 rounded-lg p-6 shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <Trophy size={20} className="text-yellow-600" />
        <h2 className="text-xl font-semibold">2024百英里完赛跑者</h2>
      </div>
      <div className="divide-y">
        {records.map((record) => (
          <div key={record._id} className="py-3">
            {/* 第一行：用户名和成绩 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <a
                  href={`/users/${record.userId?._id || record.userId}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {record.userName}
                </a>
                <span className="text-sm text-gray-600">
                  ({record.gender === 'M' ? '男' : '女'} {record.age}岁)
                </span>
              </div>
              <span className="font-mono font-bold">
                {formatTime(record.finishTime)}
              </span>
            </div>
            {/* 第二行：比赛信息 */}
            <div className="text-sm text-gray-600 mt-1">
              {record.raceId?.seriesId?.name} ({formatDate(record.raceId?.date)})
            </div>
          </div>
        ))}
        {records.length === 0 && (
          <div className="py-3 text-center text-gray-500">
            暂无完赛记录
          </div>
        )}
      </div>
    </div>
  );
};

export const DesktopStats = ({
  stats,
  topRecords,
  ultraStats,
  topAdjustedRecords,
  hundredMilers,
  bqTopRecords
}) => {
  const [expandedSections, setExpandedSections] = useState({
    maleTop10: true,
    femaleTop10: true,
    adjustedTop10: false,
    bqTop10: false,
    hundredMilers: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch (error) {
      return '-';
    }
  };

  const safeStats = {
    male: { runners: 0, races: 0 },
    female: { runners: 0, races: 0 },
    ...stats
  };

  const safeUltraStats = {
    runners: 0,
    races: 0,
    ...ultraStats
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">2024北美华人马拉松统计</h1>
        <div className="grid grid-cols-3 gap-8">
          {/* 男子统计 */}
          <div className="bg-blue-50 rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Users size={24} className="text-blue-600" />
              <h2 className="text-xl font-semibold">马拉松男子</h2>
            </div>
            <div className="text-lg space-y-2">
              <p>
                共有 <span className="text-blue-600 font-bold">{stats.male.runners}</span> 位男跑者累计完赛 <span className="text-blue-600 font-bold">{stats.male.races}</span> 场马拉松
              </p>
            </div>
          </div>

          {/* 女子统计 */}
          <div className="bg-pink-50 rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Users size={24} className="text-pink-600" />
              <h2 className="text-xl font-semibold">马拉松女子</h2>
            </div>
            <div className="text-lg space-y-2">
              <p>
                共有 <span className="text-pink-600 font-bold">{stats.female.runners}</span> 位女跑者累计完赛 <span className="text-pink-600 font-bold">{stats.female.races}</span> 场马拉松
              </p>
            </div>
          </div>

          {/* 超马越野 */}
          <div className="bg-yellow-50 rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Users size={24} className="text-yellow-600" />
              <h2 className="text-xl font-semibold">超马越野赛</h2>
            </div>
            <div className="text-lg space-y-2">
              <p>
                共有 <span className="text-yellow-600 font-bold">{safeUltraStats.runners}</span> 位跑者累计完赛 <span className="text-yellow-600 font-bold">{safeUltraStats.races}</span> 场超马越野赛
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 按行排列的 Top 10 展示 */}
      <div className="space-y-8">
        {/* 男子 Top 10 */}
        <div className="bg-blue-50 rounded-lg p-6 shadow-md">
            
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('maleTop10')}>
         
          <Trophy size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold">2024男子最速 Top 10</h2>
         
            <span>{expandedSections.maleTop10 ? '收起 ▲' : '展开 ▼'}</span>
          </div>
          {expandedSections.maleTop10 && <TopTenDisplay records={topRecords.male} gender="M" />}
        </div>

        {/* 女子 Top 10 */}
        <div className="bg-pink-50 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('femaleTop10')}>
          <Trophy size={24} className="text-pink-600" />
            <h2 className="text-xl font-semibold">2024女子最速 Top 10</h2>
            <span>{expandedSections.femaleTop10 ? '收起 ▲' : '展开 ▼'}</span>
          </div>
          {expandedSections.femaleTop10 && <TopTenDisplay records={topRecords.female} gender="F" />}
        </div>

        {/* 跑力榜单独占一行 */}
        <div className="bg-purple-50 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('adjustedTop10')}>
          <Zap size={24} className="text-purple-600" />
            <h2 className="text-xl font-semibold">2024马拉松跑力最强 Top 10</h2>
            <span>{expandedSections.adjustedTop10 ? '收起 ▲' : '展开 ▼'}</span>
          </div>
          {expandedSections.adjustedTop10 && <AdjustedTopTenDisplay records={topAdjustedRecords} />}
        </div>

        {/* 在 AdjustedTopTenDisplay 后添加 BQ Top10 */}
        <div className="bg-green-50 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('bqTop10')}>
            <h2 className="text-xl font-semibold">2024马拉松BQ Top 10</h2>
            <span>{expandedSections.bqTop10 ? '收起 ▲' : '展开 ▼'}</span>
          </div>
          {expandedSections.bqTop10 && (
            <div className="divide-y">
              {bqTopRecords.map((record, index) => (
                <div
                  key={record._id}
                  className={`py-3 ${index < 3 ? 'bg-green-100 bg-opacity-50 -mx-6 px-6' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-bold ${
                        index < 3 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        #{index + 1}
                      </span>
                      <div>
                        <a
                          href={`/users/${record.userId?._id || record.userId}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {record.userName}
                        </a>
                        <span className="ml-2 text-sm text-gray-600">
                          ({record.gender === 'M' ? '男' : '女'} {record.bostonAge}岁)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-lg">
                        {formatTime(record.finishTime)}
                      </div>
                      <div className="text-sm text-green-600">
                        {formatBQTimeDiff(record.bqDiff)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {record.raceId?.seriesId?.name} ({formatDate(record.raceId?.date)})
              
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 新增100英里完赛者展示 */}
        <div className="bg-yellow-50 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('hundredMilers')}>
          <Trophy size={24} className="text-yellow-600" />
            <h2 className="text-xl font-semibold">2024百英里完赛跑者</h2>
            <span>{expandedSections.hundredMilers ? '收起 ▲' : '展开 ▼'}</span>
          </div>
          {expandedSections.hundredMilers && <HundredMilersDisplay records={hundredMilers} />}
        </div>
      </div>
    </div>
  );
};
