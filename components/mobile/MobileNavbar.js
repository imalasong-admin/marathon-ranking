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

    if (path === '/users/[id]' || path === `/users/${userId}`) {
      return '个人中心';
    }

    switch (path) {
      case '/rankings':
        return '2024马拉松成绩榜';
      case '/age-adjusted-rankings':
        return '2024马拉松跑力榜';
      case '/ultra-rankings':
        return '2024超马越野榜';
      case '/users/submit':
        return '提交成绩';
      case '/login':
        return '登录';
      case '/register':
        return '注册';
      default:
        return '';
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="px-4">
        <div className="flex justify-between items-center h-16">
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