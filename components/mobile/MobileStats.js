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



// 主组件
export const MobileStats = ({ 
    stats, 
    topRecords, 
    ultraStats = { runners: 0, races: 0 },
    topAdjustedRecords = [],
    hundredMilers = []
  }) => {
    const safeStats = {
      male: { runners: 0, races: 0 },
      female: { runners: 0, races: 0 },
      ...stats
    };
  
    // 计算总数
    const totalRunners = safeStats.male.runners + safeStats.female.runners;
    const totalRaces = safeStats.male.races + safeStats.female.races;
  
    return (
      <MobilePageContainer>
        {/* 添加总体统计信息卡片 */}
        <MobileCard className="bg-blue-50 p-2 mb-4"> {/* 增加内边距 */}
            
  {/* 统计信息 - 使用更好的行距和对齐方式 */}
  <div className="flex gap-2"> {/* 增加图标和文字的间距 */}
    <Trophy size={18} className="text-red-600 flex-shrink-0" /> {/* 略微增大图标并向下对齐 */}
    <div className="text-gray-700 leading-relaxed"> {/* 增加行高 */}
    <div className="text-sm sm:text-base font-medium text-gray-800">
      2024马拉松完赛榜
      </div>
      2024年度共有<span className="font-medium text-blue-600">{totalRunners}</span>位跑者完成<span className="font-medium text-blue-600">{totalRaces}</span>场马拉松，
      <br className="mt-1" /> {/* 使用换行增加可读性 */}
      其中<span className="font-medium text-blue-600">{safeStats.male.runners}</span>位男跑者完成<span className="font-medium text-blue-600">{safeStats.male.races}</span>场，
      <span className="font-medium text-blue-600">{safeStats.female.runners}</span>位女跑者完成<span className="font-medium text-blue-600">{safeStats.female.races}</span>场。
    </div>
  </div>
  
  {/* 邀请文字和按钮 - 调整间距和对齐 */}
  <div className="mt-2 flex flex-col items-center"> {/* 增加上边距 */}
    <p className="text-gray-600 leading-relaxed"> {/* 增加文字和按钮的间距 */}
      请长期居住在北美的华人跑者加入完赛榜。
      </p>
      <a 
      href="/users/submit" 
      className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 transition-colors"
    > {/* 增加按钮的水平内边距 */}
      提交成绩
    </a>
    
    
  </div>
  
</MobileCard>


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