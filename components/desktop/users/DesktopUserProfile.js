// components/desktop/DesktopUserProfile.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ExternalLink, CheckCircle } from 'lucide-react';
import UserProfileInfo from '../../../components/UserProfileInfo';
import VerificationDialog from '../../../components/VerificationDialog'; // 导入 VerificationDialog 组件
import { urlUtils } from '../../../lib/urlUtils';

// 辅助函数 - 保持不变
const formatTime = (time) => {
  if (!time) return '-';
  return `${time.hours}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC'
    }).replace(/\//g, '-');
  } catch (error) {
    return '-';
  }
};

const getDistanceDisplay = (record) => {
  const raceType = record.raceId?.seriesId?.raceType;
  if (!raceType) return '-';

  if (raceType === '超马' && record.ultraDistance) {
    return record.ultraDistance;
  } else if (raceType === '全程马拉松') {
    return '26.2英里';
  }
  return '-';
};

export default function DesktopUserProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();

  // 基础状态
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 成绩证明相关状态
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [proofUrl, setProofUrl] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  // 验证相关状态
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyingRecord, setVerifyingRecord] = useState(null);
  const [verifyMessage, setVerifyMessage] = useState('');

  const isOwnProfile = session?.user?.id === id;

  // 数据获取函数
  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

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

  // 验证处理函数
  const handleVerifyClick = (record) => {
    setVerifyingRecord(record);
    setVerifyMessage('');
    setShowVerifyDialog(true);
  };

  const handleVerifySubmit = async (action) => {
    try {
      const res = await fetch(`/api/records/${verifyingRecord._id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
        })
      });

      const data = await res.json();
      if (data.success) {
        await fetchUserData();

        setShowVerifyDialog(false);
        setVerifyingRecord(null);
        setVerifyMessage('');
      } else {
        setVerifyMessage(data.message || '操作失败');
      }
    } catch (err) {
      console.error('验证操作错误:', err);
      setVerifyMessage('操作失败，请重试');
    }
  };

  // 成绩证明处理函数
  const handleSubmitProof = async (recordId) => {
    if (!proofUrl.trim()) return;

    setIsSubmittingProof(true);
    try {
      const res = await fetch(`/api/records/${recordId}/update-proof`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofUrl: proofUrl.trim() })
      });

      const data = await res.json();
      if (data.success) {
        const updatedRecords = userData.data.records.map(r =>
          r._id === recordId ? { ...r, proofUrl: proofUrl.trim() } : r
        );
        setUserData(prev => ({
          ...prev,
          data: { ...prev.data, records: updatedRecords }
        }));
        setEditingRecordId(null);
        setProofUrl('');
      } else {
        alert(data.message || '保存失败，请重试');
      }
    } catch (error) {
      alert('保存失败，请重试');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // 继续 DesktopUserProfile 组件
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

  if (!records || records.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* 新的个人信息展示组件 */}
      <UserProfileInfo
        user={{
          ...user,
          _id: id  // 确保传递正确的ID
        }}
        isOwnProfile={isOwnProfile}
      />

      {/* 成绩列表 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">比赛成绩</h2>
          {isOwnProfile && (
            <button
              onClick={() => router.push('/users/submit')}
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              提交成绩
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">比赛</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">项目</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成绩</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成绩链接</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.raceId?.seriesId?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getDistanceDisplay(record)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      {formatTime(record.finishTime)}
                      <button
                        onClick={() => handleVerifyClick(record)}
                        className={`ml-2 ${
                          record.verificationStatus === 'verified' && record.reportedBy?.length > 0
                            ? 'text-yellow-500'
                            : record.verificationStatus === 'verified'
                              ? 'text-green-500'
                              : record.reportedBy?.length > 0
                                ? 'text-red-500'
                                : 'text-gray-400'
                        }`}
                        title={record.verificationStatus === 'verified' && record.reportedBy?.length > 0
                          ? `${record.verifiedCount}人验证/${record.reportedBy.length}人举报`
                          : record.verificationStatus === 'verified'
                            ? `${record.verifiedCount}人验证`
                            : record.reportedBy?.length > 0
                              ? '被举报'
                              : '待验证'}
                      >
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.raceId?.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.proofUrl ? (
                      <a
                      href={urlUtils.getDisplayUrl(record.proofUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-500"
                        title="查看成绩证明"
                      >
                        <ExternalLink size={16} />
                      </a>
                    ) : (
                      isOwnProfile ? (
                        editingRecordId === record._id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="url"
                              value={proofUrl}
                              onChange={(e) => setProofUrl(e.target.value)}
                              placeholder="输入成绩链接"
                              className="w-48 px-2 py-1 text-sm border rounded"
                            />
                            <button
                              onClick={() => handleSubmitProof(record._id)}
                              disabled={isSubmittingProof || !proofUrl.trim()}
                              className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
                            >
                              {isSubmittingProof ? '保存中...' : '保存'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingRecordId(null);
                                setProofUrl('');
                              }}
                              className="text-gray-500 hover:text-gray-700 text-sm"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingRecordId(record._id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            点击提供成绩证明
                          </button>
                        )
                      ) : (
                        <span className="text-gray-500 text-sm">
                          未提供成绩证明
                        </span>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && (
            <div className="text-center py-4 text-gray-500">暂无比赛成绩</div>
          )}
        </div>
      </div>

      {/* 使用 VerificationDialog 组件替代验证对话框 */}
      <VerificationDialog
        isOpen={showVerifyDialog}
        onClose={() => {
          setShowVerifyDialog(false);
          setVerifyingRecord(null);
          setVerifyMessage('');
        }}
        record={verifyingRecord}
        error={verifyMessage}
        onVerify={() => handleVerifySubmit('verify')}
        onReport={() => handleVerifySubmit('report')}
      />
    </div>
  );
}
