// pages/users/submit.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function UserSubmitRecord() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);  // 控制步骤
  const [selectedType, setSelectedType] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [races, setRaces] = useState([]);
  const [isAddingNewRace, setIsAddingNewRace] = useState(false);
  const [newRaceName, setNewRaceName] = useState('');
  const [newRaceDate, setNewRaceDate] = useState('');
  const [newRaceLocation, setNewRaceLocation] = useState('');
  const [newRaceWebsite, setNewRaceWebsite] = useState('');
  const [formData, setFormData] = useState({
    hours: '',
    minutes: '',
    seconds: '',
    raceId: '',
    proofUrl: '',
  });

  // 比赛类型选项
  const raceTypes = [
    '全程马拉松',
    '超马50K',
    '超马50M',
    '超马100K',
    '超马100迈',
    '超马计时赛',
    '超马多日赛'
  ];

  // 年份选项（最近10年）
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 10}, (_, i) => (currentYear - i).toString());

  // 获取比赛列表
  useEffect(() => {
    if (step === 2) {
      const fetchRaces = async () => {
        try {
          const res = await fetch('/api/races');
          const data = await res.json();
          if (data.success) {
            // 根据第一步选择过滤比赛
            const filteredRaces = data.races.filter(race => {
              const raceDate = new Date(race.date);
              return raceDate.getFullYear() === parseInt(selectedYear) && 
                     race.raceType === selectedType;
            });
            setRaces(filteredRaces);
          }
        } catch (error) {
          console.error('获取比赛列表失败:', error);
          setError('获取比赛列表失败');
        }
      };

      fetchRaces();
    }
  }, [step, selectedYear, selectedType]);

  // 处理第一步提交
  const handleStepOneSubmit = (e) => {
    e.preventDefault();
    if (!selectedType) {
      setError('请选择比赛类型');
      return;
    }
    if (!selectedYear) {
      setError('请选择年份');
      return;
    }
    setError('');
    setStep(2);
  };

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

      const raceDate = new Date(newRaceDate);
      if (raceDate.getFullYear() !== parseInt(selectedYear)) {
        setError(`只能添加 ${selectedYear} 年的比赛`);
        return;
      }

      const res = await fetch('/api/races', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRaceName,
          date: newRaceDate,
          raceType: selectedType,
          location: newRaceLocation.trim(),
          website: newRaceWebsite.trim(),
          userId: session.user.id
        })
      });

      const data = await res.json();

      if (data.success) {
        setRaces([...races, data.race]);
        setFormData({ ...formData, raceId: data.race._id });
        setNewRaceName('');
        setNewRaceDate('');
        setNewRaceLocation('');
        setNewRaceWebsite('');
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

  // 处理成绩提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isAddingNewRace) {
        setError('请先完成新比赛添加或点击取消');
        return;
      }

      if (!formData.raceId) {
        setError('请选择比赛');
        return;
      }

      // 验证成绩时间
      if (!formData.hours && !formData.minutes && !formData.seconds) {
        setError('请填写完赛时间');
        return;
      }

      const totalSeconds = 
        parseInt(formData.hours || 0) * 3600 + 
        parseInt(formData.minutes || 0) * 60 + 
        parseInt(formData.seconds || 0);

      if (totalSeconds <= 0) {
        setError('请填写有效的完赛时间');
        return;
      }

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
        router.push('/users/' + session.user.id);
      } else {
        setError(data.message || '提交失败，请重试');
      }
    } catch (err) {
      console.error('提交错误:', err);
      setError('提交失败，请重试');
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
        <h1 className="text-3xl font-bold mb-8">提交比赛成绩</h1>
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

  // 第一步：选择比赛类型和年份
  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">提交比赛成绩 - 步骤 1</h1>
        
        <form onSubmit={handleStepOneSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md">
              {error}
            </div>
          )}

          {/* 比赛类型选择 */}
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-700">
              比赛类型
            </label>
            <div className="grid grid-cols-2 gap-4">
              {raceTypes.map(type => (
                <label 
                  key={type}
                  className={`
                    flex items-center p-4 rounded-lg border cursor-pointer
                    ${selectedType === type 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-blue-200'}
                  `}
                >
                  <input
                    type="radio"
                    name="raceType"
                    value={type}
                    checked={selectedType === type}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 年份选择 */}
          <div className="space-y-4">
            <label className="block text-lg font-medium text-gray-700">
              比赛年份
            </label>
            <div className="grid grid-cols-5 gap-4">
              {years.map(year => (
                <label 
                  key={year}
                  className={`
                    flex items-center justify-center p-3 rounded-lg border cursor-pointer
                    ${selectedYear === year 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-blue-200'}
                  `}
                >
                  <input
                    type="radio"
                    name="year"
                    value={year}
                    checked={selectedYear === year}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="hidden"
                  />
                  <span>{year}年</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Link
              href="/users/[id]"
              as={`/users/${session.user.id}`}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700"
            >
              返回个人中心
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              下一步
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 第二步：选择比赛和提交成绩
  if (step === 2) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">
          提交 {selectedYear}年{selectedType} 成绩
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md">
              {error}
            </div>
          )}

          {/* 完赛时间 */}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">比赛日期 ({selectedYear}年)</label>
                  <input
                    type="date"
                    value={newRaceDate}
                    onChange={(e) => setNewRaceDate(e.target.value)}
                
                      min={`${selectedYear}-01-01`}
                      max={`${selectedYear}-12-31`}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <input
                    type="text"
                    value={newRaceLocation}
                    onChange={(e) => setNewRaceLocation(e.target.value)}
                    placeholder="比赛地点（选填）"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <input
                    type="url"
                    value={newRaceWebsite}
                    onChange={(e) => setNewRaceWebsite(e.target.value)}
                    placeholder="官方网站（选填）"
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
                        setNewRaceLocation('');
                        setNewRaceWebsite('');
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
  
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700"
              >
                返回上一步
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                提交成绩
              </button>
            </div>
          </form>
        </div>
      );
    }
  
    // ... 第一步的代码保持不变
  }