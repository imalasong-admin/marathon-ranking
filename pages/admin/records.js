// pages/admin/records.js
import React from 'react'; 
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { ExternalLink } from 'lucide-react'; 

export default function RecordsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // 基础状态管理
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyingRecord, setVerifyingRecord] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [records, setRecords] = useState([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editForm, setEditForm] = useState({
  raceId: '',
  hours: '',
  minutes: '',
  seconds: '',
  proofUrl: ''
});

  // 权限检查和数据加载
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.isAdmin) {
      router.push('/');
      return;
    }
    fetchRecords();
  }, [status, session]);

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const res = await fetch('/api/races');
        const data = await res.json();
        if (data.success) {
          setRaces(data.races);
        }
      } catch (err) {
        console.error('获取比赛列表失败:', err);
      }
    };
  
    if (showEditDialog) {
      fetchRaces();
    }
  }, [showEditDialog]);

  // 获取记录列表
  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      if (data.success) {
        // 按创建时间倒序排序（最新的在前）
        const sortedRecords = data.records.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setRecords(sortedRecords);
      } else {
        setError(data.message || '获取记录列表失败');
      }
    } catch (err) {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 添加日期格式化函数
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch (error) {
      return '';
    }
  };

// 添加更新函数
const handleUpdateStats = async () => {
    try {
      const res = await fetch('/api/stats/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ year: 2024 })
      });
      const data = await res.json();
      
      if (data.success) {
        alert('统计数据更新成功');
      } else {
        setError(data.message || '统计更新失败');
      }
    } catch (err) {
      console.error('更新统计错误:', err);
      setError('更新失败，请重试');
    }
  };


// 成绩验证
const handleVerifyClick = (record) => {
    setVerifyingRecord(record);
    setReportReason('');
    setShowVerifyDialog(true);
  };
  
  
  const handleVerifySubmit = async (action) => {
    try {
      const res = await fetch(`/api/records/${verifyingRecord._id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason: reportReason
        })
      });
  
      const data = await res.json();
      if (data.success) {
        await fetchRecords(); // 刷新记录列表
        setShowVerifyDialog(false);
        setVerifyingRecord(null);
        setReportReason('');
        setError('');
      } else {
        setError(data.message || '操作失败');
      }
    } catch (err) {
      console.error('验证操作错误:', err);
      setError('操作失败，请重试');
    }
  };

// 处理编辑点击
const handleEditClick = (record) => {
    setEditingRecord(record);
    setEditForm({
      raceId: record.raceId?._id,
      hours: record.finishTime.hours,
      minutes: record.finishTime.minutes,
      seconds: record.finishTime.seconds,
      proofUrl: record.proofUrl || ''
    });
    setShowEditDialog(true);
  };
  
  // 处理编辑提交
  const handleEditSubmit = async () => {
    try {
      const totalSeconds = 
        parseInt(editForm.hours || 0) * 3600 + 
        parseInt(editForm.minutes || 0) * 60 + 
        parseInt(editForm.seconds || 0);
  
      if (totalSeconds <= 0) {
        setError('请填写有效的完赛时间');
        return;
      }
  
 

      const res = await fetch(`/api/admin/records/${editingRecord._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raceId: editForm.raceId,
          hours: parseInt(editForm.hours),
          minutes: parseInt(editForm.minutes),
          seconds: parseInt(editForm.seconds),
          totalSeconds,
          proofUrl: editForm.proofUrl || ''
        })
      });
  
      const data = await res.json();
      if (data.success) {
        await fetchRecords(); // 重新加载记录
        setShowEditDialog(false);
        setEditingRecord(null);
        setError('');
      } else {
        setError(data.message || '更新失败');
      }
    } catch (err) {
      console.error('更新错误:', err);
      setError('更新失败，请重试');
    }
  };

  // 处理删除
const handleDelete = async (recordId) => {
    if (!confirm('确定要删除这条记录吗？')) return;
  
    try {
      const res = await fetch(`/api/admin/records/${recordId}`, {
        method: 'DELETE'
      });
  
      const data = await res.json();
      if (data.success) {
        await fetchRecords(); // 重新加载记录
      } else {
        setError(data.message || '删除失败');
      }
    } catch (err) {
      console.error('删除错误:', err);
      setError('删除失败，请重试');
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {error && (
        <div className="mb-4 bg-red-50 text-red-500 p-4 rounded-md">{error}</div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* 导航按钮组 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            用户管理
          </button>
          <button
            onClick={() => router.push('/admin/series')}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            赛事管理
          </button>
          <button
            onClick={() => router.push('/admin/races')}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            场次管理
          </button>
          <button 
            className="px-4 py-2 bg-gray-800 text-white rounded-md"
            disabled
          >
            成绩管理
          </button>
          <button
  onClick={handleUpdateStats}
  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
>
  更新统计数据
</button>

        </div>

        {/* 记录列表表格 */}
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成绩</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">性别</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">年龄</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">比赛名称</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成绩验证</th>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {records.map((record) => {
      const raceDate = record.raceId?.date ? new Date(record.raceId.date) : null;
      const birthDate = record.userId?.birthDate ? new Date(record.userId.birthDate) : null;
      let raceAge = null;
      
      if (birthDate && raceDate && !isNaN(raceDate.getTime()) && !isNaN(birthDate.getTime())) {
        if (raceDate >= birthDate && birthDate.getFullYear() > 1920) {
          raceAge = raceDate.getFullYear() - birthDate.getFullYear();
          const m = raceDate.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && raceDate.getDate() < birthDate.getDate())) {
            raceAge--;
          }
        }
      }

      return (
        <tr key={record._id}>
          <td className="px-6 py-4">{record.userName}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            {/* 成绩和链接放在一起 */}
            {`${record.finishTime.hours}:${String(record.finishTime.minutes).padStart(2, '0')}:${String(record.finishTime.seconds).padStart(2, '0')}`}
            {record.proofUrl && (
              <a 
                href={record.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block ml-2 text-gray-400 hover:text-blue-500"
                title="查看成绩证明"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </td>
          <td className="px-6 py-4">{record.gender === 'M' ? '男' : '女'}</td>
          <td className="px-6 py-4">{raceAge || '-'}</td>
          <td className="px-6 py-4">
            {/* 比赛名称加日期 */}
            {`${record.raceId?.seriesId?.name || '-'} (${formatDate(record.raceId?.date)})`}
          </td>

          <td className="px-6 py-4">
  <div className="flex items-center space-x-2">
  <span className={`px-2 py-1 rounded-full text-xs ${
      record.verificationStatus === 'verified' && record.reportedBy?.length > 0
        ? 'bg-yellow-100 text-yellow-800'
        : record.verificationStatus === 'verified'
        ? 'bg-green-100 text-green-800'
        : record.reportedBy?.length > 0
        ? 'bg-red-100 text-red-800'
        : 'bg-yellow-100 text-yellow-800'
    }`}>
      {record.verificationStatus === 'verified' && record.reportedBy?.length > 0
        ? `${record.verifiedCount}人验证/${record.reportedBy.length}人举报`
        : record.verificationStatus === 'verified'
        ? `${record.verifiedCount}人验证`
        : record.reportedBy?.length > 0
        ? '被举报'
        : '待验证'}
    </span>
    <button
      onClick={() => handleVerifyClick(record)}
      className="text-blue-600 hover:text-blue-900 text-sm"
    >
      验证
    </button>
  </div>
</td>
          <td className="px-6 py-4 space-x-2">
  <button
    onClick={() => handleEditClick(record)}
    className="text-blue-600 hover:text-blue-900"
  >
    编辑
  </button>
  <button
    onClick={() => handleDelete(record._id)}
    className="text-red-600 hover:text-red-900"
  >
    删除
  </button>
</td>
        </tr>
      );
    })}
  </tbody>
</table>
      </div>
    </div>


    {showEditDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full p-6">
      <h3 className="text-lg font-semibold mb-4">编辑成绩记录</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* 比赛选择 */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    比赛名称
  </label>
  <select
    value={editForm.raceId}
    onChange={(e) => setEditForm({...editForm, raceId: e.target.value})}
    className="w-full rounded-md border-gray-300 shadow-sm"
  >
    <option value={editingRecord.raceId._id}>
      {editingRecord.raceId.seriesId.name} ({formatDate(editingRecord.raceId.date)})
    </option>
    {races
      .filter(race => race._id !== editingRecord.raceId._id && race.seriesId) // 添加 race.seriesId 检查
      .map((race) => (
        <option key={race._id} value={race._id}>
          {race.seriesId?.name || '未知比赛'} ({formatDate(race.date)})
        </option>
      ))}
  </select>
</div>
        {/* 完赛时间 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            完赛时间
          </label>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <input
                type="number"
                min="0"
                max="23"
                value={editForm.hours}
                onChange={(e) => setEditForm({...editForm, hours: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm"
                placeholder="时"
              />
            </div>
            <div>
              <input
                type="number"
                min="0"
                max="59"
                value={editForm.minutes}
                onChange={(e) => setEditForm({...editForm, minutes: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm"
                placeholder="分"
              />
            </div>
            <div>
              <input
                type="number"
                min="0"
                max="59"
                value={editForm.seconds}
                onChange={(e) => setEditForm({...editForm, seconds: e.target.value})}
                className="w-full rounded-md border-gray-300 shadow-sm"
                placeholder="秒"
              />
            </div>
          </div>
        </div>

        {/* 成绩证明链接 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            成绩证明链接
          </label>
          <input
            type="url"
            value={editForm.proofUrl}
            onChange={(e) => setEditForm({...editForm, proofUrl: e.target.value})}
            className="w-full rounded-md border-gray-300 shadow-sm"
            placeholder="请输入成绩证明链接"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-6">
        <button
          onClick={() => {
            setShowEditDialog(false);
            setEditingRecord(null);
            setError('');
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700"
        >
          取消
        </button>
        <button
          onClick={handleEditSubmit}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          保存
        </button>
      </div>
    </div>
  </div>
)}
{/* 验证对话框 */}
{showVerifyDialog && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full p-6">
      <h3 className="text-lg font-semibold mb-4">验证成绩记录</h3>
      
      {error && (
        <div className="mb-4 bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* 显示记录信息 */}
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-sm text-gray-600">
            比赛：{verifyingRecord?.raceId?.seriesId?.name} ({formatDate(verifyingRecord?.raceId?.date)})
          </p>
          <p className="text-sm text-gray-600">
            成绩：{`${verifyingRecord?.finishTime.hours}:${String(verifyingRecord?.finishTime.minutes).padStart(2, '0')}:${String(verifyingRecord?.finishTime.seconds).padStart(2, '0')}`}
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
      {verifyingRecord?.userId?.name} 没有提供成绩证明链接
    </p>
  )}


          {verifyingRecord?.verifiedBy && verifyingRecord.verifiedBy.length > 0 && (
  <div className="mt-2 pt-2 border-t border-gray-200">
    <p className="text-sm text-gray-600 font-medium">已验证用户：</p>
    <div className="mt-1">
      <p className="text-sm">
        {verifyingRecord.verifiedBy.map((verification, index) => (
          <React.Fragment key={verification.userId._id}>
            <a
              href={`/users/${verification.userId._id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {verification.userId.name}
            </a>
            {index < verifyingRecord.verifiedBy.length - 1 && (
              <span className="mx-2">&nbsp;&nbsp;</span>
            )}
          </React.Fragment>
        ))}
      </p>
    </div>
  </div>
)}
{/* 添加举报信息显示 */}
{verifyingRecord?.reportedBy && verifyingRecord.reportedBy.length > 0 && (
    <div className="mt-2 pt-2 border-t border-gray-200">
      <p className="text-sm text-gray-600 font-medium">举报信息：</p>
      {verifyingRecord.reportedBy.map((report, index) => (
        <div key={report.userId._id} className="mt-1 bg-red-50 p-2 rounded">
          <p className="text-sm text-red-600">
            举报用户：{report.userId.name}
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

      <div className="flex justify-end space-x-2 mt-6">
        <button
          onClick={() => {
            setShowVerifyDialog(false);
            setVerifyingRecord(null);
            setReportReason('');
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
          onClick={() => {
            if (!reportReason.trim()) {
              setError('请填写举报理由');
              return;
            }
            handleVerifySubmit('report');
          }}
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