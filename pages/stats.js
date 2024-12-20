// pages/stats.js
import { useState, useEffect } from 'react';
import { DesktopStats } from '../components/desktop/DesktopStats';
import { MobileStats } from '../components/mobile/MobileStats';
import { useDeviceDetection } from '../lib/deviceDetection';


export default function Home() {
  const [stats, setStats] = useState({ 
    male: {runners: 0, races: 0}, 
    female: {runners: 0, races: 0} 
  });
  const [ultraStats, setUltraStats] = useState({ runners: 0, races: 0 });
  const [topRecords, setTopRecords] = useState({ male: [], female: [] });
  const [topAdjustedRecords, setTopAdjustedRecords] = useState([]); // 新增跑力榜数据
  const [hundredMilers, setHundredMilers] = useState([]); // 新增100英里完赛者状态
  const isMobile = useDeviceDetection();
  const [bqTopRecords, setBqTopRecords] = useState([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/records');
        const data = await res.json();
        if (data.success) {
          const records = data.records;
          
          // 处理马拉松统计
          const marathonRecords = records.filter(record => {
            const raceDate = new Date(record.raceId?.date);
            return raceDate.getFullYear() === 2024 && 
                   record.raceId?.seriesId?.raceType === '全程马拉松';
          });
         

          // 处理超马统计
          const ultraRecords = records.filter(record => {
            const raceDate = new Date(record.raceId?.date);
            return raceDate.getFullYear() === 2024 && 
                   record.raceId?.seriesId?.raceType === '超马';
          });

          // 计算马拉松统计
          const marathonRunners = new Map();
          marathonRecords.forEach(record => {
            const runnerId = record.userId?._id || record.userId;
            if (!marathonRunners.has(runnerId)) {
              marathonRunners.set(runnerId, { gender: record.gender, races: 1 });
            } else {
              marathonRunners.get(runnerId).races++;
            }
          });

          const marathonStats = {
            male: { runners: 0, races: 0 },
            female: { runners: 0, races: 0 }
          };

          marathonRunners.forEach(runner => {
            if (runner.gender === 'M') {
              marathonStats.male.runners++;
              marathonStats.male.races += runner.races;
            } else {
              marathonStats.female.runners++;
              marathonStats.female.races += runner.races;
            }
          });

          // 计算超马统计
          const ultraRunners = new Map();
          ultraRecords.forEach(record => {
            const runnerId = record.userId?._id || record.userId;
            if (!ultraRunners.has(runnerId)) {
              ultraRunners.set(runnerId, { races: 1 });
            } else {
              ultraRunners.get(runnerId).races++;
            }
          });

          const ultraStatsData = {
            runners: ultraRunners.size,
            races: Array.from(ultraRunners.values()).reduce((sum, curr) => sum + curr.races, 0)
          };

          setStats(marathonStats);
          setUltraStats(ultraStatsData);

          // 获取男女各自的前10名
          const maleTop10 = marathonRecords
            .filter(record => record.gender === 'M')
            .sort((a, b) => a.totalSeconds - b.totalSeconds)
            .slice(0, 10);

          const femaleTop10 = marathonRecords
            .filter(record => record.gender === 'F')
            .sort((a, b) => a.totalSeconds - b.totalSeconds)
            .slice(0, 10);

           
            setTopRecords({  // 设置 Top 10
              male: maleTop10,
              female: femaleTop10
            });

          // 获取跑力榜前10
          const adjustedTop10 = marathonRecords
            .sort((a, b) => a.adjustedSeconds - b.adjustedSeconds)
            .slice(0, 10);

          setTopAdjustedRecords(adjustedTop10);
          setStats(marathonStats);
          setUltraStats(ultraStatsData);
          setTopRecords({
            male: maleTop10,
            female: femaleTop10
          });

          // 获取2024年100英里完赛者
          const hundredMileFinishers = records
            .filter(record => {
              const raceDate = new Date(record.raceId?.date);
              return raceDate.getFullYear() === 2024 && 
                     record.raceId?.seriesId?.raceType === '超马' &&
                     record.ultraDistance === '100M';
            })
            .sort((a, b) => new Date(b.raceId?.date) - new Date(a.raceId?.date));

          setHundredMilers(hundredMileFinishers);
        
        
       // 添加 BQ Top10 处理
       const bqTop10 = records
       .filter(record => {
         const raceDate = new Date(record.raceId?.date);
         return raceDate.getFullYear() === 2024 && 
                record.raceId?.seriesId?.raceType === '全程马拉松' &&
                record.isBQ === true;
       })
       .sort((a, b) => b.bqDiff - a.bqDiff)
       .slice(0, 10);

     setBqTopRecords(bqTop10);
   }
 } catch (error) {
   console.error('获取数据失败:', error);
 }
};

fetchData();
}, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {isMobile ? (
        <MobileStats 
          stats={stats} 
          topRecords={topRecords} 
          ultraStats={ultraStats}
          topAdjustedRecords={topAdjustedRecords} // 传入跑力榜数据
          hundredMilers={hundredMilers} // 传入100英里完赛者数据
          bqTopRecords={bqTopRecords}
        />
      ) : (
        <DesktopStats 
          stats={stats} 
          topRecords={topRecords} 
          ultraStats={ultraStats}
          topAdjustedRecords={topAdjustedRecords} // 传入跑力榜数据
          hundredMilers={hundredMilers} // 传入100英里完赛者数据
          bqTopRecords={bqTopRecords}
        />
      )}
    </div>
  );
}