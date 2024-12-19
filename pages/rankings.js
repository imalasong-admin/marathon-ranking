// pages/rankings.js
import { useState, useEffect } from 'react';
import { useDeviceDetection } from '../lib/deviceDetection';

import DesktopRankings from '../components/desktop/DesktopRankings';
import MobileRankings from '../components/mobile/MobileRankings';

export default function Rankings() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMobile = useDeviceDetection();


  // 获取数据
 // pages/rankings.js
useEffect(() => {
  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      
      if (data.success) {
        // 第一步：过滤 2024 年和全程马拉松记录
        const year2024Records = data.records.filter(record => {
          const raceDate = new Date(record.raceId?.date);
          return raceDate.getFullYear() === 2024 && 
                 record.raceId?.seriesId?.raceType === '全程马拉松';
        });
        
        // 第二步：根据设备类型排序
        setRecords(year2024Records);  // 统一使用 API 返回的顺序
     
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
    <MobileRankings records={records}/>
  ) : (
    <DesktopRankings initialRecords={records} />  
  );
}