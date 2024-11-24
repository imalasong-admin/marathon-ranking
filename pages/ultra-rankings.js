// pages/ultra-rankings.js
import { useState, useEffect } from 'react';  // 添加 useState 导入
import { useDeviceDetection } from '../lib/deviceDetection';
import MobileUltraRankings from '../components/mobile/MobileUltraRankings';
import DesktopUltraRankings from '../components/desktop/DesktopUltraRankings';

export default function UltraRankings() {
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
          const filteredRecords = data.records
            .filter(record => {
              const raceDate = new Date(record.raceId?.date);
              return raceDate.getFullYear() === 2024 && 
                     record.raceId?.seriesId?.raceType === '超马';
            })
            .sort((a, b) => new Date(b.raceId?.date) - new Date(a.raceId?.date));

          setRecords(filteredRecords);  // 只设置 records
        } else {
          setError(data.message);
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败');
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">加载中...</div>
  </div>;

  if (error) return <div className="flex items-center justify-center min-h-screen">
    <div className="text-red-500">{error}</div>
  </div>;

  return isMobile ? (
    <MobileUltraRankings records={records} />
  ) : (
    <DesktopUltraRankings initialRecords={records} />
  );
}