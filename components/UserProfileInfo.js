// components/UserProfileInfo.js
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useDeviceDetection } from '../lib/deviceDetection';

const formatBirthDate = (dateString) => {
 if (!dateString) return '';
 try {
   const date = new Date(dateString);
   if (isNaN(date.getTime())) return '';
   const year = date.getUTCFullYear();
   const month = date.getUTCMonth() + 1;
   return `[${year}.${month}]`;
 } catch (error) {
   return '';
 }
};

export default function UserProfileInfo({ user, isOwnProfile }) {
  const isMobile = useDeviceDetection();

  if (isMobile) {
    return (
      <div className="p-4">
        {/* 基本信息 */}
        <div className="flex flex-wrap items-center gap-x-2 mb-2">
          <span className="font-bold text-lg">{user.name}</span>
          <span className="text-sm">
            [{user.gender === 'M' ? '男' : '女'}] {formatBirthDate(user.birthDate)}
          </span>
          {isOwnProfile && (
            <Link 
              href={`/users/${user._id}/edit`}
              className="text-blue-600 hover:text-blue-800 text-sm ml-auto"
            >
              编辑
            </Link>
          )}
        </div>

        {/* 常住地 */}
        <div className="text-sm text-gray-600 mb-1">
          {user.state && user.city ? 
            `${user.state} - ${user.city}` : 
            null
          }
        </div>

        {/* Strava链接 */}
        {user.stravaUrl && (
          <div className="text-sm text-blue-600 hover:text-blue-800 truncate">
            <a
              href={user.stravaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline inline-flex items-center"
            >
              <span className="truncate">{user.stravaUrl}</span>
              <ExternalLink size={14} className="ml-1 shrink-0" />
            </a>
          </div>
        )}

        {/* 简介 */}
        <div className="text-sm text-gray-600 mt-2">
          {user.bio || '没写简介'}
        </div>
      </div>
    );
  }

  // 桌面端布局保持不变
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* 第一行：用户名、性别、生日和常住地 */}
      <div className="flex justify-between mb-2">
        <div className="flex items-center gap-1">
          <span className="font-bold text-xl">{user.name}</span>
          <span className="text-base">
            [{user.gender === 'M' ? '男' : '女'}] {formatBirthDate(user.birthDate)}
          </span>
          [<span className="text-base">
            {user.state && user.city ? 
              `${user.state} - ${user.city}` : 
              null
            }
          </span>]
        </div>
        {isOwnProfile && (
          <Link 
            href={`/users/${user._id}/edit`}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            编辑个人信息
          </Link>
        )}
      </div>

      {/* Strava链接 */}
      {user.stravaUrl && (
        <div className="text-sm text-blue-600 hover:text-blue-800">
          <a
            href={user.stravaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {user.stravaUrl}
          </a>
        </div>
      )}

      {/* 简介 */}
      <div className="text-sm text-gray-600 mt-2">
        {user.bio || '没写简介'}
      </div>
    </div>
  );
}