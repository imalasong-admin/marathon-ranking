// pages/age-adjusted-rankings.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, CheckCircle, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { states } from '../../lib/us-cities-data';
import VerificationDialog from '../../components/VerificationDialog'; // 导入 VerificationDialog 组件

export default function DesktopAgeAdjustedRankings() {
  const { data: session } = useSession();
  const router = useRouter();

  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyingRecord, setVerifyingRecord] = useState(null);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 100;
  const [races, setRaces] = useState([]);

  const [filters, setFilters] = useState({
    gender: 'all',
    ageGroup: 'all',
    userName: '',
    selectedRace: null,
    state: 'all'
  });

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
    fetchRaces();
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
            return raceDate.getFullYear() === 2024 &&
                   record.raceId?.seriesId?.raceType === '全程马拉松';
          })
          .filter(record => record.adjustedSeconds)
          .sort((a, b) => {
            return a.adjustedSeconds - b.adjustedSeconds;
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

  const fetchRaces = async () => {
    try {
      const res = await fetch('/api/races');
      const data = await res.json();
      if (data.success) {
        const marathonRaces = data.races.filter(race =>
          new Date(race.date).getFullYear() === 2024 &&
          race.seriesId?.raceType === '全程马拉松'
        );
        setRaces(marathonRaces);
      }
    } catch (err) {
      console.error('获取赛事数据失败');
    }
  };

  const handleVerifyClick = (record) => {
    setVerifyingRecord(record);
    setShowVerifyDialog(true);
  };

  const handleVerifySubmit = async (action) => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`/api/records/${verifyingRecord._id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      const data = await res.json();
      if (data.success) {
        await fetchRecords();
        setShowVerifyDialog(false);
        setVerifyingRecord(null);
        setError('');
      } else {
        setError(data.message || '操作失败');
      }
    } catch (err) {
      console.error('验证操作错误:', err);
      setError('操作失败，请重试');
    }
  };

  const formatAdjustedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return formatTime({ hours, minutes, seconds: remainingSeconds });
  };

  const applyFilters = () => {
    let result = [...records];

    if (filters.selectedRace) {
      result = result.filter(record => record.raceId?._id === filters.selectedRace);
    }

    if (filters.userName.trim()) {
      const searchTerm = filters.userName.trim().toLowerCase();
      result = result.filter(record =>
        record.userName.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.gender !== 'all') {
      result = result.filter(record =>
        filters.gender === 'M' ? record.gender === 'M' : record.gender !== 'M'
      );
    }

    if (filters.ageGroup !== 'all') {
      const group = AGE_GROUPS.find(g => g.value === filters.ageGroup);
      if (group) {
        result = result.filter(record => {
          const age = Number(record.age);
          return !isNaN(age) && age >= group.min && age <= group.max;
        });
      }
    }

    if (filters.state !== 'all') {
      result = result.filter(record =>
        record.state === filters.state
      );
    }

    setFilteredRecords(result);
    setCurrentPage(1);
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const Pagination = () => (
    <div className="flex justify-center mt-2 space-x-2">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50"
      >
        上一页
      </button>
      <span className="px-3 py-1">
        第 {currentPage} 页 / 共 {totalPages} 页
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md disabled:opacity-50"
      >
        下一页
      </button>
    </div>
  );

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
      <div className="max-w-6xl mx-auto py-2 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">2024年马拉松综合跑力榜</h1>
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (!records || records.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-1 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">2024年马拉松综合跑力榜</h1>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-green-600" />
          <span className="text-gray-700">
            消除了性别和年龄差异后的马拉松成绩榜单，可视为马拉松综合实力排行
          </span>
        </div>
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
                onChange={(e) => setFilters((prev) => ({ ...prev, userName: e.target.value }))}
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
              onChange={(e) => setFilters((prev) => ({ ...prev, gender: e.target.value }))}
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
              onChange={(e) => setFilters((prev) => ({ ...prev, ageGroup: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {AGE_GROUPS.map((group) => (
                <option key={group.value} value={group.value}>
                  {group.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">地区:</label>
            <select
              value={filters.state}
              onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">全部</option>
              {states.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">比赛:</label>
            <select
              value={filters.selectedRace || 'all'}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                selectedRace: e.target.value === 'all' ? null : e.target.value
              }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">全部</option>
              {races.map(race => (
                <option key={race._id} value={race._id}>
                  {race.seriesId?.name} ({formatDate(race.date)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

     {/*  {error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-md text-center">
          {error}
        </div>
      ) : ( */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
                <th className="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
                <th className="px-6 py-1 text-left text-xs font-medium text-red-900 uppercase tracking-wider">
                  <div>跑力成绩</div>
                  <div className="text-gray-400">比赛成绩</div>
                </th>
                <th className="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">性别</th>
                <th className="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年龄</th>
                <th className="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">比赛</th>
                <th className="px-6 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRecords.map((record, index) => (
                <tr key={`${record._id}-${index}`}>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                    {indexOfFirstRecord + index + 1}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                    <Link
                      href={`/users/${record.userId?._id || record.userId}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {record.userName}
                    </Link>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="flex flex-col">
                        <div className="text-red-900">{formatAdjustedTime(record.adjustedSeconds)}</div>
                        <div className="mb-1">
                          {formatTime(record.finishTime)}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleVerifyClick(record);
                            }}
                            className={`ml-2 ${
                              record.verificationStatus === 'verified' && record.reportedBy?.length > 0
                                ? 'text-yellow-500'
                                : record.verificationStatus === 'verified'
                                ? 'text-green-500'
                                : record.reportedBy?.length > 0
                                ? 'text-red-500'
                                : 'text-gray-400'
                            }`}
                            title={
                              record.verificationStatus === 'verified' && record.reportedBy?.length > 0
                                ? `${record.verifiedCount}人验证/${record.reportedBy.length}人举报`
                                : record.verificationStatus === 'verified'
                                ? `${record.verifiedCount}人验证`
                                : record.reportedBy?.length > 0
                                ? '被举报'
                                : '待验证'
                            }
                          >
                            <CheckCircle size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{record.gender === 'M' ? '男' : '女'}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{record.age || '-'}</td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                    {record.raceId?.seriesId?.name}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">{formatDate(record.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              没有找到符合条件的记录
            </div>
          ) : (
            <Pagination />
          )}
        </div>
      

      {/* 添加验证对话框 */}
      <VerificationDialog
        isOpen={showVerifyDialog}
        onClose={() => {
          setShowVerifyDialog(false);
          setVerifyingRecord(null);
          setError('');
        }}
        record={verifyingRecord}
        error={error}
        onVerify={() => handleVerifySubmit('verify')}
        onReport={() => handleVerifySubmit('report')}
      />
    </div>
  );
}
