// 将现有的 pages/ultra-rankings.js 的所有内容移动到这里
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function DesktopUltraRankings() {
    const { data: session } = useSession();      // 添加用户会话
  const router = useRouter();                  // 添加路由
  // 添加验证相关状态
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyingRecord, setVerifyingRecord] = useState(null);
  // const [reportReason, setReportReason] = useState('');

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, records]);

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      
      if (data.success) {
        // 筛选2024年超马记录并按日期降序排序
        const filteredRecords = data.records
  .filter(record => {
    const raceDate = new Date(record.raceId?.date);  // 从 raceId 获取日期
    return raceDate.getFullYear() === 2024 && 
           record.raceId?.seriesId?.raceType === '超马';  // 从 seriesId 获取类型
  })
  .sort((a, b) => new Date(b.raceId?.date) - new Date(a.raceId?.date));

        setRecords(filteredRecords);
        setFilteredRecords(filteredRecords);
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

  const applyFilters = () => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records);
      return;
    }

    const term = searchTerm.trim().toLowerCase();
    const filtered = records.filter(record => 
      record.userName.toLowerCase().includes(term)
    );

    setFilteredRecords(filtered);
  };

  const formatTime = (time) => {
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

  const handleVerifyClick = (record) => {
    setVerifyingRecord(record);
    // setReportReason('');
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
          // reason: reportReason
        })
      });
  
      const data = await res.json();
      if (data.success) {
        await fetchRecords();
        setShowVerifyDialog(false);
        setVerifyingRecord(null);
        // setReportReason('');
        setError('');
      } else {
        setError(data.message || '操作失败');
      }
    } catch (err) {
      console.error('验证操作错误:', err);
      setError('操作失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-2 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">2024年超马排行榜</h1>
        <div className="text-center">加载中...</div>
      </div>
    );
  }
  if (!records || records.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-1 px-4">
      {/* 标题区域 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">2024年超马榜</h1>
        <button
          onClick={() => window.location.href = '/users/submit'}
          className="inline-flex items-center px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
        >
          
          提交比赛成绩
        </button>
      </div>
    
      {/* 搜索框 */}
      <div className="mb-6">
        <div className="flex-1 max-w-md">
          <label htmlFor="search" className="sr-only">搜索用户</label>
          <div className="relative">
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索用户名..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-md text-center">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">比赛</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">距离</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成绩</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">性别</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年龄</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record._id}>
                  <td className="px-6 py-2 whitespace-nowrap text-sm">
                    <Link
                      href={`/users/${record.userId?._id || record.userId}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {record.userName}
                    </Link>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm">
                      {record.raceId?.seriesId?.name || '未知比赛'}  
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm">
                    {record.ultraDistance}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm">
                    {formatTime(record.finishTime)}
                
                    {/* 添加验证按钮 */}
    <button
      onClick={(e) => {
        e.preventDefault();
        if (!session) {
          router.push('/login');
          return;
        }
        handleVerifyClick(record);
      }}
      className={`ml-2 ${
        record.verificationStatus === 'verified' && record.reportedBy?.length > 0  // 明确检查长度大于0
          ? 'text-yellow-500'  // 既有验证又有举报
          : record.verificationStatus === 'verified'
            ? 'text-green-500'  // 只有验证
            : record.reportedBy?.length > 0  // 同样明确检查长度大于0
              ? 'text-red-500'  // 只有举报
              : 'text-gray-400'  // 待验证
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
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm">
                    {record.gender === 'M' ? '男' : '女'}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm">
                    {record.age || '-'}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm">
                  {formatDate(record.raceId?.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              没有找到符合条件的记录
            </div>
          )}
        </div>
      )}

{/* 添加验证对话框 */}
{showVerifyDialog && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full p-6">
          <h3 className="text-lg font-semibold mb-4">验证成绩记录</h3>
          
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
                项目：{verifyingRecord?.ultraDistance}
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
                  {verifyingRecord?.userName} 没有提供成绩证明链接
                </p>
              )}

               {/* 已验证用户列表 */}
{verifyingRecord?.verifiedBy && verifyingRecord.verifiedBy.length > 0 && (
  <div className="mt-2 pt-2 border-t border-gray-200">
    <div className="flex items-center text-green-600 mb-2">
    <CheckCircle size={16} className="mr-2" />
    {verifyingRecord.verifiedBy.length}人验证
    </div>
    <p className="text-sm">
      {verifyingRecord.verifiedBy.map((verification, index) => (
        <span key={verification.userId._id}>
          <Link
            href={`/users/${verification.userId._id}`}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {verification.userId.name}
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
                 
                  <span className="text-red-500">⚠️ {verifyingRecord.reportedBy.length} 人存疑</span>
                 
                </div>
              )}
            </div>

            
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={() => {
                setShowVerifyDialog(false);
                setVerifyingRecord(null);
                // setReportReason('');
                setError('');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700"
            >
              关闭
            </button>
            <button
              onClick={() => handleVerifySubmit('verify')}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              跑的真好！我确认这个成绩真实有效👍
            </button>
            <button
              onClick={() => handleVerifySubmit('report')}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              我对这个成绩的真实性有疑问🤔
              </button>
          </div>
        </div>
      </div>
    )}

    </div>
  );
}