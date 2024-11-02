// pages/submit.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SubmitRecord() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState('');
  const [races, setRaces] = useState([]);
  const [isAddingNewRace, setIsAddingNewRace] = useState(false);
  const [newRaceName, setNewRaceName] = useState('');
  const [newRaceDate, setNewRaceDate] = useState('');
  const [formData, setFormData] = useState({
    hours: '',
    minutes: '',
    seconds: '',
         //date: '',  移除date字段
    raceId: '',          // 现有比赛的ID
    proofUrl: '',        // 成绩证明链接
  });

  // 加载比赛列表
  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const res = await fetch('/api/races');
        const data = await res.json();
        if (data.success) {
          setRaces(data.races);
        }
      } catch (error) {
        console.error('获取比赛列表失败:', error);
      }
    };

    fetchRaces();
  }, []);

  // 处理添加新比赛
  const handleAddNewRace = async () => {
    try {
      if (!newRaceName.trim()) {
        setError('比赛名称不能为空');
        return;
      }

      if (!newRaceDate) {
        setError('请选择比赛日期');
        return;
      }

      const res = await fetch('/api/races', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRaceName,
          date: newRaceDate,
          userId: session.user.id
        })
      });

      const data = await res.json();

      if (data.success) {
        setRaces([...races, data.race]);
        setFormData({ ...formData, raceId: data.race._id });
        setNewRaceName('');
        setNewRaceDate('');
        setIsAddingNewRace(false);
        setError('');
      } else {
        setError(data.message || '添加比赛失败');
      }
    } catch (error) {
      console.error('添加比赛错误:', error);
      setError('添加比赛失败，请重试');
    }
  };

  // 处理登录状态
  if (status === "loading") {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <div>加载中...</div>
      </div>
    );
  }

  // 如果未登录，显示登录提示
  if (!session) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <h1 className="text-3xl font-bold mb-8">提交马拉松成绩</h1>
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          请先登录
        </div>
        <Link 
          href="/login"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          去登录
        </Link>
      </div>
    );
  }

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 计算总秒数
      const totalSeconds = 
        parseInt(formData.hours) * 3600 + 
        parseInt(formData.minutes) * 60 + 
        parseInt(formData.seconds);

      const res = await fetch('/api/records/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          totalSeconds
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('成绩提交成功！');
        router.push('/rankings');
      } else {
        setError(data.message || '提交失败，请重试');
      }
    } catch (err) {
      console.error('提交错误:', err);
      setError('提交失败，请重试');
    }
  };

  // 已登录用户看到的表单界面
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md">
            {error}
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium mb-4">完赛时间</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">时</label>
              <input
                type="number"
                min="0"
                max="23"
                value={formData.hours}
                onChange={(e) => setFormData({...formData, hours: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">分</label>
              <input
                type="number"
                min="0"
                max="59"
                value={formData.minutes}
                onChange={(e) => setFormData({...formData, minutes: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">秒</label>
              <input
                type="number"
                min="0"
                max="59"
                value={formData.seconds}
                onChange={(e) => setFormData({...formData, seconds: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* 比赛选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">比赛名称</label>
          {!isAddingNewRace ? (
            <div className="mt-1 flex space-x-2">
              <select
                value={formData.raceId}
                onChange={(e) => setFormData({...formData, raceId: e.target.value})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">请选择比赛</option>
                {races.map((race) => (
                  <option key={race._id} value={race._id}>
                    {race.name} ({new Date(race.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsAddingNewRace(true)}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
              >
                添加新比赛
              </button>
            </div>
          ) : (
            <div className="mt-1 space-y-2">
              <input
                type="text"
                value={newRaceName}
                onChange={(e) => setNewRaceName(e.target.value)}
                placeholder="请输入比赛名称"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="date"
                value={newRaceDate}
                onChange={(e) => setNewRaceDate(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleAddNewRace}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  确认添加
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNewRace(false);
                    setNewRaceName('');
                    setNewRaceDate('');
                    setError('');
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

       

        {/* 成绩证明 */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            成绩证明链接
            <span className="text-gray-500 text-xs ml-2">(官方成绩查询链接或截图链接)</span>
          </label>
          <input
            type="url"
            value={formData.proofUrl}
            onChange={(e) => setFormData({...formData, proofUrl: e.target.value})}
            placeholder="请输入成绩证明链接"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          提交成绩
        </button>
      </form>
    </div>
  );
}