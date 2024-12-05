// pages/rankings.js
import { useState, useEffect } from 'react';
import { useDeviceDetection } from '../lib/deviceDetection';
import { useRouter } from 'next/router';  // 添加这行导入
import DesktopRankings from '../components/desktop/DesktopRankings';
import MobileRankings from '../components/mobile/MobileRankings';

export default function Rankings() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMobile = useDeviceDetection();
  const router = useRouter();  // 使用 router

  // 获取数据
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch('/api/records');
        const data = await res.json();
        
        if (data.success) {
          // 过滤和排序2024年的马拉松成绩
          const filteredRecords = data.records
            .filter(record => {
              const raceDate = new Date(record.raceId?.date);
              return raceDate.getFullYear() === 2024 && 
                     record.raceId?.seriesId?.raceType === '全程马拉松';
            })
            .sort((a, b) => a.totalSeconds - b.totalSeconds);
          
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
    <MobileRankings 
      records={records} 
      initialGender={router.query.gender === 'F' ? 'F' : 'M'}
    />
  ) : (
    <DesktopRankings initialRecords={records} />  // 桌面端保持不变
  );
}