// components/mobile/MobileAgeAdjustedRankings.js
import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

const MobileAgeAdjustedRankings = ({ records = [] }) => {
 const [searchTerm, setSearchTerm] = useState('');
 const [expandedCard, setExpandedCard] = useState(null);

 // 搜索过滤
 const filteredRecords = records.filter(record =>
   record.userName.toLowerCase().includes(searchTerm.toLowerCase())
 );

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

 return (
   <div className="flex flex-col min-h-screen bg-gray-50">
     {/* 头部区域 */}
     <div className="sticky top-0 bg-white shadow-sm z-10 p-4">
       
       {/* 搜索框 */}
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

       {/* 提交成绩按钮 */}
       <a 
         href="/users/submit"
         className="block w-full mt-4 p-2 text-center bg-blue-500 text-white rounded-lg hover:bg-blue-600"
       >
         提交成绩
       </a>
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

               {/* 姓名 */}
               <a 
                 href={`/users/${record.userId?._id || record.userId}`} 
                 className="font-semibold text-blue-600 truncate px-1"
               >
                 {record.userName}
               </a>

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
                     record.verificationStatus === 'verified'
                       ? 'text-green-500'
                       : record.reportedBy?.length > 0
                       ? 'text-red-500'
                       : 'text-gray-400'
                   }`}
                 />
               </div>
             </div>
           </div>

           {/* 展开的详细信息 */}
           {expandedCard === record._id && (
             <div className="px-4 pb-3 text-sm text-gray-600 border-t divide-y">
               {/* 基本信息 */}
               <div className="py-2 grid grid-cols-2 gap-2">
                 <div>
                   <span className="text-gray-500">性别:</span>
                   <span className="ml-2">{record.gender === 'M' ? '男' : '女'}</span>
                 </div>
                 <div>
                   <span className="text-gray-500">年龄:</span>
                   <span className="ml-2">{record.age || '-'}</span>
                 </div>
               </div>

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
               </div>

               {/* 验证信息 */}
               <div className="py-2">
                 {record.verifiedCount > 0 && (
                   <div className="flex items-center text-green-600">
                     <CheckCircle size={16} className="mr-2" />
                     <span>{record.verifiedCount}人已验证</span>
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
 );
};

export default MobileAgeAdjustedRankings;