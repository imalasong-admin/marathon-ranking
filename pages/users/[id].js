// pages/users/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// 辅助函数
const formatTime = (time) => {
  if (!time) return '-';
  return `${time.hours}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-');
  } catch (error) {
    return '-';
  }
};

const getVerificationStatusText = (status) => {
  switch (status) {
    case 'verified':
      return '已验证';
    case 'rejected':
      return '已拒绝';
    default:
      return '待验证';
  }
};

const getVerificationStatusClass = (status) => {
  switch (status) {
    case 'verified':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

// 获取项目显示文本
const getDistanceDisplay = (record) => {
  if (!record?.raceId?.raceType) return '-';
  
  if (record.raceId.raceType === '超马' && record.ultraDistance) {
    return record.ultraDistance;
  } else if (record.raceId.raceType === '全程马拉松') {
    return '26.2英里';
  }
  return '-';
};

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState('');

  const isOwnProfile = session?.user?.id === id;

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  useEffect(() => {
    if (userData?.data?.user) {
      setBio(userData.data.user.bio || '');
    }
  }, [userData]);

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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/users/${id}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bio })
      });

      const data = await res.json();

      if (data.success) {
        setUserData(prev => ({
          success: true,
          data: {
            ...prev.data,
            user: {
              ...prev.data.user,
              bio: data.user.bio
            }
          }
        }));
        setEditMode(false);
      } else {
        setError(data.message || '更新失败');
      }
    } catch (err) {
      console.error('保存出错:', err);
      setError('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-red-50 text-red-500 p-4 rounded-md text-center">
          {error}
        </div>
      </div>
    );
  }

  if (!userData?.data) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center">未找到用户信息</div>
      </div>
    );
  }

  const { user, records } = userData.data;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* 用户基本信息 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
          <div className="text-gray-600 space-y-1">
            <p>性别: {user.gender === 'M' ? '男' : '女'}</p>
            <p>年龄: {user.age || '-'}</p>
          </div>
        </div>
      </div>

      {/* 用户简介 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">简介</h2>
          {isOwnProfile && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              编辑
            </button>
          )}
        </div>
        
        {editMode && isOwnProfile ? (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="写点什么来介绍自己..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              maxLength={500}
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setBio(userData.data.user.bio || '');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                disabled={saving}
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                disabled={saving}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600">
            {user.bio || '这个用户很懒，还没有写简介'}
          </p>
        )}
      </div>

      {/* 成绩列表 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">比赛成绩</h2>
          {isOwnProfile && (
            <button
              onClick={() => window.location.href = '/users/submit'}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 4v16m8-8H4" 
                />
              </svg>
              提交成绩
            </button>
          )}
        </div>

        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    比赛
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    项目
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    成绩
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.raceName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getDistanceDisplay(record)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record.finishTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${getVerificationStatusClass(record.verificationStatus)}`}
                      >
                        {getVerificationStatusText(record.verificationStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            暂无比赛成绩
          </div>
        )}
      </div>
    </div>
  );
}