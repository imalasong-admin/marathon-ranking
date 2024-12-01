// pages/users/submit.js
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useDeviceDetection } from '../../lib/deviceDetection';

const raceTypes = [
  '全程马拉松',
  '超马'
];

const ultraDistanceOptions = [
  '50K',
  '50M',
  '100K',
  '100M',
  '计时赛',
  '多日赛',
  '其他距离'
];

export default function UserSubmitRecord() {
  const isMobile = useDeviceDetection();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [races, setRaces] = useState([]);
  const [isAddingNewRace, setIsAddingNewRace] = useState(false);
  const [newRaceName, setNewRaceName] = useState('');
  const [newRaceDate, setNewRaceDate] = useState('');
  const [newRaceLocation, setNewRaceLocation] = useState('');
  const [newRaceWebsite, setNewRaceWebsite] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    hours: '',
    minutes: '',
    seconds: '',
    raceId: '',
    proofUrl: '',
    ultraDistance: ''
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 1}, (_, i) => (currentYear - i).toString());

  // 样式类定义
  const containerClass = isMobile
    ? "min-h-screen bg-gray-50"
    : "max-w-2xl mx-auto py-8 px-4";

  const titleClass = isMobile
    ? "text-xl font-bold mb-4"
    : "text-3xl font-bold mb-8";

  const inputClass = isMobile
    ? "block w-full h-12 rounded-md border-gray-300"
    : "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500";

  const selectClass = isMobile
    ? "block w-full h-12 rounded-md border-gray-300"
    : "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500";

  const buttonClass = isMobile
    ? "w-full h-12 flex justify-center items-center bg-blue-600 text-white rounded-md"
    : "px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700";

  const secondaryButtonClass = isMobile
    ? "block w-full h-12 flex items-center justify-center text-gray-600"
    : "px-4 py-2 text-gray-600";


  useEffect(() => {
    if (step === 2) {
      const fetchRaces = async () => {
        try {
          const res = await fetch(`/api/races?year=${selectedYear}&type=${selectedType}`);
          const data = await res.json();
          
          if (data.success) {
            const formattedRaces = data.races.map(race => ({
              _id: race._id,
              name: race.seriesId.name,
              date: race.date,
              isLocked: race.isLocked
            }));
            setRaces(formattedRaces);
          }
        } catch (error) {
          console.error('获取比赛列表失败:', error);
          setError('获取比赛列表失败');
        }
      };
      fetchRaces();
    }
  }, [step, selectedYear, selectedType]);

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
  
      const seriesRes = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRaceName.trim(),
          raceType: selectedType,
          location: newRaceLocation.trim(),
          website: newRaceWebsite.trim()
        })
      });
  
      const seriesData = await seriesRes.json();
      
      if (!seriesData.success) {
        setError(seriesData.message || '添加赛事失败');
        return;
      }
  
      const raceRes = await fetch('/api/races', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesId: seriesData.series._id,
          date: newRaceDate + 'T12:00:00.000Z'
        })
      });
  
      const raceData = await raceRes.json();
  
      if (raceData.success) {
        setRaces([...races, {
          _id: raceData.race._id,
          name: seriesData.series.name,
          date: raceData.race.date,
          isLocked: false
        }]);
        setFormData({
          ...formData,
          raceId: raceData.race._id
        });
        setNewRaceName('');
        setNewRaceDate('');
        setNewRaceLocation('');
        setNewRaceWebsite('');
        setIsAddingNewRace(false);
        setError('');
      } else {
        setError(raceData.message || '添加场次失败');
      }
    } catch (error) {
      console.error('添加比赛错误:', error);
      setError('添加失败，请重试');
    }
  };

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
  
      if (selectedType === '超马' && !formData.ultraDistance) {
        setError('请选择参赛项目');
        return;
      }
  
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
  
      const submitData = {
        raceId: formData.raceId,
        hours: parseInt(formData.hours || 0),
        minutes: parseInt(formData.minutes || 0),
        seconds: parseInt(formData.seconds || 0),
        totalSeconds,
        proofUrl: formData.proofUrl || '',
        ...(selectedType === '超马' ? { ultraDistance: formData.ultraDistance } : {})
      };

      const res = await fetch('/api/records/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccessModal(true);
        setTimeout(() => {
          router.push('/users/' + session.user.id);
        }, 1500);
      } else {
        setError(data.message || '提交失败，请重试');
      }
    } catch (err) {
      console.error('提交错误:', err);
      setError('提交失败，请重试');
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        {isMobile && (
          <div className="sticky top-0 bg-white shadow-sm px-4 h-12 flex items-center">
            <span className="text-lg">提交比赛成绩</span>
          </div>
        )}
        <div className="px-4 py-4 text-center">加载中...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={containerClass}>
        {isMobile && (
          <div className="sticky top-0 bg-white shadow-sm px-4 h-12 flex items-center">
            <span className="text-lg">提交比赛成绩</span>
          </div>
        )}
        <div className="px-4 py-4 text-center">
          <h1 className={titleClass}>提交比赛成绩</h1>
          <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
            请先登录
          </div>
          <Link href="/login" className={buttonClass}>
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>

      {step === 1 ? (
        <div className="px-4">
          
          
          <form onSubmit={handleStepOneSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-base font-medium text-gray-700">
                比赛类型
              </label>
              <div className={isMobile ? "space-y-2" : "grid grid-cols-2 gap-4"}>
                {raceTypes.map(type => (
                  <label 
                    key={type}
                    className={`
                      flex items-center p-3 rounded-lg border cursor-pointer
                      ${selectedType === type 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'}
                    `}
                  >
                    <input
                      type="radio"
                      name="raceType"
                      value={type}
                      checked={selectedType === type}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="h-5 w-5 text-blue-600"
                    />
                    <span className="ml-3 text-base">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-base font-medium text-gray-700">
                比赛年份
              </label>
              <div className={isMobile ? "flex overflow-x-auto space-x-2 pb-2" : "grid grid-cols-5 gap-4"}>
                {years.map(year => (
                  <label 
                    key={year}
                    className={`
                      flex items-center justify-center p-3 rounded-lg border
                      ${isMobile ? 'min-w-[100px]' : ''}
                      ${selectedYear === year 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200'}
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
                    <span className="text-base">{year}年</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={isMobile ? "fixed bottom-0 left-0 right-0 p-4 bg-white border-t" : "flex justify-between pt-4"}>
              <Link
                href={`/users/${session.user.id}`}
                className={secondaryButtonClass}
              >
                返回个人中心
              </Link>
              <button type="submit" className={buttonClass}>
                下一步
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="px-4 pb-20">
          <h1 className={titleClass}>
            提交 {selectedYear}年{selectedType} 成绩
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">比赛名称</label>
              {!isAddingNewRace ? (
                <div className="mt-1 flex space-x-2">
                  <select
                    value={formData.raceId}
                    onChange={(e) => setFormData({...formData, raceId: e.target.value})}
                    className={selectClass}
                    required
                  >
                    <option value="">请选择比赛</option>
                    {races.map((race) => (
                      <option key={race._id} value={race._id}>
                        {race.name} ({new Date(race.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          timeZone: 'UTC'
                        })})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewRace(true)}
                    className={secondaryButtonClass}
                  >
                    添加新比赛
                  </button>
                </div>
              ) : (
                <div className="mt-1 space-y-3">
                  <input
                    type="text"
                    value={newRaceName}
                    onChange={(e) => setNewRaceName(e.target.value)}
                    placeholder="请输入比赛名称"
                    className={inputClass}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      比赛日期 ({selectedYear}年)
                    </label>
                    <input
                      type="date"
                      value={newRaceDate}
                      onChange={(e) => setNewRaceDate(e.target.value)}
                      min={`${selectedYear}-01-01`}
                      max={`${selectedYear}-12-31`}
                      className={inputClass}
                    />
                  </div>
                  <input
                    type="text"
                    value={newRaceLocation}
                    onChange={(e) => setNewRaceLocation(e.target.value)}
                    placeholder="比赛地点（选填）"
                    className={inputClass}
                  />
                  <input
                    type="url"
                    value={newRaceWebsite}
                    onChange={(e) => setNewRaceWebsite(e.target.value)}
                    placeholder="官方网站（选填）"
                    className={inputClass}
                  />
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleAddNewRace}
                      className={buttonClass}
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
                      className={secondaryButtonClass}
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>

            {selectedType === '超马' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  参赛项目
                  <span className="text-gray-500 text-xs ml-2">
                    (请选择您参加的具体项目)
                  </span>
                </label>
                <select
                  value={formData.ultraDistance}
                  onChange={(e) => setFormData({...formData, ultraDistance: e.target.value})}
                  className={selectClass}
                  required
                >
                  <option value="">请选择参赛项目</option>
                  {ultraDistanceOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <h3 className="text-base font-medium mb-3">完赛时间</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">时</label>
                  <input
                    type="number"
                    min="2"
                    max="240"
                    value={formData.hours}
                    onChange={(e) => setFormData({...formData, hours: e.target.value})}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={formData.minutes}
                    onChange={(e) => setFormData({...formData, minutes: e.target.value})}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">秒</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={formData.seconds}
                    onChange={(e) => setFormData({...formData, seconds: e.target.value})}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                成绩证明链接
                <span className="text-gray-500 text-xs ml-2">
                  (官方成绩查询链接/Strava活动链接/Athlinks成绩链接)
                </span>
              </label>
              <input
                type="url"
                value={formData.proofUrl}
                onChange={(e) => setFormData({...formData, proofUrl: e.target.value})}
                placeholder="请输入成绩证明链接"
                className={inputClass}
              />
            </div>

            <div className={isMobile ? "fixed bottom-0 left-0 right-0 p-4 bg-white border-t" : "flex justify-between"}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className={secondaryButtonClass}
              >
                返回上一步
              </button>
              <button type="submit" className={buttonClass}>
                提交成绩
              </button>
            </div>
          </form>
        </div>
      )}
    
    {/* 添加在最后 */}
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showSuccessModal ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 text-center">
        <p className="text-lg mb-4">成绩提交成功！</p>
        <div className="bg-blue-600 text-white py-2 px-4 rounded">确定</div>
      </div>
    </div>
  </div>
);
}