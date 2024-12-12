// components/mobile/MobileAgeAdjustedRankings.js
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, ChevronDown, ChevronUp, CheckCircle, Users } from 'lucide-react';
import Link from 'next/link';
import { states } from '../../lib/us-cities-data';

const MobileAgeAdjustedRankings = ({ records = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: session } = useSession();
    const [expandedCard, setExpandedCard] = useState(null);
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
  // const [reportReason, setReportReason] = useState('');
  const [verifyError, setVerifyError] = useState('');


    useEffect(() => {
        fetchRaces();
      }, []);
     
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
    // setReportReason('');
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
          setRecords(filteredRecords);
        }
        
        setShowVerifyDialog(false);
        setVerifyingRecord(null);
        setReportReason('');
        setVerifyError('');
      } else {
        setVerifyError(data.message || '操作失败');
      }
    } catch (err) {
      setVerifyError('操作失败，请重试');
    }
  };

      const filteredRecords = records.filter(record => {
        if (!record.userName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        // if (filters.gender !== 'all' && record.gender !== filters.gender) return false;
        // if (filters.ageGroup !== 'all') {
        //  const group = AGE_GROUPS.find(g => g.value === filters.ageGroup);
        //  if (group && (record.age < group.min || record.age > group.max)) return false;
        // }
        if (filters.state !== 'all' && record.state !== filters.state) return false;
        if (filters.selectedRace && record.raceId?._id !== filters.selectedRace) return false;
        return true;
      });
     

 // 格式化时间
 const formatTime = (time) => {
   if (!time) return '-';
   return `${time.hours}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
 };

 // 格式化日期
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

 // 从秒数转换为时间对象
 const getTimeFromSeconds = (seconds) => {
   if (!seconds) return null;
   const hours = Math.floor(seconds / 3600);
   const minutes = Math.floor((seconds % 3600) / 60);
   const remainingSeconds = seconds % 60;
   return { hours, minutes, seconds: remainingSeconds };
 };

 if (!records || records.length === 0) {
    return <div>Loading...</div>;
  }

   // 验证对话框组件
   const VerifyDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-auto p-4">
        <h3 className="text-lg font-semibold mb-4">验证成绩记录</h3>

        {verifyError && (
          <div className="mb-4 bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {verifyError}
          </div>
        )}

        <div className="space-y-4">
          {/* 成绩信息 */}
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <p className="text-gray-600">
              比赛：{verifyingRecord?.raceId?.seriesId?.name} ({formatDate(verifyingRecord?.raceId?.date)})
            </p>
            <p className="text-gray-600">
              成绩：{formatTime(verifyingRecord?.finishTime)}
            </p>
            {verifyingRecord?.proofUrl ? (
              <p>
                成绩证明：
                <a
                  href={verifyingRecord.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600"
                >
                  查看证明
                </a>
              </p>
            ) : (
              <p className="text-red-500">未提供成绩证明</p>
            )}
            
            
          </div>

          <div className="flex flex-col space-y-3 mt-4">
          <button
            onClick={() => handleVerifySubmit('verify')}
            className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>跑的真好！我确信这个成绩真实有效</span>
            <span>👍</span>
          </button>
          
          <button
            onClick={() => handleVerifySubmit('report')}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <span>我对这个成绩的真实性有疑问</span>
            <span>🤔</span>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => {
              setShowVerifyDialog(false);
              setVerifyingRecord(null);
              setVerifyError('');
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            关闭
          </button>
        </div>
         
</div>

       
      
      </div>
    </div>
  );

 return (
    <>
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white shadow-sm z-10 p-2">
          {/* 添加统计信息 */}
          <div className="bg-green-50 px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-green-600" />
              <span className="text-gray-700">
              消除了性别和年龄差异后的马拉松成绩(蓝色)榜单，可视为马拉松综合实力排行
              </span>
            </div>
            
          </div>
        <div className="relative">
          <input
            type="text"
            placeholder="搜索跑者姓名..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 pr-4 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
 
        <div className="p-3 bg-gray-50 rounded-md mt-2 overflow-x-auto">
          <div className="flex flex-row items-center gap-3 min-w-max">
            
            
            
 
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

     {/* 列表区域 */}
     <div className="flex-1 p-2 space-y-2">
       {filteredRecords.map((record, index) => (
         <div 
           key={record._id}
           className="bg-white rounded-lg shadow-sm overflow-hidden"
         >
           {/* 主要信息 */}
           <div className="px-2 py-2">
             <div className="grid grid-cols-[2.5rem_1fr_6.5rem_4.5rem] items-center gap-1">
               {/* 排名 */}
               <span className="text-gray-600 text-left">
                 #{index + 1}
               </span>

               {/* 姓名、性别、年龄 */}
               <div className="flex flex-col pl-1">
 <a 
   href={`/users/${record.userId?._id || record.userId}`} 
   className="font-semibold text-blue-600 text-base"
 >
   {record.userName}
 </a>
 <div className="text-xs text-gray-500">
   <span>{record.gender === 'M' ? 'M' : 'F'}{record.age || '-'} {record.state || '-'}</span>
   
 </div>
</div>
               

               {/* 展开按钮 */}
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

               {/* 成绩展示 */}
               <div className="flex items-center justify-end">
                 <div className="text-right leading-tight">
                   <div className="text-xs text-gray-500">
                     {formatTime(record.finishTime)}
                   </div>
                   <div className="font-bold text-blue-600">
                     {formatTime(getTimeFromSeconds(record.adjustedSeconds))}
                   </div>
                 </div>
                 <CheckCircle 
                   size={16} 
                   className={`ml-1.5 shrink-0 ${
                    record.verificationStatus === 'verified' && record.reportedBy?.length > 0  // 明确检查长度大于0
                    ? 'text-yellow-500'  // 既有验证又有举报
                    : record.verificationStatus === 'verified'
                      ? 'text-green-500'  // 只有验证
                      : record.reportedBy?.length > 0  // 同样明确检查长度大于0
                        ? 'text-red-500'  // 只有举报
                        : 'text-gray-400'  // 待验证
                   }`}
                 />
               </div>
             </div>
           </div>

           {/* 展开的详细信息 */}
           {expandedCard === record._id && (
             <div className="px-4 pb-3 text-sm text-gray-600 border-t divide-y">
              

               {/* 比赛信息 */}
               <div className="py-2">
                 <div className="mb-1">
                   <span className="text-gray-500">比赛:</span>
                   <span className="ml-2 font-medium">{record.raceId?.seriesId?.name || '-'}</span>
                 </div>
                 <div>
                   <span className="text-gray-500">日期:</span>
                   <span className="ml-2">{formatDate(record.raceId?.date)}</span>
                 </div>
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
                            验证/存疑
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
              <Link
                key={`verify-${record._id}-${verification.userId._id}-${index}`}
                href={`/users/${verification.userId._id}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {verification.userId.name}
                {index < record.verifiedBy.length - 1 ? '、' : ''}
              </Link>
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
   {/* 验证对话框 */}
 {showVerifyDialog && <VerifyDialog />}
 </>
 );
};

export default MobileAgeAdjustedRankings;