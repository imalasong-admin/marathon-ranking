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
  // 添加新的状态
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [proofUrl, setProofUrl] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

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

  // 添加处理成绩证明的函数
  const handleSubmitProof = async (recordId) => {
    if (!proofUrl.trim()) {
      return { error: '请输入有效的链接' };
    }
  
    setIsSubmittingProof(true);
    try {
      const res = await fetch(`/api/records/${recordId}/update-proof`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofUrl: proofUrl.trim() })
      });
  
      const data = await res.json();
      if (data.success) {
        // 更新本地状态而不是刷新页面
        setUserData(prev => ({
          ...prev,
          data: {
            ...prev.data,
            records: prev.data.records.map(record =>
              record._id === recordId
                ? { ...record, proofUrl: proofUrl.trim() }
                : record
            )
          }
        }));
        
        setEditingRecordId(null);
        setProofUrl('');
        return { success: true };
      } else {
        return { error: data.message || '保存失败，请重试' };
      }
    } catch (error) {
      console.error('提交证明出错:', error);
      return { error: '网络连接错误，请稍后重试' };
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // 根据设备类型返回不同的组件
  return isMobile ? (
    <MobileUserProfile 
      userData={userData}
      isOwnProfile={isOwnProfile}
      profileId={id}
      editingRecordId={editingRecordId}
      setEditingRecordId={setEditingRecordId}
      proofUrl={proofUrl}
      setProofUrl={setProofUrl}
      isSubmittingProof={isSubmittingProof}
      onSubmitProof={handleSubmitProof}
    />
  ) : (
    <DesktopUserProfile />
  );
}