import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('退出错误:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex 
justify-between items-center">
          <h1 className="text-2xl font-semibold 
text-gray-900">年度马拉松成绩排行榜</h1>
          {session ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">欢迎, 
{session.user.name}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-600 hover:text-red-800"
              >
                退出
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="mt-3 text-xl text-gray-500">
            记录您的最佳成绩，查看全国跑者排名
          </p>
          
          <div className="mt-8 space-x-4">
            <Link
              href="/rankings"
              className="inline-block bg-blue-600 text-white px-6 py-3 
rounded-md hover:bg-blue-700"
            >
              查看排行榜
            </Link>
            
            {session ? (
              <Link
                href="/submit"
                className="inline-block bg-green-600 text-white px-6 py-3 
rounded-md hover:bg-green-700"
              >
                提交成绩
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-block bg-green-600 text-white px-6 py-3 
rounded-md hover:bg-green-700"
              >
                登录提交成绩
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
