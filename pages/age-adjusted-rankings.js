// pages/age-adjusted-rankings.js
import { useState, useEffect } from 'react';
import { useDeviceDetection } from '../lib/deviceDetection';
import DesktopAgeAdjustedRankings from '../components/desktop/DesktopAgeAdjustedRankings';
import MobileAgeAdjustedRankings from '../components/mobile/MobileAgeAdjustedRankings';

export default function AgeAdjustedRankings() {
 const [records, setRecords] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const isMobile = useDeviceDetection();

 // 保持原有的数据获取逻辑不变
 useEffect(() => {
   const fetchRecords = async () => {
     try {
       const res = await fetch('/api/records');
       const data = await res.json();
       
       if (data.success) {
         const filteredRecords = data.records
           .filter(record => {
             const raceDate = new Date(record.raceId?.date);
             return raceDate.getFullYear() === 2024 && 
                    record.raceId?.seriesId?.raceType === '全程马拉松';
           })
           .sort((a, b) => a.adjustedSeconds - b.adjustedSeconds);
         
         setRecords(filteredRecords);
       } else {
         setError(data.message);
       }
     } catch (err) {
       setError('获取数据失败');
     } finally {
       setLoading(false);
     }
   };

   fetchRecords();
 }, []);

 if (loading) {
   return (
     <div className="flex items-center justify-center min-h-screen">
       <div className="text-center">加载中...</div>
     </div>
   );
 }

 if (error) {
   return (
     <div className="flex items-center justify-center min-h-screen">
       <div className="text-red-500">{error}</div>
     </div>
   );
 }

 // 根据设备类型返回不同的组件
 return isMobile ? (
   <MobileAgeAdjustedRankings records={records} />
 ) : (
   <DesktopAgeAdjustedRankings initialRecords={records} />
 );
}