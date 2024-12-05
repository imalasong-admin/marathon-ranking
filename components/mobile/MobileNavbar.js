import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Menu } from 'lucide-react';
import MobileNavMenu from './MobileNavMenu';

export default function MobileNavbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const getPageTitle = () => {
    const path = router.pathname;
    const userId = session?.user?.id;
    const gender = router.query.gender;  // 获取 URL 参数
  
    if (path === '/users/[id]' || path === `/users/${userId}`) {
      return '个人中心';
    }
  
    switch (path) {
      case '/':
        return '2024年度风云榜';
      case '/rankings':
        return gender === 'F' ? '2024马拉松女子榜' : '2024马拉松男子榜';
      case '/ultra-rankings':
        return '2024超马越野榜';
      case '/users/submit':
        return '提交成绩';
      case '/login':
        return '登录';
      case '/register':
        return '注册';
      default:
        return '2024年度风云榜';  // 默认标题
    }
  };
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="px-4">
        <div className="flex justify-between items-center h-10">
          {/* Left: Text Logo */}
          <div className="flex items-center">
            <a href="/" className="text-lg font-bold text-gray-900">
              北美华人跑榜
            </a>
          </div>

          {/* Right: Title and Menu Button */}
          <div className="flex items-center space-x-2">
            <span className="text-base font-medium text-gray-900">
              {getPageTitle()}
            </span>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
              aria-label="菜单"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <MobileNavMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        session={session}
        onLogout={handleLogout}
      />
    </nav>
  );
}