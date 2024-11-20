import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { ExternalLink, CheckCircle } from 'lucide-react';

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

export default function UserProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);  // 改名为 bioEditMode
  const [saving, setSaving] = useState(false);
  const [bio, setBio] = useState('');
  const [verifyMessage, setVerifyMessage] = useState('');
  const [stravaUrl, setStravaUrl] = useState('');
  const [stravaEditMode, setStravaEditMode] = useState(false);  // 新增


  // 修改密码相关状态
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 成绩证明相关状态
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [proofUrl, setProofUrl] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  // 验证相关状态
  const [verifyingRecordId, setVerifyingRecordId] = useState(null);
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyingRecord, setVerifyingRecord] = useState(null);
  const [reportReason, setReportReason] = useState('');

  // 添加验证处理函数
  const handleVerifyClick = (record) => {
    setVerifyingRecord(record);
    setReportReason('');
    setShowVerifyDialog(true);
  };  

  
  const handleBioSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
  
    try {
      const res = await fetch(`/api/users/${id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bio: bio,
          stravaUrl: userData.data.user.stravaUrl // 保持原有的 stravaUrl
        })
      });
  
      const data = await res.json();
      if (data.success) {
        setUserData(prev => ({
          ...prev,
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

// Strava链接保存
const handleStravaSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setError('');

  try {
    const res = await fetch(`/api/users/${id}/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        bio: userData.data.user.bio, // 保持原有的 bio
        stravaUrl: stravaUrl 
      })
    });

    const data = await res.json();
    if (data.success) {
      setUserData(prev => ({
        ...prev,
        data: {
          ...prev.data,
          user: {
            ...prev.data.user,
            stravaUrl: data.user.stravaUrl
          }
        }
      }));
      setStravaEditMode(false);
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

  const handleVerifySubmit = async (action) => {
    try {
      if (action === 'report' && !reportReason.trim()) {
        setVerifyMessage('请填写举报理由');
        return;
      }
  
      const res = await fetch(`/api/records/${verifyingRecord._id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          reason: reportReason
        })
      });
  
      const data = await res.json();
      if (data.success) {
        // 添加这里：验证成功后重新获取用户数据
        await fetchUserData();  
        
        setShowVerifyDialog(false);
        setVerifyingRecord(null);
        setReportReason('');
        setVerifyMessage('');
      } else {
        setVerifyMessage(data.message || '操作失败');
      }
    } catch (err) {
      console.error('验证操作错误:', err);
      setVerifyMessage('操作失败，请重试');
    }
  };

  const isOwnProfile = session?.user?.id === id;

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  useEffect(() => {
    if (userData?.data?.user) {
      setBio(userData.data.user.bio || '');
      setStravaUrl(userData.data.user.stravaUrl || '');
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

  

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordLoading(true);

    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        alert('密码修改成功！请重新登录。');
        signOut({ callbackUrl: '/login' });
      } else {
        setPasswordError(data.message || '修改失败，请重试');
      }
    } catch (error) {
      setPasswordError('修改失败，请重试');
    } finally {
      setPasswordLoading(false);
    }
  };

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
        // 更新本地数据
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

  const handleVerify = async (recordId, action) => {
    setIsSubmittingVerify(true);
    setVerifyError('');
    try {
      const res = await fetch(`/api/records/${recordId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await res.json();
      if (data.success) {
        // 更新本地数据
        const updatedRecords = userData.data.records.map(r =>
          r._id === recordId ? {
            ...r,
            verifiedCount: action === 'verify' ? (r.verifiedCount || 0) + 1 : r.verifiedCount
          } : r
        );
        setUserData(prev => ({
          ...prev,
          data: { ...prev.data, records: updatedRecords }
        }));
        setVerifyingRecordId(null);
      } else {
        setVerifyError(data.message || '操作失败');
      }
    } catch (error) {
      setVerifyError('操作失败，请重试');
    } finally {
      setIsSubmittingVerify(false);
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
            <p>生日: {formatDate(user.birthDate)}</p>
          </div>
        </div>
      </div>

      {/* 修改密码部分 */}
      {isOwnProfile && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center text-gray-700 hover:text-gray-900"
          >
            <span className="font-medium">修改密码</span>
            <span className="ml-2">{showPasswordForm ? '▼' : '▶'}</span>
          </button>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  新密码
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  确认新密码
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              {passwordError && (
                <div className="text-red-600 text-sm">{passwordError}</div>
              )}
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {passwordLoading ? '修改中...' : '修改密码'}
              </button>
            </form>
          )}
        </div>
      )}

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
          <form onSubmit={handleBioSubmit} className="space-y-4">
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


  {/* Strava链接 */}
<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold">Strava链接</h2>
    {isOwnProfile && !stravaEditMode && (
      <button
        onClick={() => setStravaEditMode(true)}
        className="text-blue-600 hover:text-blue-800"
      >
        编辑
      </button>
    )}
  </div>

  {stravaEditMode && isOwnProfile ? (
    <form onSubmit={handleStravaSubmit} className="space-y-4"> 
      <input
        type="url"  
        value={stravaUrl}
        onChange={(e) => setStravaUrl(e.target.value)}
        placeholder="请输入您的Strava主页链接..."
        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => {
            setStravaEditMode(false);
            setStravaUrl(userData.data.user.stravaUrl || '');
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
    <div className="text-gray-600">
      {user.stravaUrl ? (
        <a
          href={user.stravaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
        >
          <span>访问 Strava 主页</span>
          <ExternalLink size={16} className="ml-1" />
        </a>
      ) : (
        <span>未提供链接</span>
      )}
    </div>
  )}
</div>
      

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
  onClick={(e) => {
    e.preventDefault();
    handleVerifyClick(record);
  }}
  className={`ml-2 ${
    record.verificationStatus === 'verified'
      ? 'text-green-500'
      : record.reportedBy?.length > 0
      ? 'text-red-500'
      : 'text-gray-400'
  } hover:text-green-600 cursor-pointer`}
  title={
    record.verificationStatus === 'verified'
      ? `${record.verifiedCount}人验证`
      : record.reportedBy?.length > 0
      ? '被举报'
      : '验证成绩'
  }
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
                        href={record.proofUrl}
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

      {/* 验证对话框 */}
  {showVerifyDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full p-6">
      <h3 className="text-lg font-semibold mb-4">验证成绩记录</h3>

      {verifyMessage && (
        <div className="mb-4 bg-red-50 text-red-500 p-4 rounded-md">
          {verifyMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* 成绩信息 */}
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-600">
            比赛：{verifyingRecord?.raceId?.seriesId?.name} ({formatDate(verifyingRecord?.raceId?.date)})
          </p>
          <p className="text-sm text-gray-600">
            项目：{getDistanceDisplay(verifyingRecord)}
          </p>
          <p className="text-sm text-gray-600">
            成绩：{formatTime(verifyingRecord?.finishTime)}
          </p>
          {verifyingRecord?.proofUrl ? (
            <p className="text-sm text-gray-600">
              证明链接：
              <a
                href={verifyingRecord.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                查看证明
              </a>
            </p>
          ) : (
            <p className="text-sm text-red-500">
              {user.name} 没有提供成绩证明链接
            </p>
          )}

         {/* 已验证用户列表 */}
{verifyingRecord?.verifiedBy && verifyingRecord.verifiedBy.length > 0 && (
  <div className="mt-2 pt-2 border-t border-gray-200">
    <p className="text-sm text-gray-600 font-medium">已验证用户：</p>
    <p className="text-sm">
      {verifyingRecord.verifiedBy.map((verification, index) => (
        <span key={verification.userId._id}>
          <Link
            href={`/users/${verification.userId._id}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {verification.userId.name}  {/* 修改这里，使用 name 属性 */}
          </Link>
          {index < verifyingRecord.verifiedBy.length - 1 && (
            <span className="mx-2">&nbsp;&nbsp;</span>
          )}
        </span>
      ))}
    </p>
  </div>
)}

{/* 举报信息 */}
{verifyingRecord?.reportedBy && verifyingRecord.reportedBy.length > 0 && (
  <div className="mt-2 pt-2 border-t border-gray-200">
    <p className="text-sm text-gray-600 font-medium">举报信息：</p>
    {verifyingRecord.reportedBy.map((report, index) => (
      <div key={report.userId._id} className="mt-1 bg-red-50 p-2 rounded">
        <p className="text-sm text-red-600">
          举报用户：
          <Link
            href={`/users/${report.userId._id}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {report.userId.name}  {/* 修改这里，使用 name 属性 */}
          </Link>
        </p>
        <p className="text-sm text-red-600">
          举报理由：{report.reason}
        </p>
      </div>
    ))}
  </div>
)}
        </div>

        {/* 举报理由输入框 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            举报理由（如选择举报，请填写）
          </label>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm"
            rows="3"
            placeholder="请输入举报理由..."
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-2 mt-6">
        <button
          onClick={() => {
            setShowVerifyDialog(false);
            setVerifyingRecord(null);
            setReportReason('');
            setVerifyMessage('');
            setError('');
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700"
        >
          取消
        </button>
        <button
          onClick={() => handleVerifySubmit('verify')}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          确认验证
        </button>
        <button
          onClick={() => handleVerifySubmit('report')}
          className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          举报
        </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
