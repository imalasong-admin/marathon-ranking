// components/VerificationDialog.js
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { urlUtils } from '../lib/urlUtils';

const VerificationDialog = ({
  isOpen,
  onClose,
  record,
  error,
  onVerify,
  onReport,
}) => {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h3 className="text-lg font-semibold mb-4">验证成绩记录</h3>
        
        {error && (
          <div className="mb-4 bg-red-50 text-red-500 p-4 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* 成绩信息 */}
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-600">
              比赛：{record?.raceId?.seriesId?.name} ({formatDate(record?.raceId?.date)})
            </p>
            <p className="text-sm text-gray-600">
              成绩：{record?.finishTime.hours}:{String(record?.finishTime.minutes).padStart(2, '0')}:{String(record?.finishTime.seconds).padStart(2, '0')}
            </p>
            {record?.proofUrl ? (
              <p className="text-sm text-gray-600">
                证明链接：
                <a 
                  href={urlUtils.getDisplayUrl(record.proofUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  查看证明
                </a>
              </p>
            ) : (
              <p className="text-sm text-red-500">未提供成绩证明</p>
            )}

            {/* 验证和举报信息 */}
            {record?.verifiedBy?.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <div className="flex items-center text-green-600 mb-2">
                  <CheckCircle size={16} className="mr-2" />
                  {record.verifiedBy.length}人验证
                </div>
                <div className="ml-2 flex flex-wrap gap-2">
                  {record.verifiedBy.map(verification => (
                    <Link
                      key={verification.userId._id}
                      href={`/users/${verification.userId._id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {verification.userId.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {record?.reportedBy?.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <span className="text-red-500">⚠️ {record.reportedBy.length} 人存疑</span>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700"
            >
              关闭
            </button>
            <button
              onClick={onVerify}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              跑的真好！我确认这个成绩真实有效👍
            </button>
            <button
              onClick={onReport}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              我对这个成绩的真实性有疑问🤔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDialog;