import Link from 'next/link';

export default function MobileNavMenu({ isOpen, onClose, session, onLogout }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg z-50">
        <div className="py-6">
        <Link
  href="/"
  className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
  onClick={onClose}
>
  2024年度风云榜
</Link>
        <Link
  href="/rankings?gender=M"
  className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
  onClick={onClose}
>
  2024马拉松男子榜
</Link>

<Link
  href="/rankings?gender=F"
  className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
  onClick={onClose}
>
  2024马拉松女子榜
</Link>
          

          
          <Link
            href="/ultra-rankings"
            className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            2024超马越野榜
          </Link>

          {session ? (
            <>
              <Link
                href={`/users/${session.user.id}`}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={onClose}
              >
                个人中心
              </Link>
              
              <Link
                href="/users/submit"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={onClose}
              >
                提交成绩
              </Link>

              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                退出登录
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={onClose}
              >
                登录
              </Link>
              
              <Link
                href="/register"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={onClose}
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}