// pages/users/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useDeviceDetection } from '../../lib/deviceDetection';
import MobileUserProfile from '../../components/mobile/users/MobileUserProfile';
import DesktopUserProfile from '../../components/desktop/users/DesktopUserProfile';

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const isMobile = useDeviceDetection();

  // 基础状态
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 数据获取
  useEffect(() => {
    if (id) {
      const fetchUserData = async () => {
        try {
          const res = await fetch(`/api/users/${id}`);
          const data = await res.json();

          if (data.success) {
            setUserData(data);
          } else {
            setError(data.message || '获取用户数据失败');
          }
        } catch (err) {
          console.error('获取数据出错:', err);
          setError('数据加载失败');
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [id]);

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

  const isOwnProfile = session?.user?.id === id;

  // 根据设备类型返回不同的组件
  return isMobile ? (
    <MobileUserProfile 
      userData={userData}
      isOwnProfile={isOwnProfile}
      profileId={id}
    />
  ) : (
    <DesktopUserProfile />
  );
}