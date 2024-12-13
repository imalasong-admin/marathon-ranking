// components/mobile/MobileStats.js
import { Users, Trophy, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import {
  MobilePageContainer,
  MobileTitle,
  MobileCard,
  MobileCollapsible
} from './common';
import { formatTime } from '../../lib/timeUtils';
import { formatBQTimeDiff } from '../../lib/bqStandards';

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
                      ({record.gender === 'M' ? 'M' : 'F'}{record.age})
                    </span>
                  </div>
                </div>
                <div>
               
                <span className="font-mono text-purple-600">
                  {formatTime(getTimeFromSeconds(record.adjustedSeconds))}
                </span>
                </div>
              </div>
    
              {/* 第二行：比赛信息和成绩 */}
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
                      ({record.gender === 'M' ? 'M' : 'F'}{record.age})
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

      const BQTopTenDisplay = ({ records }) => {
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
                  index < 3 ? 'bg-green-100 bg-opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${
                      index < 3 ? 'text-green-600' : 'text-gray-600'
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
                        ({record.gender === 'M' ? 'M' : 'F'}{record.bostonAge})
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
            <div className="font-mono font-bold">
              {formatTime(record.finishTime)}
            </div>
            <div className="text-xs text-green-600">
              {formatBQTimeDiff(record.bqDiff)}
            </div>
          </div>
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
export const MobileStats = ({ 
    stats, 
    topRecords, 
    ultraStats = { runners: 0, races: 0 },
    topAdjustedRecords = [],
    hundredMilers = [],
    bqTopRecords
  }) => {
    const safeStats = {
      male: { runners: 0, races: 0 },
      female: { runners: 0, races: 0 },
      ...stats
    };
  
  
  
    return (
      <MobilePageContainer>
        {/* 添加总体统计信息卡片 */}



        <MobileCollapsible
          icon={Trophy}
          title="2024马拉松男子最速 Top 10"
          color="blue"
        >
          <TopTenDisplay records={topRecords.male || []} gender="M" />
        
          <br className="mt-1" />
<div className="text-sm sm:text-base font-medium text-gray-800 text-right">
  更多男子排名，请看
  <a 
    href="/rankings?gender=M" 
    className="font-medium text-blue-600"
  >
    2024马拉松男子百强榜
  </a>
</div>
        </MobileCollapsible>
  
        <MobileCollapsible
          icon={Trophy}
          title="2024马拉松女子最速 Top 10"
          color="green"
        >
          <TopTenDisplay records={topRecords.female || []} gender="F" />
          <div className="text-sm sm:text-base font-medium text-gray-800 text-right">
  更多女子排名，请看
  <a 
    href="/rankings?gender=F" 
    className="font-medium text-blue-600"
  >
    2024马拉松女子百强榜
  </a>
</div>
        </MobileCollapsible>
  
        {/* 新增跑力榜展示 */}
        <MobileCollapsible
          icon={Zap}
          title="2024马拉松跑力最强 Top 10"
          color="purple"
        >
          <AdjustedTopTenDisplay records={topAdjustedRecords} />
        
          <div className="text-sm sm:text-base font-medium text-gray-800 text-right">
  更多跑力排名，请看
  <a 
    href="/age-adjusted-rankings" 
    className="font-medium text-blue-600"
  >
    2024马拉松跑力榜
  </a>
</div>
        </MobileCollapsible>
  
 {/* 添加 BQ Top 10 展示 */}
 <MobileCollapsible
        icon={Trophy}
        title="2024马拉松BQ Top 10"
        color="green"
      >
        <BQTopTenDisplay records={bqTopRecords} />
        <div className="text-sm sm:text-base font-medium text-gray-800 text-right mt-2">
          更多BQ成绩，请看
          <a 
            href="/bq-rankings" 
            className="font-medium text-blue-600 ml-1"
          >
            2024马拉松BQ榜
          </a>
        </div>
      </MobileCollapsible>
      
      {/* 添加100英里完赛者展示 */}
      <MobileCollapsible
        icon={Trophy}
        title="2024百英里超级跑者"
        color="yellow"
      >
        <HundredMilersDisplay records={hundredMilers} />
      
        <div className="text-sm sm:text-base font-medium text-gray-800 text-right">
  更多超马跑者，请看
  <a 
    href="/ultra-rankings" 
    className="font-medium text-blue-600"
  >
    2024超马越野榜
  </a>
</div>
      </MobileCollapsible>
    

     

      
    </MobilePageContainer>
  );
};