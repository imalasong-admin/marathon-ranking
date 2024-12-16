// components/desktop/users/[id]/DesktopEditProfile.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { states, getCitiesByState } from '/lib/us-cities-data';
import { useSession, signOut } from 'next-auth/react';

export default function DesktopEditProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();

  // 添加路由保护
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (!id) return;  // 等待ID加载

    if (session.user.id !== id) {
      router.push(`/users/${id}`);
      return;
    }

    fetchUserData();
  }, [session, status, id]);

  // 状态定义
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [chineseName, setChineseName] = useState('');

  // 添加修改密码相关状态
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 表单数据
  const [bio, setBio] = useState('');
  const [stravaUrl, setStravaUrl] = useState('');
  const [locationData, setLocationData] = useState({
    state: '',
    city: ''
  });
  const [availableCities, setAvailableCities] = useState([]);

  // 权限验证
  useEffect(() => {
    if (!session || session.user.id !== id) {
      router.push(`/users/${id}`);
      return;
    }

    fetchUserData();
  }, [session, id]);

  // 获取用户数据
  const fetchUserData = async () => {
    try {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();

      if (data.success) {
        setUserData(data.data);
        setBio(data.data.user.bio || '');
        setStravaUrl(data.data.user.stravaUrl || '');
        setChineseName(data.data.user.chineseName || ''); 
        setLocationData({
          state: data.data.user.state || '',
          city: data.data.user.city || ''
        });
        if (data.data.user.state) {
          setAvailableCities(getCitiesByState(data.data.user.state));
        }
      }
    } catch (err) {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理州市选择变化
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setAvailableCities(getCitiesByState(value));
      setLocationData(prev => ({
        ...prev,
        state: value,
        city: ''
      }));
    } else {
      setLocationData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 添加修改密码处理函数
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordLoading(true);

    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        alert('密码修改成功！请重新登录。');
        signOut({ callbackUrl: '/login' });
      } else {
        setPasswordError(data.message || '修改失败，请重试');
      }
    } catch (error) {
      setPasswordError('修改失败，请重试');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 保存处理
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/users/${id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          stravaUrl,
          state: locationData.state,
          city: locationData.city,
          chineseName
        })
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/users/${id}`);
      } else {
        setError(data.message || '保存失败');
      }
    } catch (err) {
      setError('保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">加载中...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h1 className="text-2xl font-bold mb-6">编辑个人信息</h1>


            {/* 添加中文名输入框 */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    中文名 [选填]
  </label>
  <input
    type="text"
    value={chineseName}
    onChange={(e) => setChineseName(e.target.value)}
    className="w-full rounded-md border-gray-300"
    placeholder="请输入您的中文名..."
  />
</div>
        {/* 简介编辑 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            个人简介
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300"
            placeholder="写点什么来介绍自己..."
            maxLength={500}
          />
        </div>

        {/* 州选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            所在州
          </label>
          <select
            name="state"
            value={locationData.state}
            onChange={handleLocationChange}
            className="w-full rounded-md border-gray-300"
          >
            <option value="">请选择州</option>
            {states.map(state => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        {/* 城市选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            所在城市
          </label>
          <select
            name="city"
            value={locationData.city}
            onChange={handleLocationChange}
            className="w-full rounded-md border-gray-300"
            disabled={!locationData.state}
          >
            <option value="">请选择城市</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Strava链接编辑 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Strava链接
          </label>
          <input
            type="text"
            value={stravaUrl}
            onChange={(e) => setStravaUrl(e.target.value)}
            className="w-full rounded-md border-gray-300"
            placeholder="请输入您的Strava主页链接..."
          />
        </div>

        {/* 按钮组 */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>

      {/* 添加修改密码部分 */}
      <div className="mt-8 border-t pt-6">
        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="flex items-center text-gray-700 hover:text-gray-900"
        >
          <span className="font-medium">修改密码</span>
          <span className="ml-2">{showPasswordForm ? '▼' : '▶'}</span>
        </button>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                新密码
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                确认新密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            {passwordError && (
              <div className="text-red-600 text-sm">{passwordError}</div>
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {passwordLoading ? '修改中...' : '修改密码'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
