// components/Navbar.js
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold">
                北美华人跑榜
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/rankings"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                2024年马拉松榜
              </Link>
              <Link
                href="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                2024年超马榜
              </Link>
              
            </div>
          </div>
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href={`/users/${session.user.id}`}
                  className="text-gray-700 hover:text-blue-600 hover:underline"
                >
                  欢迎, {session.user.name}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-red-600 hover:text-red-700"
                >
                  退出
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}