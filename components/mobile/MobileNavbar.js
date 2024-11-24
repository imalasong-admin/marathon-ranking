// components/mobile/MobileNavbar.js
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Menu } from 'lucide-react';
import MobileNavMenu from './MobileNavMenu';

export default function MobileNavbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const getCurrentTitle = () => {
    switch (router.pathname) {
      case '/rankings':
        return '2024年度马拉松成绩榜';
      case '/age-adjusted-rankings':
        return '2024年度马拉松跑力榜';
      case '/ultra-rankings':
        return '2024年度超马越野榜';
      case '/ultra-rankings':
        return '提交成绩加入榜单';
      default:
        return '2024年度马拉松成绩榜';
    }
  };

  return (
    <nav className="bg-white shadow">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
              aria-label="菜单"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="ml-2">{getCurrentTitle()}</span>
          </div>

          {/* 右侧用户区域 */}
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <a 
                  href={`/users/${session.user.id}`}
                  className="text-gray-700 hover:text-blue-600 hover:underline"
                >
                  {session.user.name}  
                </a>
                <button
                  onClick={() => signOut()}
                  className="text-red-600 hover:text-red-700"
                >
                  退出
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a 
                  href="/login"
                  className="text-gray-700 hover:text-gray-900"
                >
                  登录
                </a>
                <a 
                  href="/register"
                  className="text-gray-700 hover:text-gray-900"
                >
                  注册
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileNavMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        currentPath={router.pathname}
      />
    </nav>
  );
}