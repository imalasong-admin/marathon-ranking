// pages/ultra-rankings.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function UltraRankings() {
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
            const raceDate = new Date(record.date);
            const raceInfo = record.raceId;
            return raceDate.getFullYear() === 2024 && 
                   raceInfo?.raceType === '超马';
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date));

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
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-');
    } catch (error) {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">2024年超马排行榜</h1>
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* 标题区域 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">2024年超马排行榜</h1>
        <button
          onClick={() => window.location.href = '/users/ultra-submit'}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/users/${record.userId?._id || record.userId}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {record.userName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.raceName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.ultraDistance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatTime(record.finishTime)}
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.gender === 'M' ? '男' : '女'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.age || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {formatDate(record.date)}
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
    </div>
  );
}