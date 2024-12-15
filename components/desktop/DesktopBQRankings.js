// components/desktop/DesktopBQRankings.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Search, CheckCircle, Users } from 'lucide-react';
import { states } from '../../lib/us-cities-data';
import { formatTime } from '../../lib/timeUtils';
import { formatBQTimeDiff } from '../../lib/bqStandards';
import VerificationDialog from '../VerificationDialog';

const DesktopBQRankings = ({ records = [] }) => {
  const { data: session } = useSession();
  const router = useRouter();
  
  // 状态管理
  const [searchTerm, setSearchTerm] = useState('');
  const [localRecords, setLocalRecords] = useState(records);
  const [races, setRaces] = useState([]);
  const [filters, setFilters] = useState({
    gender: 'all',
    ageGroup: 'all',
    userName: '',
    selectedRace: null,
    state: 'all'
  });

  // 验证相关状态
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyingRecord, setVerifyingRecord] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  // 年龄组定义
  const AGE_GROUPS = [
    { label: 'All Ages', value: 'all' },
    { label: '18-34岁', value: '18-34', min: 18, max: 34 },
    { label: '35-39岁', value: '35-39', min: 35, max: 39 },
    { label: '40-44岁', value: '40-44', min: 40, max: 44 },
    { label: '45-49岁', value: '45-49', min: 45, max: 49 },
    { label: '50-54岁', value: '50-54', min: 50, max: 54 },
    { label: '55-59岁', value: '55-59', min: 55, max: 59 },
    { label: '60-64岁', value: '60-64', min: 60, max: 64 },
    { label: '65-69岁', value: '65-69', min: 65, max: 69 },
    { label: '70岁以上', value: '70+', min: 70, max: 999 }
  ];

  useEffect(() => {
    fetchRaces();
  }, []);

  useEffect(() => {
    setLocalRecords(records);
  }, [records]);

  // API 调用函数
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
    if (!session) {
      router.push('/login');
      return;
    }
    setVerifyingRecord(record);
    setVerifyError('');
    setShowVerifyDialog(true);
  };

  const handleVerifySubmit = async (action) => {
    try {
      const res = await fetch(`/api/records/${verifyingRecord._id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason: action === 'report' ? '对成绩真实性存疑' : ''
        })
      });

      const data = await res.json();
      if (data.success) {
        // 更新本地数据
        const updatedRes = await fetch('/api/records');
        const updatedData = await updatedRes.json();
        if (updatedData.success) {
          const filteredRecords = updatedData.records
            .filter(record => {
              const raceDate = new Date(record.raceId?.date);
              return raceDate.getFullYear() === 2024 && 
                     record.raceId?.seriesId?.raceType === '全程马拉松' &&
                     record.isBQ === true;
            })
            .sort((a, b) => b.bqDiff - a.bqDiff);
          setLocalRecords(filteredRecords);
        }
        
        setShowVerifyDialog(false);
        setVerifyingRecord(null);
        setVerifyError('');
      } else {
        setVerifyError(data.message || '操作失败');
      }
    } catch (err) {
      setVerifyError('操作失败，请重试');
    }
  };

  // 数据过滤
  const filteredRecords = localRecords.filter(record => {
    if (!record.userName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filters.ageGroup !== 'all') {
      const group = AGE_GROUPS.find(g => g.value === filters.ageGroup);
      if (group && (record.bostonAge < group.min || record.bostonAge > group.max)) return false;
    }
    if (filters.state !== 'all' && record.state !== filters.state) return false;
    if (filters.selectedRace && record.raceId?._id !== filters.selectedRace) return false;
    return true;
  });


  // 日期格式化
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch (error) {
      return '-';
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-1 px-4">
      {/* 标题区域 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">2024年波马达标榜</h1>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              <span className="text-gray-700">
                北美华人跑者2024年度在
                <span className="font-medium text-blue-600">{records.length}</span>
                场比赛里达到最新的BQ standard
              </span>
            </div>
          </div>
        </div>
      </div>
  
      {/* 搜索和筛选区域 */}
      <div className="mb-6">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索用户名..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* 筛选器 */}
        <div className="flex flex-wrap gap-4 mt-4">

          <select
            value={filters.ageGroup}
            onChange={(e) => setFilters(prev => ({ ...prev, ageGroup: e.target.value }))}
            className="rounded-lg border-gray-300"
          >
            {AGE_GROUPS.map(group => (
              <option key={group.value} value={group.value}>{group.label}</option>
            ))}
          </select>
  
          <select
            value={filters.state}
            onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
            className="rounded-lg border-gray-300"
          >
            <option value="all">All States</option>
            {states.map(state => (
              <option key={state.value} value={state.value}>{state.label}</option>
            ))}
          </select>
  
          <select
            value={filters.selectedRace || 'all'}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              selectedRace: e.target.value === 'all' ? null : e.target.value
            }))}
            className="rounded-lg border-gray-300"
          >
            <option value="all">All Races</option>
            {races.map(race => (
              <option key={race._id} value={race._id}>
                {race.seriesId?.name}
              </option>
            ))}
          </select>
        </div>
      </div>
  
      {/* 成绩列表 */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">姓名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成绩</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BQ差值</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">性别</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年龄(波马日)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">比赛</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.map((record, index) => (
              <tr key={record._id} className="hover:bg-gray-50">
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                
                <td className="px-6 py-2 whitespace-nowrap">
                  <Link 
                    href={`/users/${record.userId?._id || record.userId}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {record.userName}
                  </Link>
                </td>
  
                <td className="px-6 py-2 whitespace-nowrap text-sm">
                  <div className="font-medium">
                    {formatTime(record.finishTime)}
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
  
                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-green-600">
                  {formatBQTimeDiff(record.bqDiff)}
                </td>
  
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                  {record.gender === 'M' ? 'M' : 'F'}
                </td>
  
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                  {record.bostonAge}
                </td>
  
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900">
                  {record.raceId?.seriesId?.name}
                </td>
  
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(record.raceId?.date)}
                </td>
              </tr>
            ))}
            
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  没有找到相关记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
  
      {/* 验证对话框 */}
      <VerificationDialog 
        isOpen={showVerifyDialog}
        onClose={() => {
          setShowVerifyDialog(false);
          setVerifyingRecord(null);
          setVerifyError('');
        }}
        record={verifyingRecord}
        error={verifyError}
        onVerify={() => handleVerifySubmit('verify')}
        onReport={() => handleVerifySubmit('report')}
      />
    </div>
  );
};

export default DesktopBQRankings;