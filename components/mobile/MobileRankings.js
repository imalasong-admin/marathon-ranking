// components/mobile/MobileRankings.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Search, ChevronDown, ChevronUp, CheckCircle, Users } from 'lucide-react';
import { states } from '../../lib/us-cities-data';
import { formatTime, getTimeFromSeconds } from '../../lib/timeUtils';
import MobileVerificationDialog from '../../components/MobileVerificationDialog'; // 导入 MobileVerificationDialog 组件

const MobileRankings = ({ records = [], initialGender = 'M' }) => {
  const { data: session } = useSession();
  const router = useRouter();

  // 基础状态
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [localRecords, setLocalRecords] = useState(records);
  const [filters, setFilters] = useState({
    gender: initialGender,
    ageGroup: 'all',
    selectedRace: null,
    state: 'all'
  });
  const [races, setRaces] = useState([]);
  const [stats, setStats] = useState({ male: {runners: 0, races: 0}, female: {runners: 0, races: 0} });

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

  // 获取赛事数据
  useEffect(() => {
    fetchRaces();
  }, []);

  // 更新初始数据
  useEffect(() => {
    setLocalRecords(records);
  }, [records]);

  // 计算统计数据
  useEffect(() => {
    const calculateStats = () => {
      const uniqueRunners = new Map();
      let maleRaces = 0;
      let femaleRaces = 0;

      records.forEach(record => {
        const raceDate = new Date(record.raceId?.date);
        if (raceDate.getFullYear() === 2024 &&
            record.raceId?.seriesId?.raceType === '全程马拉松') {
          const runnerId = record.userId?._id || record.userId;
          if (!uniqueRunners.has(runnerId)) {
            uniqueRunners.set(runnerId, {
              gender: record.gender,
              races: 1
            });
          } else {
            uniqueRunners.get(runnerId).races++;
          }

          // 计算男女完赛场次
          if (record.gender === 'M') {
            maleRaces++;
          } else {
            femaleRaces++;
          }
        }
      });

      let maleRunners = 0;
      let femaleRunners = 0;

      uniqueRunners.forEach(runner => {
        if (runner.gender === 'M') {
          maleRunners++;
        } else {
          femaleRunners++;
        }
      });

      setStats({
        totalRunners: uniqueRunners.size,
        male: {
          runners: maleRunners,
          races: maleRaces
        },
        female: {
          runners: femaleRunners,
          races: femaleRaces
        }
      });
    };

    calculateStats();
  }, [records, router.query.sort]); // 添加 sort 到依赖数组

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
      });
    } catch (error) {
      return '-';
    }
  };

  // API调用函数
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

  // 验证功能函数
  const handleVerifyClick = (record, e) => {
    e.stopPropagation(); // 阻止事件冒泡
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
                     record.raceId?.seriesId?.raceType === '全程马拉松';
            })
            .sort((a, b) => a.totalSeconds - b.totalSeconds);
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

  // 根据 URL 参数判断是否为完赛榜
  const isCompletionRanking = router.query.sort === 'completion';

  // 数据过滤逻辑
  const filteredRecords = localRecords
    .filter(record => {
      if (!record.userName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      // 完赛榜不需要性别筛选，显示全部记录
      if (!isCompletionRanking && record.gender !== initialGender) return false;
      if (filters.ageGroup !== 'all') {
        const group = AGE_GROUPS.find(g => g.value === filters.ageGroup);
        if (group && (record.age < group.min || record.age > group.max)) return false;
      }
      if (filters.state !== 'all' && record.state !== filters.state) return false;
      if (filters.selectedRace && record.raceId?._id !== filters.selectedRace) return false;
      return true;
    })
    // 如果不是完赛榜，只取前100名
    .slice(0, isCompletionRanking ? undefined : 100);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white shadow-sm z-10">
          <div className="bg-blue-50 px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              {router.query.sort === 'completion' ? (
                <div className="text-gray-700">
                  2024年度共有<span className="font-medium text-blue-600">{stats.totalRunners}</span>位跑者
                  完成<span className="font-medium text-blue-600">{records.length}</span>场马拉松，
                  其中<span className="font-medium text-blue-600">{stats.male.runners}</span>位男跑者
                  完成<span className="font-medium text-blue-600">{stats.male.races}</span>场，
                  <span className="font-medium text-blue-600">{stats.female.runners}</span>位女跑者
                  完成<span className="font-medium text-blue-600">{stats.female.races}</span>场。
                  <span>
                        <button 
                        onClick={() => window.location.href='/users/submit'}
                        className="bg-blue-600 text-white px-4 text-right rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-xs font-medium"
                      >
                        提交成绩
                      </button>
                      </span>
                </div>
            
              ) : (
                // 原有的性别相关显示逻辑保持不变
                <span className="text-gray-700">
                  2024年度有<span className="font-medium text-blue-600">
                    {initialGender === 'M' ? stats.male.runners : stats.female.runners}
                  </span>
                  位{initialGender === 'M' ? '男' : '女'}跑者，跑了
                  <span className="font-medium text-blue-600">
                    {initialGender === 'M' ? stats.male.races : stats.female.races}
                  </span>
                  场马拉松比赛。下面是最快的100场。
                </span>
              )}
            </div>
          </div>
          {/* 搜索框 */}
          <div className="relative px-2 py-2">
            <input
              type="text"
              placeholder="搜索跑者姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-1 pl-8 pr-4 border rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
          </div>

          <div className="mt-1 bg-gray-50 rounded-md overflow-x-auto">
            <div className="flex flex-row items-center gap-2 min-w-max py-1 px-2">
              <div>
                <select
                  value={filters.ageGroup}
                  onChange={(e) => setFilters(prev => ({ ...prev, ageGroup: e.target.value }))}
                  className="rounded-md border-gray-300"
                >
                  {AGE_GROUPS.map(group => (
                    <option key={group.value} value={group.value}>{group.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filters.state}
                  onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                  className="rounded-md border-gray-300"
                >
                  <option value="all">North America</option>
                  {states.map(state => (
                    <option key={state.value} value={state.value}>{state.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={filters.selectedRace || 'all'}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    selectedRace: e.target.value === 'all' ? null : e.target.value
                  }))}
                  className="rounded-md border-gray-300"
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
          </div>
        </div>

        <div className="flex-1 p-2 space-y-2">
          {filteredRecords.map((record, index) => (
            <div key={record._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-1 py-1">
                <div className="grid grid-cols-[2.5rem_1fr_6.5rem_4.5rem] items-center gap-1">
                  <span className="text-gray-600 text-left">#{index + 1}</span>
                  <a
                    href={`/users/${record.userId?._id || record.userId}`}
                    className="font-semibold text-blue-600 truncate px-1"
                  >
                    {record.userName}
                  </a>
                  <div className="flex justify-center w-10">
                    <button
                      onClick={() => setExpandedCard(expandedCard === record._id ? null : record._id)}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
                    >
                      {expandedCard === record._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-end w-18">
                    <span className="font-bold whitespace-nowrap">
                      {formatTime(record.finishTime)}
                    </span>
                    <CheckCircle
                      size={16}
                      className={`ml-1.5 shrink-0 ${
                        record.verificationStatus === 'verified' && record.reportedBy?.length > 0
                          ? 'text-yellow-500'
                          : record.verificationStatus === 'verified'
                            ? 'text-green-500'
                            : record.reportedBy?.length > 0
                              ? 'text-red-500'
                              : 'text-gray-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {expandedCard === record._id && (
                <div className="px-4 pb-3 text-sm text-gray-600 border-t divide-y">
                  <div className="py-2 gap-2">
                    <span className="ml-1">[{record.gender === 'M' ? 'M' : 'F'} {record.age || '-'}]</span>
                    
                    <span className="ml-4">
                      [{record.state && record.city ?
                        `${record.state} - ${record.city}` :
                        (record.state || '-')
                      }]
                    </span>
                  </div>

                  <div className="py-2">
                    <div className="mb-1">
                      <span className="text-gray-500">比赛:</span>
                      <span className="ml-2 font-medium">{record.raceId?.seriesId?.name || '-'} ({formatDate(record.raceId?.date)})</span>
                    </div>

                    <div className="mt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-gray-500">成绩证明:</span>
                          {record.proofUrl ? (
                            <a
                              href={record.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              查看链接
                            </a>
                          ) : (
                            <span className="ml-2 text-red-500">
                              未提供成绩链接
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleVerifyClick(record, e)}
                          className="bg-blue-600 text-xs text-white px-2 py-1 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          验证 | 存疑
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    {record.verifiedCount > 0 ? (
                      <>
                        <div className="flex items-center text-green-600 mb-2">
                          <CheckCircle size={16} className="mr-2" />
                          <span>{record.verifiedCount}人验证</span>
                        </div>
                        {record.verifiedBy && record.verifiedBy.length > 0 && (
                          <div className="mt-1">
                            <div className="ml-2 flex flex-wrap gap-2">
                              {record.verifiedBy.map((verification, index) => (
                                <a
                                  key={`verify-${record._id}-${verification.userId._id}-${index}`}
                                  href={`/users/${verification.userId._id}`}
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {verification.userId.name}
                                  {index < record.verifiedBy.length - 1 ? '、' : ''}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-500">暂无验证</div>
                    )}

                    {record.reportedBy && record.reportedBy.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <span className="text-red-500">⚠️ {record.reportedBy.length} 人存疑</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredRecords.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              没有找到相关记录
            </div>
          )}
        </div>
      </div>

      {/* 使用 MobileVerificationDialog 组件替代验证对话框 */}
      <MobileVerificationDialog
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
    </>
  );
};

export default MobileRankings;
