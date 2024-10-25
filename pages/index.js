import React from 'react';
import Link from 'next/link';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* 移除原来的标题，因为导航栏已经有了 */}
      <div className="text-center">
        <p className="mt-3 text-xl text-gray-600 mb-8">
          记录您的最佳成绩，查看全国跑者排名
        </p>
        <div className="space-x-4">
          <Link
            href="/rankings"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            查看排行榜
          </Link>
          <Link
            href="/submit"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            提交成绩
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;