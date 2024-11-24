// components/mobile/users/MobileUserProfile.js
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, ChevronUp, CheckCircle, ExternalLink } from 'lucide-react';
import UserProfileInfo from '../../../components/UserProfileInfo';

// 辅助函数
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

const getDistanceDisplay = (record) => {
  const raceType = record.raceId?.seriesId?.raceType;
  if (!raceType) return '-';

  if (raceType === '超马' && record.ultraDistance) {
    return record.ultraDistance;
  } else if (raceType === '全程马拉松') {
    return '26.2英里';
  }
  return '-';
};

const MobileUserProfile = ({ 
  userData, 
  isOwnProfile,
  onVerifyClick,
  onSubmitProof,
  editingRecordId,
  setEditingRecordId,
  proofUrl,
  setProofUrl,
  isSubmittingProof,
  profileId 
}) => {
  const [expandedCard, setExpandedCard] = useState(null);

  if (!userData?.data) {
    return null;
  }

  const { user, records } = userData.data;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 用户信息区域 */}
      <div className="bg-white shadow-sm">
        <UserProfileInfo 
          user={{
            ...user,
            _id: profileId  
          }} 
          isOwnProfile={isOwnProfile} 
        />
      </div>

      {/* 成绩列表区域 */}
      <div className="flex-1 p-4 space-y-2">
        {/* 标题和提交按钮 */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">比赛成绩</h2>
          {isOwnProfile && (
            <Link
              href="/users/submit"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              提交成绩
            </Link>
          )}
        </div>

        {/* 成绩卡片列表 */}
        {records.map((record) => (
          <div 
            key={record._id}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            {/* 主要信息 */}
            <div className="px-4 py-3">
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                {/* 比赛名称 */}
                <div className="font-medium text-gray-900">
                  {record.raceId?.seriesId?.name || '-'}
                </div>
                
                {/* 成绩和验证状态 */}
                <div className="flex items-center space-x-1">
                  <span className="font-bold">{formatTime(record.finishTime)}</span>
                  <button
                    onClick={() => onVerifyClick(record)}
                    className={`${
                      record.verificationStatus === 'verified'
                        ? 'text-green-500'
                        : record.reportedBy?.length > 0
                        ? 'text-red-500'
                        : 'text-gray-400'
                    }`}
                  >
                    <CheckCircle size={16} />
                  </button>
                </div>

                {/* 展开按钮 */}
                <button
                  onClick={() => setExpandedCard(expandedCard === record._id ? null : record._id)}
                  className="p-1"
                >
                  {expandedCard === record._id ? (
                    <ChevronUp className="text-gray-400" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={20} />
                  )}
                </button>
              </div>

              {/* 项目和日期信息 */}
              <div className="mt-1 text-sm text-gray-500">
                <span className="mr-4">项目: {getDistanceDisplay(record)}</span>
                <span>日期: {formatDate(record.raceId?.date)}</span>
              </div>
            </div>

            {/* 展开的详细信息 */}
            {expandedCard === record._id && (
              <div className="px-4 pb-3 text-sm text-gray-600 border-t divide-y">
                {/* 成绩证明 */}
                <div className="py-2">
                  {record.proofUrl ? (
                    <div className="flex items-center">
                      <span className="mr-2">成绩证明:</span>
                      <a
                        href={record.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 flex items-center"
                      >
                        查看链接 <ExternalLink size={14} className="ml-1" />
                      </a>
                    </div>
                  ) : isOwnProfile ? (
                    editingRecordId === record._id ? (
                      <div className="space-y-2">
                        <input
                          type="url"
                          value={proofUrl}
                          onChange={(e) => setProofUrl(e.target.value)}
                          placeholder="输入成绩链接"
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onSubmitProof(record._id)}
                            disabled={isSubmittingProof || !proofUrl.trim()}
                            className="text-blue-600 text-sm disabled:opacity-50"
                          >
                            {isSubmittingProof ? '保存中...' : '保存'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingRecordId(null);
                              setProofUrl('');
                            }}
                            className="text-gray-500 text-sm"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingRecordId(record._id)}
                        className="text-blue-600 text-sm"
                      >
                        点击提供成绩证明
                      </button>
                    )
                  ) : (
                    <span className="text-red-500">未提供成绩证明</span>
                  )}
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
                          <span>验证人:</span>
                          <div className="ml-2 flex flex-wrap gap-2">
                            {record.verifiedBy.map((verification, index) => (
                              <Link
                                key={`verify-${record._id}-${verification.userId._id}-${index}`}
                                href={`/users/${verification.userId._id}`}
                                className="text-blue-600"
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
                          className="mt-1"
                        >
                          <Link
                            href={`/users/${report.userId._id}`}
                            className="text-blue-600"
                          >
                            {report.userId.name}
                          </Link>
                          <span className="text-red-600 ml-1">
                            : {report.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {records.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无比赛成绩
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileUserProfile;