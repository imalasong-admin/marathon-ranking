// components/mobile/MobileUltraRankings.js
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

export default function MobileUltraRankings({ records = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCard, setExpandedCard] = useState(null);
  
    // 搜索过滤
    const filteredRecords = records?.filter(record =>
        record?.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      ) || [];

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 头部区域 */}
      <div className="sticky top-0 bg-white shadow-sm z-10 p-2">
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
                <Link 
                  href={`/users/${record.userId?._id || record.userId}`}
                  className="font-semibold text-blue-600 truncate px-1"
                >
                  {record.userName}
                </Link>

                <div className="flex justify-center w-10">
                 
                </div>

                <div className="flex items-center justify-end w-18">
                  <span className="font-bold whitespace-nowrap">
                    {formatTime(record.finishTime)}
                  </span>
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
              <div className="grid grid-cols-[1fr_6.5rem_4.5rem] items-center gap-1">
              <div className="mb-1 text-sm">
                    
                    <span className="ml-1">{record.raceId?.seriesId?.name || '-'}</span>
                  </div>

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

                <div className="flex items-center text-sm w-18">
                   <span className="ml-2">{record.ultraDistance}</span>
                </div>
                
              </div>
            </div>

            {/* 扩展信息 */}
            {expandedCard === record._id && (
              <div className="px-4 pb-3 text-sm text-gray-600 border-t divide-y">
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

                <div className="py-2">
                  <div className="mb-1">
                  
                  
                    <span className="text-gray-500">日期:</span>
                    <span className="ml-2">{formatDate(record.raceId?.date)}</span>
                  </div>
                  
                  {/* 成绩证明 - 修改这部分 */}
  <div className="mt-1">
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
        {record.userName} 未提供成绩链接🔗
      </span>
    )}
  </div>
</div>
              

                {/* 验证信息 */}
                <div className="py-2">
                  {record.verifiedCount > 0 ? (
                    <>
                      <div className="flex items-center text-green-600 mb-2">
                        <CheckCircle size={16} className="mr-2" />
                        <span>{record.verifiedCount}人已验证</span>
                      </div>
                      {record.verifiedBy && record.verifiedBy.length > 0 && (
                        <div className="mt-1">
                          <span className="text-gray-500">验证人:</span>
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
                      <span className="text-red-500">被举报 {record.reportedBy.length} 次</span>
                      {record.reportedBy.map((report, index) => (
                        <div 
                          key={`report-${record._id}-${report.userId._id}-${index}`}
                          className="mt-1 text-gray-600"
                        >
                          <span>{report.userId.name}: </span>
                          <span className="text-red-600">{report.reason}</span>
                        </div>
                      ))}
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
}