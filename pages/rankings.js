import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const Rankings = () => {
  const { data: session } = useSession();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    ageGroup: ''
  });

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError('');  // 清除之前的错误
      
      const queryParams = new URLSearchParams(filters);
      const res = await fetch(`/api/records?${queryParams}`);
      const data = await res.json();

      if (data.success) {
        setRecords(data.records);
      } else {
        setError(data.message || '获取数据失败');
        console.error('获取数据失败:', data);
      }
    } catch (err) {
      setError('获取数据失败，请稍后重试');
      console.error('获取记录错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">马拉松成绩排行榜</h1>
        <div className="text-center py-8">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">马拉松成绩排行榜</h1>
      
      <div className="mb-6 flex space-x-4">
        <select
          value={filters.gender}
          onChange={(e) => setFilters({...filters, gender: e.target.value})}
          className="rounded-md border-gray-300 py-2 px-4"
        >
          <option value="">所有性别</option>
          <option value="M">男子组</option>
          <option value="F">女子组</option>
        </select>

        <select
          value={filters.ageGroup}
          onChange={(e) => setFilters({...filters, ageGroup: e.target.value})}
          className="rounded-md border-gray-300 py-2 px-4"
        >
          <option value="">所有年龄组</option>
          <option value="18-35">18-35岁</option>
          <option value="36-45">36-45岁</option>
          <option value="46-55">46-55岁</option>
          <option value="56+">56岁以上</option>
        </select>
      </div>

      {error ? (
        <div className="text-center text-red-500 py-4">
          {error}
        </div>
      ) : records.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  排名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  姓名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  成绩
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  性别
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  年龄
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  完赛日期
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record, index) => (
                <tr key={record._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.name || '未知'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {formatTime(record.totalSeconds)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.gender === 'M' ? '男' : '女'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.age}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-4">
          暂无成绩记录
        </div>
      )}
    </div>
  );
};

export default Rankings;