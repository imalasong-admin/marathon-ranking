// components/mobile/MobileStats.js
import { Users, Trophy } from 'lucide-react';

// 移动端 TopTen 展示组件
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
    <div className={`bg-${gender === 'M' ? 'blue' : 'pink'}-50 rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={20} className={`text-${gender === 'M' ? 'blue' : 'pink'}-600`} />
        <h2 className="text-lg font-semibold">
          {gender === 'M' ? '2024马拉松男子最速 Top 10' : '2024马拉松女子最速 Top 10'}
        </h2>
      </div>
      <div className="space-y-2">
        {records.map((record, index) => (
          <div 
            key={record._id}
            className={`p-2 rounded ${
              index < 3 ? `bg-${gender === 'M' ? 'blue' : 'pink'}-100 bg-opacity-50` : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`font-bold ${
                index < 3 ? `text-${gender === 'M' ? 'blue' : 'pink'}-600` : 'text-gray-600'
              }`}>
                #{index + 1}
              </span>
              <a 
                href={`/users/${record.userId?._id || record.userId}`}
                className="text-blue-600 hover:underline flex-1"
              >
                {record.userName}
              </a>
              <span className="font-mono font-bold">
                {formatTime(record.finishTime)}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {record.raceId?.seriesId?.name} ({formatDate(record.raceId?.date)})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 主组件
export const MobileStats = ({ stats, topRecords, ultraStats = { runners: 0, races: 0 } }) => {
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
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-4">2024北美华人马拉松统计</h1>
      
      {/* 统计 */}
      <div className="bg-blue-50 rounded-lg p-2 mb-2">
        <div className="flex items-center gap-2 mb-3">
          <Users size={20} className="text-blue-600" />
          <div className="space-y-1">
         
            有 <span className="text-blue-600 font-bold">{stats.male.runners}</span> 位男跑者完赛 <span className="text-blue-600 font-bold">{stats.male.races}</span> 场马拉松
          
        </div>
        
        </div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={20} className="text-pink-600" />
          <div className="space-y-1">
            有 <span className="text-pink-600 font-bold">{stats.female.runners}</span> 位女跑者完赛 <span className="text-pink-600 font-bold">{stats.female.races}</span> 场马拉松
            </div>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <Users size={20} className="text-yellow-600" />
          <div className="space-y-1">
          
            有 <span className="text-yellow-600 font-bold">{ultraStats.runners}</span> 位跑者完赛 <span className="text-yellow-600 font-bold">{ultraStats.races}</span> 场超马越野赛
         
        </div>
        </div>
       
      </div>

      {/* 男子 Top 10 */}
      <TopTenDisplay records={topRecords.male} gender="M" />

      

      {/* 女子 Top 10 */}
      <TopTenDisplay records={topRecords.female} gender="F" />
 
    </div>

    
  );
};