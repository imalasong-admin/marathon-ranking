// pages/bq-rankings.js
import { useState, useEffect } from 'react';
import { useDeviceDetection } from '../lib/deviceDetection';
import MobileBQRankings from '../components/mobile/MobileBQRankings';
import DesktopBQRankings from '../components/desktop/DesktopBQRankings';  // 新的桌面端组件
// import DesktopRankings from '../components/desktop/DesktopRankings'; // 暂时保留原组件

export default function BQRankings() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMobile = useDeviceDetection();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch('/api/records');
        const data = await res.json();
        
        if (data.success) {
          // 过滤2024年的马拉松BQ成绩
          const bqRecords = data.records
            .filter(record => {
              const raceDate = new Date(record.raceId?.date);
              return raceDate.getFullYear() === 2024 && 
                     record.raceId?.seriesId?.raceType === '全程马拉松' &&
                     record.isBQ === true;
            })
            .sort((a, b) => b.bqDiff - a.bqDiff);
          
          setRecords(bqRecords);
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
    return <div className="flex items-center justify-center min-h-screen">加载中...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;
  }

  return isMobile ? (
    <MobileBQRankings records={records} />
  ) : (
    <DesktopBQRankings records={records} />  // 使用新组件
  );
  
    // <DesktopRankings 
    //  initialRecords={records}
    //  mode="bq"  // 暂时保留原组件的模式
    //  />
 
}