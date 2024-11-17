// pages/rankings.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function Rankings() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    gender: 'all',
    ageGroup: 'all',
    userName: '',
    selectedRace: null
  });

  // 年龄组定义
  const AGE_GROUPS = [
    { label: '全部', value: 'all' },
    { label: '18-34岁', value: '18-34', min: 18, max: 34 },
    { label: '35-39岁', value: '35-39', min: 35, max: 39 },
    { label: '40-44岁', value: '40-44', min: 40, max: 44 },
    { label: '45-49岁', value: '45-49', min: 45, max: 49 },
    { label: '50-54岁', value: '50-54', min: 50, max: 54 },
    { label: '55-59岁', value: '55-59', min: 55, max: 59 },
    { label: '60-64岁', value: '60-64', min: 60, max: 64 },
    { label: '65-69岁', value: '65-69', min: 65, max: 69 },
    { label: '70岁以上', value: '70+', min: 70, max: 999 },
  ];

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, records]);

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      
      if (data.success) {
        const filteredRecords = data.records
          .filter(record => {
            const raceDate = new Date(record.raceId?.date);
            // 从 seriesId 中获取比赛类型
            return raceDate.getFullYear() === 2024 && 
                   record.raceId?.seriesId?.raceType === '全程马拉松';
          })
          .sort((a, b) => {
            // 修改排序逻辑：由快到慢 = 由小到大
            return a.totalSeconds - b.totalSeconds;
            // 或者用完赛时间计算：
            // return (a.finishTime.hours * 3600 + a.finishTime.minutes * 60 + a.finishTime.seconds) 
            //      - (b.finishTime.hours * 3600 + b.finishTime.minutes * 60 + b.finishTime.seconds);
          });
        
        setRecords(filteredRecords);
        setFilteredRecords(filteredRecords);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('获取数据失败');
    } finally {
      setLoading(false);
    }
  };
  // 筛选逻辑
  const applyFilters = () => {
    let result = [...records];

    // 比赛筛选
    if (filters.selectedRace) {
      result = result.filter(record => record.raceId?._id === filters.selectedRace);
    }

    // 用户名搜索
    if (filters.userName.trim()) {
      const searchTerm = filters.userName.trim().toLowerCase();
      result = result.filter(record => 
        record.userName.toLowerCase().includes(searchTerm)
      );
    }

    // 性别筛选
    if (filters.gender !== 'all') {
      result = result.filter(record => 
        filters.gender === 'M' ? record.gender === 'M' : record.gender !== 'M'
      );
    }

    // 年龄组筛选
    if (filters.ageGroup !== 'all') {
      const group = AGE_GROUPS.find(g => g.value === filters.ageGroup);
      if (group) {
        result = result.filter(record => {
          const age = Number(record.age);
          return !isNaN(age) && age >= group.min && age <= group.max;
        });
      }
    }

    setFilteredRecords(result);
  };

  // 点击比赛名称时的处理函数
  const handleRaceClick = (raceId) => {
    setFilters(prev => ({
      ...prev,
      selectedRace: prev.selectedRace === raceId ? null : raceId
    }));
  };

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      gender: 'all',
      ageGroup: 'all',
      userName: '',
      selectedRace: null
    });
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">2024年马拉松排行榜</h1>
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* 添加标题区域 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">2024年马拉松排行榜</h1>
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
      </div>
    
      {/* 筛选区域 */}
      <div className="mb-6 space-y-4">
        {/* 搜索框 */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <label htmlFor="search" className="sr-only">搜索用户</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={filters.userName}
                onChange={(e) => setFilters(prev => ({ ...prev, userName: e.target.value }))}
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

        {/* 筛选条件 */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">性别:</label>
            <select
              value={filters.gender}
              onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">全部</option>
              <option value="M">男</option>
              <option value="F">女</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">年龄组:</label>
            <select
              value={filters.ageGroup}
              onChange={(e) => setFilters(prev => ({ ...prev, ageGroup: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {AGE_GROUPS.map(group => (
                <option key={group.value} value={group.value}>
                  {group.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={resetFilters}
            type="button"
            className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
          >
            重置筛选
          </button>
        </div>

        {/* 筛选结果统计 */}
        <div className="text-sm text-gray-500">
          {filters.selectedRace && (
            <div className="font-medium text-blue-600 mb-1">
              {records.find(r => r.raceId?._id === filters.selectedRace)?.raceName} 比赛成绩列表
              <button
                onClick={() => setFilters(prev => ({ ...prev, selectedRace: null }))}
                className="ml-2 text-sm text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          )}
          共找到 {filteredRecords.length} 条记录
          {filters.userName && (
            <span className="ml-2">
              (搜索 "{filters.userName}" 的结果)
            </span>
          )}
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-md text-center">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
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
                  比赛
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record, index) => (
                <tr key={`${record._id}-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link
                      href={`/users/${record.userId?._id || record.userId}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {record.userName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.gender === 'M' ? '男' : '女'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.age || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
  onClick={() => handleRaceClick(record.raceId?._id)}
  className={`hover:text-blue-800 hover:underline focus:outline-none ${
    filters.selectedRace === record.raceId?._id
      ? 'text-blue-600 font-medium'
      : 'text-blue-500'
  }`}
>
  {record.raceId?.seriesId?.name || '未知比赛'}
</button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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