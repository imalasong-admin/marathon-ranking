// components/mobile/MobileStats.js
import { Users, Trophy } from 'lucide-react';
import { useState } from 'react';  // 添加这行导入
import { ChevronDown, ChevronUp } from 'lucide-react';

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

  );
};

// 主组件
export const MobileStats = ({ stats, topRecords, ultraStats = { runners: 0, races: 0 } }) => {
    const [isMaleTop10Expanded, setIsMaleTop10Expanded] = useState(false);
    const [isFemaleTop10Expanded, setIsFemaleTop10Expanded] = useState(false);
    
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
    <div className="p-2">
      
      {/* 统计信息 */}
      <div className="bg-blue-50 rounded-lg p-2 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Users size={20} className="text-blue-600" />
          <div className="space-y-1">
            有 <span className="text-blue-600 font-bold">{safeStats.male.runners}</span> 位男跑者完赛 <span className="text-blue-600 font-bold">{safeStats.male.races}</span> 场马拉松
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Users size={20} className="text-pink-600" />
          <div className="space-y-1">
            有 <span className="text-pink-600 font-bold">{safeStats.female.runners}</span> 位女跑者完赛 <span className="text-pink-600 font-bold">{safeStats.female.races}</span> 场马拉松
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-1">
          <Users size={20} className="text-yellow-600" />
          <div className="space-y-1">
            有 <span className="text-yellow-600 font-bold">{safeUltraStats.runners}</span> 位跑者完赛 <span className="text-yellow-600 font-bold">{safeUltraStats.races}</span> 场超马越野赛
          </div>
        </div>
      </div>

      {/* 男子 Top 10 */}
      <div className="mb-4">
        <div className="flex items-center bg-blue-50 rounded-t-lg p-3">
          <Trophy size={20} className="text-blue-600 mr-2" />
          <span className="flex-grow font-medium">2024马拉松男子最速 Top 10</span>
          <button
            onClick={() => setIsMaleTop10Expanded(!isMaleTop10Expanded)}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-blue-100 rounded-full"
          >
            {isMaleTop10Expanded ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </div>
        <div 
          className={`bg-blue-50 rounded-b-lg transition-all duration-300 ease-in-out overflow-hidden ${
            isMaleTop10Expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {isMaleTop10Expanded && <TopTenDisplay records={topRecords.male || []} gender="M" />}
        </div>
      </div>

      {/* 女子 Top 10 */}
      <div className="mb-4">
        <div className="flex items-center bg-pink-50 rounded-t-lg p-3">
          <Trophy size={20} className="text-pink-600 mr-2" />
          <span className="flex-grow font-medium">2024马拉松女子最速 Top 10</span>
          <button
            onClick={() => setIsFemaleTop10Expanded(!isFemaleTop10Expanded)}
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-pink-100 rounded-full"
          >
            {isFemaleTop10Expanded ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </div>
        <div 
          className={`bg-pink-50 rounded-b-lg transition-all duration-300 ease-in-out overflow-hidden ${
            isFemaleTop10Expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {isFemaleTop10Expanded && <TopTenDisplay records={topRecords.female || []} gender="F" />}
        </div>
      </div>
    </div>
  );
};