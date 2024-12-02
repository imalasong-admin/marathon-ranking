// components/mobile/users/MobileUserProfile.js
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
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
  const [submitError, setSubmitError] = useState('');
  const [isUrlValid, setIsUrlValid] = useState(true);
  const { data: session } = useSession();

// 验证相关状态
const [showVerifyDialog, setShowVerifyDialog] = useState(false);
const [verifyingRecord, setVerifyingRecord] = useState(null);
// const [reportReason, setReportReason] = useState('');
const [verifyError, setVerifyError] = useState('');

  // 新增：URL验证函数
  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
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
  // 新增：处理URL输入变化
  const handleUrlChange = (e) => {
    const url = e.target.value;
    setProofUrl(url);
    setIsUrlValid(validateUrl(url) || url === '');
    setSubmitError('');
  };

  // 新增：处理提交
  const handleSubmit = async (recordId) => {
    setSubmitError('');
  
    if (!proofUrl.trim()) {
      setSubmitError('请输入链接');
      return;
    }
  
    if (!validateUrl(proofUrl)) {
      setSubmitError('请输入有效的链接');
      return;
    }
  
    const result = await onSubmitProof(recordId);
    if (result?.success) {
      // 提交成功后只收起输入框，不刷新页面
      setEditingRecordId(null);
      setProofUrl('');
      setExpandedCard(null);
    } else if (result?.error) {
      setSubmitError(result.error);
    }
  };

  if (!userData?.data) {
    return null;
  }

  const { user, records } = userData.data;


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
                <div className="flex items-center justify-between">
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
              <div className="relative">
                <input
                  type="url"
                  value={proofUrl}
                  onChange={handleUrlChange}
                  placeholder="输入成绩链接"
                  className={`w-full px-2 py-1 border rounded text-sm ${
                    !isUrlValid ? 'border-red-500' : ''
                  }`}
                />
                {submitError && (
                  <div className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded">
                    {submitError}
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSubmit(record._id)}
                  disabled={isSubmittingProof || !proofUrl.trim() || !isUrlValid}
                  className={`text-sm px-3 py-1 rounded ${
                    isSubmittingProof || !proofUrl.trim() || !isUrlValid
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {isSubmittingProof ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={() => {
                    setEditingRecordId(null);
                    setProofUrl('');
                    setSubmitError('');
                  }}
                  className="text-gray-500 text-sm px-3 py-1"
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
        
        <button
                            onClick={(e) => handleVerifyClick(record, e)}
                            className="text-red-600 hover:text-blue-800"
                          >
                            验证/存疑
                          </button>
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
                      <span className="text-red-500">⚠️ {record.reportedBy.length} 人存疑</span>
                     
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
    {/* 验证对话框 */}
 {showVerifyDialog && <VerifyDialog />}
 </>
  );
};

export default MobileUserProfile;