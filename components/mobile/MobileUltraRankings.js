// components/mobile/MobileUltraRankings.js
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Search, ChevronDown, ChevronUp, CheckCircle, ExternalLink, Users } from 'lucide-react';
import { states } from '../../lib/us-cities-data';
import MobileVerificationDialog from '../../components/MobileVerificationDialog'; // 导入 MobileVerificationDialog 组件

const MobileUltraRankings = ({ records: initialRecords = [] }) => {
  const { data: session } = useSession();
  const router = useRouter();

  // 基础状态
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [records, setRecords] = useState(initialRecords);
  const [filters, setFilters] = useState({
    gender: 'M',
    ageGroup: 'all',
    selectedRace: null,
    state: 'all'
  });
  const [races, setRaces] = useState([]);

  // 验证相关状态
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyingRecord, setVerifyingRecord] = useState(null);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    fetchRaces();
  }, []);

  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

  // API 调用函数
  const fetchRaces = async () => {
    try {
      const res = await fetch('/api/races');
      const data = await res.json();
      if (data.success) {
        const ultraRaces = data.races.filter(race =>
          new Date(race.date).getFullYear() === 2024 &&
          race.seriesId?.raceType === '超马'
        );
        setRaces(ultraRaces);
      }
    } catch (err) {
      console.error('获取赛事数据失败');
    }
  };

  // 添加统计计算
  const calculateStats = () => {
    const uniqueRunners = new Map();
    records.forEach(record => {
      const runnerId = record.userId?._id || record.userId;
      if (!uniqueRunners.has(runnerId)) {
        uniqueRunners.set(runnerId, { races: 1 });
      } else {
        uniqueRunners.get(runnerId).races++;
      }
    });

    return {
      runners: uniqueRunners.size,
      races: Array.from(uniqueRunners.values()).reduce((sum, curr) => sum + curr.races, 0)
    };
  };

  const stats = calculateStats();

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

  // 修改验证提交函数，移除对"不能验证自己的成绩"的错误处理
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
                     record.raceId?.seriesId?.raceType === '超马';
            })
            .sort((a, b) => new Date(b.raceId?.date) - new Date(a.raceId?.date));
          setRecords(filteredRecords);
        }

        setShowVerifyDialog(false);
        setVerifyingRecord(null);
        setVerifyError('');
      } else {
        // 只有在不是"不能验证自己的成绩"的情况下才显示错误
        if (data.message !== '不能验证自己的成绩') {
          setVerifyError(data.message || '操作失败');
        }
      }
    } catch (err) {
      if (err.message !== '不能验证自己的成绩') {
        setVerifyError('操作失败，请重试');
      }
    }
  };

  // 辅助函数和过滤逻辑保持不变...
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
      });
    } catch (error) {
      return '-';
    }
  };

  const filteredRecords = records.filter(record => {
    // 1. 确保 record 对象存在
    if (!record || !record.userName) return false;

    // 2. 处理搜索词
    if (searchTerm && !record.userName.toLowerCase().includes(searchTerm.toLowerCase())) return false;

    // 3. 处理其他过滤条件
    if (filters.state !== 'all' && record.state !== filters.state) return false;
    if (filters.selectedRace && record.raceId?._id !== filters.selectedRace) return false;

    return true;
  });

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white shadow-sm z-10">
          {/* 添加统计信息 */}
          <div className="bg-yellow-50 px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-yellow-600" />
              <span className="text-gray-700">
                北美华人跑者2024年度共有
                <span className="font-medium text-yellow-600">{stats.runners}</span>
                位完成
                <span className="font-medium text-yellow-600">{stats.races}</span>
                场超马越野赛
              </span>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="搜索跑者姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-1 pl-8 pr-4 border rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
            <Search className="absolute left-2 top-1.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* 列表区域 */}
        <div className="flex-1 p-2 space-y-2">
          {filteredRecords.map((record) => (
            <div
              key={record._id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              {/* 主要信息 */}
              <div className="px-2 py-2">
                <div className="grid grid-cols-[1fr_6.5rem_4.5rem] items-center gap-1">
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
                      {expandedCard === record._id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
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
                <div className="grid grid-cols-[1fr_6.5rem_4.5rem] items-center gap-1">
                  <div className="mb-1 text-sm">
                    <span className="ml-1">{record.raceId?.seriesId?.name || '-'} ({formatDate(record.raceId?.date)})</span>
                  </div>

                 <div></div>

                  <div className="flex items-center text-sm w-18">
                    <span className="ml-2">{record.ultraDistance}</span>
                  </div>

                </div>
              </div>

              {/* 扩展信息 */}
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
                    

                    {/* 成绩证明 - 修改这部分 */}
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

                  {/* 验证信息 */}
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

                    {/* 举报信息 */}
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

export default MobileUltraRankings;
