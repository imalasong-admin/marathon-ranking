// pages/index.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/rankings');
  }, [router]);

  // 返回一个加载状态，避免闪烁
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">跳转中...</div>
    </div>
  );
}