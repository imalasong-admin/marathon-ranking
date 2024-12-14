// components/desktop/DesktopBQRankings.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Search, CheckCircle, Users, ExternalLink } from 'lucide-react';
import { states } from '../../lib/us-cities-data';
import { formatTime } from '../../lib/timeUtils';
import { formatBQTimeDiff } from '../../lib/bqStandards';

const DesktopBQRankings = ({ records = [] }) => {
  const { data: session } = useSession();
  const router = useRouter();
  
  // 状态管理
  const [searchTerm, setSearchTerm] = useState('');
  const [localRecords, setLocalRecords] = useState(records);
  const [races, setRaces] = useState([]);
  const [filters, setFilters] = useState({
    ageGroup: 'all',
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
    // ... 其他年龄组
  ];

  useEffect(() => {
    fetchRaces();
  }, []);

  useEffect(() => {
    setLocalRecords(records);
  }, [records]);

  // API 调用函数
  const fetchRaces = async () => {
    // ... 获取比赛列表
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
    // ... 验证提交逻辑
  };

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

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      {/* 标题和统计信息 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">2024年波马达标榜</h1>
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

      {/* 搜索和筛选区域 */}
      <div className="mb-6 space-y-4 bg-white p-4 rounded-lg shadow-sm">
        {/* ... 搜索框和筛选器 */}
      </div>

      {/* 成绩列表 */}
      <div className="bg-white rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">排名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">姓名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成绩</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BQ差值</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">性别</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">年龄(波马日)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">比赛</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
  {filteredRecords.map((record, index) => (
    <tr key={record._id} className="hover:bg-gray-50">
      {/* 排名 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {index + 1}
      </td>
      
      {/* 姓名和基本信息 */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <Link 
            href={`/users/${record.userId?._id || record.userId}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {record.userName}
          </Link>

        </div>
      </td>

      {/* 成绩 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="font-medium">{formatTime(record.finishTime)}
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
</div>
      </td>

      {/* BQ差值 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
        {formatBQTimeDiff(record.bqDiff)}
      </td>

      {/* 性别 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {record.gender === 'M' ? 'M' : 'F'}
      </td>

      {/* 波马日年龄 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {record.bostonAge}
      </td>

      {/* 比赛信息 */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
         {record.raceId?.seriesId?.name}
       </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatDate(record.raceId?.date)}
      </td>
  
    </tr>
  ))}
  
  {filteredRecords.length === 0 && (
    <tr>
      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
        没有找到相关记录
      </td>
    </tr>
  )}
</tbody>
        </table>
      </div>

      {/* 验证对话框 */}
      {showVerifyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* ... 验证对话框内容 */}
        </div>
      )}
    </div>
  );
};

export default DesktopBQRankings;