// components/mobile/MobileStats.js
import { Users, Trophy, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import {
  MobilePageContainer,
  MobileTitle,
  MobileCard,
  MobileCollapsible
} from './common';

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
        <div className="space-y-2">
          {records.map((record, index) => (
            <div 
              key={record._id}
              className={`p-2 rounded ${
                index < 3 ? 'bg-purple-100 bg-opacity-50' : ''
              }`}
            >
              {/* 第一行：排名、用户名年龄性别、原始成绩 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${
                    index < 3 ? 'text-purple-600' : 'text-gray-600'
                  }`}>
                    #{index + 1}
                  </span>
                  <div>
                    <a 
                      href={`/users/${record.userId?._id || record.userId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {record.userName}
                    </a>
                    <span className="ml-1 text-sm text-gray-600">
                      ({record.gender === 'M' ? '男' : '女'} {record.age}岁)
                    </span>
                  </div>
                </div>
                <div>
                <span className="text-sm text-gray-600">
                  跑力成绩：
                </span>
                <span className="font-mono text-purple-600">
                  {formatTime(getTimeFromSeconds(record.adjustedSeconds))}
                </span>
                </div>
              </div>
    
              {/* 第二行：比赛信息和跑力成绩 */}
              <div className="flex items-center justify-between mt-1 text-sm">
                <span className="text-gray-600">
                  {record.raceId?.seriesId?.name} ({formatDate(record.raceId?.date)})
                </span>
                <span className="font-mono">
                 {formatTime(record.finishTime)}
                </span>
              </div>
            </div>
          ))}
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
          <div className="space-y-2">
            {records.map((record) => (
              <div key={record._id} className="p-2 rounded">
                {/* 第一行：用户名和成绩 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <a 
                      href={`/users/${record.userId?._id || record.userId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {record.userName}
                    </a>
                    <span className="ml-1 text-sm text-gray-600">
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
              <div className="text-center py-2 text-gray-500">
                暂无完赛记录
              </div>
            )}
          </div>
        );
      };

      const BQRunnersDisplay = ({ records }) => {
        console.log('BQ records:', records); // 添加调试日志
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
      
        const getBostonAgeGroup = (age) => {
          if (age <= 34) return '18-34';
          if (age <= 39) return '35-39';
          if (age <= 44) return '40-44';
          if (age <= 49) return '45-49';
          if (age <= 54) return '50-54';
          if (age <= 59) return '55-59';
          if (age <= 64) return '60-64';
          if (age <= 69) return '65-69';
          if (age <= 74) return '70-74';
          if (age <= 79) return '75-79';
          return '80+';
        };
      
        return (
          <div className="space-y-2">
            {records.map((record) => (
              <div key={record._id} className="p-2 rounded">
                {/* 第一行：用户名和成绩 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <a 
                      href={`/users/${record.userId?._id || record.userId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {record.userName}
                    </a>
                    <span className="ml-1 text-sm text-gray-600">
                      ({record.gender === 'M' ? '男' : '女'} {record.bostonAge}岁 / {getBostonAgeGroup(record.bostonAge)})
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
              <div className="text-center py-2 text-gray-500">
                暂无 BQ 成绩
              </div>
            )}
          </div>
        );
      };

// 主组件
export const MobileStats = ({ 
    stats, 
    topRecords, 
    ultraStats = { runners: 0, races: 0 },
    topAdjustedRecords = [],
    hundredMilers = [],  // 添加100英里完赛者属性
    bqRunners = []  // 添加 BQ 跑者属性
  }) => {
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
      <MobilePageContainer>
        <MobileTitle>2024年度风云榜</MobileTitle>
        
        <MobileCard icon={Users} color="blue">
          有 <span className="text-blue-600 font-bold">{safeStats.male.runners}</span> 位男跑者完赛
          <span className="text-blue-600 font-bold"> {safeStats.male.races}</span> 场马拉松
        </MobileCard>
  
        <MobileCard icon={Users} color="pink">
          有 <span className="text-pink-600 font-bold">{safeStats.female.runners}</span> 位女跑者完赛
          <span className="text-pink-600 font-bold"> {safeStats.female.races}</span> 场马拉松
        </MobileCard>
  
        <MobileCard icon={Users} color="yellow">
          有 <span className="text-yellow-600 font-bold">{safeUltraStats.runners}</span> 位跑者完赛
          <span className="text-yellow-600 font-bold"> {safeUltraStats.races}</span> 场超马越野赛
        </MobileCard>
  
        <MobileCollapsible
          icon={Trophy}
          title="2024马拉松男子最速 Top 10"
          color="blue"
        >
          <TopTenDisplay records={topRecords.male || []} gender="M" />
        </MobileCollapsible>
  
        <MobileCollapsible
          icon={Trophy}
          title="2024马拉松女子最速 Top 10"
          color="pink"
        >
          <TopTenDisplay records={topRecords.female || []} gender="F" />
        </MobileCollapsible>
  
        {/* 新增跑力榜展示 */}
        <MobileCollapsible
          icon={Zap}
          title="2024马拉松跑力最强 Top 10"
          color="purple"
        >
          <AdjustedTopTenDisplay records={topAdjustedRecords} />
        </MobileCollapsible>
  

      {/* 添加100英里完赛者展示 */}
      <MobileCollapsible
        icon={Trophy}
        title="2024百英里超级跑者"
        color="yellow"
      >
        <HundredMilersDisplay records={hundredMilers} />
      </MobileCollapsible>
    
      <MobileCollapsible
        icon={Trophy}
        title="2024马拉松BQ跑者"
        color="green" // 使用绿色主题
      >
        <BQRunnersDisplay records={bqRunners} />
      </MobileCollapsible>
    </MobilePageContainer>
  );
};