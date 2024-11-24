import { useState, useEffect, useRef } from 'react';  // 添加 useRef
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Menu, UserCircle, UserPlus, LogOut } from 'lucide-react';  // 添加图标
import MobileNavMenu from './MobileNavMenu';

export default function MobileNavbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);  // 用户菜单状态
  const userMenuRef = useRef(null);  // 用于点击外部关闭
  const router = useRouter();

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCurrentTitle = () => {
    switch (router.pathname) {
      case '/rankings':
        return '2024年度马拉松成绩榜';
      case '/age-adjusted-rankings':
        return '2024年度马拉松跑力榜';
      case '/ultra-rankings':
        return '2024年度超马越野榜';
      case '/users/submit':
        return '提交成绩'; 
     default:
        return '2024年度马拉松成绩榜';
    }
  };

  // 处理退出登录
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
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

          {/* 右侧用户图标区域 */}
          <div className="flex items-center" ref={userMenuRef}>
            {session ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2"
                  aria-label="用户菜单"
                >
                  <UserCircle 
                    className="w-6 h-6 text-blue-600 hover:text-blue-700"
                  />
                </button>

                {/* 用户下拉菜单 */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <a 
                      href={`/users/${session.user.id}`}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <UserCircle className="w-4 h-4 mr-2" />
                      个人中心
                    </a>
                    <a 
                      href="/users/submit"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      提交成绩
                    </a>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <a 
                href="/login"
                className="p-2"
                aria-label="登录"
              >
                <UserCircle 
                  className="w-6 h-6 text-gray-400 hover:text-gray-500"
                />
              </a>
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