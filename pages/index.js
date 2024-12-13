// pages/index.js
import { useState, useEffect } from 'react';
import { useDeviceDetection } from '../lib/deviceDetection';
import { MobileStatsPage } from '../components/mobile/MobileStatsPage';
import { DesktopStatsPage } from '../components/desktop/DesktopStatsPage';

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMobile = useDeviceDetection();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        
        if (data.success) {
          setStats(data.stats);
        } else {
          setError(data.message || '获取统计数据失败');
        }
      } catch (err) {
        console.error('获取统计数据错误:', err);
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">加载中...</div>
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

  return (
    <>
      {isMobile ? (
        <MobileStatsPage stats={stats} />
      ) : (
        <DesktopStatsPage stats={stats} />
      )}
    </>
  );
}