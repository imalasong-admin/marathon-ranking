// components/desktop/DesktopStats.js
import { Users, Trophy } from 'lucide-react';

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
    <div className={`bg-${gender === 'M' ? 'blue' : 'pink'}-50 rounded-lg p-6`}>
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

export const DesktopStats = ({ stats, topRecords, ultraStats = { runners: 0, races: 0 } }) => {
    // 添加默认值，避免 undefined 错误
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
          <div className="bg-blue-50 rounded-lg p-6">
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
          <div className="bg-pink-50 rounded-lg p-6">
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
<div className="bg-yellow-50 rounded-lg p-6">
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

      {/* Top 10 展示 */}
      <div className="grid grid-cols-2 gap-8">
        <TopTenDisplay records={topRecords.male} gender="M" />
        <TopTenDisplay records={topRecords.female} gender="F" />
      </div>
    </div>
  );
};