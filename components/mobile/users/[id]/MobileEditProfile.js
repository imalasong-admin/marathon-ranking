import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { states, getCitiesByState } from '/lib/us-cities-data';
import { useSession, signOut } from 'next-auth/react';

export default function MobileEditProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();

  // States and effects remain the same as desktop version
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [bio, setBio] = useState('');
  const [stravaUrl, setStravaUrl] = useState('');
  const [locationData, setLocationData] = useState({
    state: '',
    city: ''
  });
  const [availableCities, setAvailableCities] = useState([]);

  // All functionality remains identical, only UI is adjusted
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (!id) return;
    if (session.user.id !== id) {
      router.push(`/users/${id}`);
      return;
    }
    fetchUserData();
  }, [session, status, id]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();
      
      if (data.success) {
        setUserData(data.data);
        setBio(data.data.user.bio || '');
        setStravaUrl(data.data.user.stravaUrl || '');
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
          city: locationData.city
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

  if (loading) return <div className="text-center py-4">加载中...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h1 className="text-xl font-bold mb-4">编辑个人信息</h1>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            所在州
          </label>
          <select
            name="state"
            value={locationData.state}
            onChange={handleLocationChange}
            className="w-full rounded-md border-gray-300 h-10"
          >
            <option value="">请选择州</option>
            {states.map(state => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            所在城市
          </label>
          <select
            name="city"
            value={locationData.city}
            onChange={handleLocationChange}
            className="w-full rounded-md border-gray-300 h-10"
            disabled={!locationData.state}
          >
            <option value="">请选择城市</option>
            {availableCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Strava链接
          </label>
          <input
            type="url"
            value={stravaUrl}
            onChange={(e) => setStravaUrl(e.target.value)}
            className="w-full rounded-md border-gray-300 h-10"
            placeholder="请输入您的Strava主页链接..."
          />
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-24 py-2 text-sm text-gray-600 bg-gray-100 rounded-md"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="w-24 py-2 text-sm bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>

      <div className="mt-6 border-t pt-4">
        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="w-full flex justify-between items-center py-2 text-gray-700"
        >
          <span className="font-medium">修改密码</span>
          <span>{showPasswordForm ? '▼' : '▶'}</span>
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
                className="mt-1 w-full rounded-md border-gray-300 h-10"
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
                className="mt-1 w-full rounded-md border-gray-300 h-10"
              />
            </div>
            {passwordError && (
              <div className="text-red-600 text-sm">{passwordError}</div>
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md disabled:opacity-50"
            >
              {passwordLoading ? '修改中...' : '修改密码'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}