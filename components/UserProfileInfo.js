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

const BioContent = ({ bio }) => (
    <div className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
      {bio || '没写简介'}
    </div>
  );

export default function UserProfileInfo({ user, isOwnProfile }) {
  const isMobile = useDeviceDetection();

  if (isMobile) {
    return (
      <div className="p-4">
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

        <div className="text-sm text-gray-600 mb-1">
          {user.state && user.city ? 
            `${user.state} - ${user.city}` : 
            null
          }
        </div>

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

        <BioContent bio={user.bio} />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
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

      <BioContent bio={user.bio} />
    </div>
  );
}