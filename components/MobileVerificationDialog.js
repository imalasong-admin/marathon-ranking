// components/MobileVerificationDialog.js
import React from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { urlUtils } from '../lib/urlUtils';

const MobileVerificationDialog = ({
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
      <div className="bg-white rounded-lg w-full max-w-md mx-auto p-4">
        <h3 className="text-lg font-semibold mb-4">验证成绩记录</h3>

        {error && (
          <div className="mb-4 bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <p className="text-gray-600">
              比赛：{record?.raceId?.seriesId?.name} ({formatDate(record?.raceId?.date)})
            </p>
            <p className="text-gray-600">
              成绩：{record?.finishTime.hours}:{String(record?.finishTime.minutes).padStart(2, '0')}:{String(record?.finishTime.seconds).padStart(2, '0')}
            </p>
            {record?.proofUrl ? (
              <p className="text-gray-600">
                证明链接：
                <a
                  href={urlUtils.getDisplayUrl(record.proofUrl)}
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
              onClick={onVerify}
              className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>跑的真好！我确信这个成绩真实有效</span>
              <span>👍</span>
            </button>

            <button
              onClick={onReport}
              className="w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>我对这个成绩的真实性有疑问</span>
              <span>🤔</span>
            </button>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileVerificationDialog;
