// components/mobile/MobileNavMenu.js
import Link from 'next/link';
import { mobileStyles } from './common/styles';

export default function MobileNavMenu({ isOpen, onClose, session, onLogout }) {
  if (!isOpen) return null;

  const navItem = mobileStyles.nav.menu.item;

  return (
    <>
      <div 
        className={mobileStyles.nav.menu.overlay}
        onClick={onClose}
      />
      
      <div className={mobileStyles.nav.menu.container}>
        <div className={mobileStyles.nav.menu.wrapper}>
          <Link href="/" className={navItem} onClick={onClose}>
           首页@www.iMaLaSong.com
          </Link>
          
          <Link href="/rankings" className={navItem} onClick={onClose}>
             2024马拉松完赛榜
          </Link>
          <Link href="/ultra-rankings" className={navItem} onClick={onClose}>
            2024超马越野榜
          </Link>
  

          <Link href="/age-adjusted-rankings" className={navItem} onClick={onClose}>
            2024马拉松跑力榜
          </Link>
 
          <Link href="/bq-rankings" className={navItem} onClick={onClose}>
  2024马拉松BQ榜
</Link>

<Link href="/faq" className={navItem} onClick={onClose}>
  常见问题
</Link>
          {session ? (
            <>
              <Link 
                href={`/users/${session.user.id}`} 
                className={navItem} 
                onClick={onClose}
              >
                个人中心
              </Link>
              
              <Link href="/users/submit" className={navItem} onClick={onClose}>
                提交成绩
              </Link>
              <Link href="/faq" className={navItem} onClick={onClose}>
  常见问题
</Link>
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className={navItem}
              >
                退出登录
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navItem} onClick={onClose}>
                登录
              </Link>
              
              <Link href="/register-step1" className={navItem} onClick={onClose}>
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}