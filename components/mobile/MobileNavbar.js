import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Menu } from 'lucide-react';
import { mobileStyles } from './common/styles';
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
    if (path === '/users/[id]/edit') {  // 编辑页面的路径
        return '个人中心';
      }
      
    switch (path) {
      case '/':
        return '首页';
        case '/stats':
            return '2024马拉松风云榜';
        case '/rankings':
            if (router.query.sort === 'completion') {
              return '2024马拉松完赛榜';
            }
            return gender === 'F' ? '2024马拉松女子最速100' : '2024马拉松男子最速100';
    case '/age-adjusted-rankings':
            return '2024马拉松跑力榜';
        case '/ultra-rankings':
        return '2024超马越野榜';
        case '/bq-rankings':
  return '2024马拉松BQ榜';
      case '/users/submit':
        return '提交成绩';
      case '/login':
        return '登录';
      case '/register':
        return '注册';
      default:
        return '首页';  // 默认标题
    }
  };
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <nav className={mobileStyles.nav.root}>
      <div className={mobileStyles.nav.container}>
        <div className={mobileStyles.nav.headerWrapper}>
          {/* Logo区域 */}
          <div className={mobileStyles.nav.logoWrapper}>
            <a href="/" className={mobileStyles.nav.logo}>
              北美华人跑榜
            </a>
          </div>

          {/* 标题和菜单按钮 */}
          <div className={mobileStyles.nav.titleWrapper}>
            <span className={mobileStyles.nav.pageTitle}>
              {getPageTitle()}
            </span>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={mobileStyles.nav.menuButton}
              aria-label="菜单"
            >
              <Menu className={mobileStyles.nav.menuIcon} />
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
