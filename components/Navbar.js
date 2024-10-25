import React from 'react';
import Link from 'next/link';  // 确保这行存在
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* 左侧链接 */}
          <div className="flex space-x-8 items-center">
            <Link href="/" className="text-xl font-bold text-gray-800 hover:text-gray-900">
              马拉松排行榜
            </Link>
            <div className="hidden sm:flex space-x-4">
              <Link 
                href="/rankings" 
                className="px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                排行榜
              </Link>
              <Link 
                href="/submit" 
                className="px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                提交成绩
              </Link>
            </div>
          </div>
          
          {/* 右侧用户信息 */}
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-sm text-gray-600">欢迎, {session.user.name}</span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  退出
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;