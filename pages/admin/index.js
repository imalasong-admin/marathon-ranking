import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [lockReason, setLockReason] = useState('');

  // 权限检查和数据加载
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user?.isAdmin) {
      router.push('/');
      return;
    }

    fetchUsers();
  }, [status, session]);

  // 获取所有用户
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || '获取用户列表失败');
      }
    } catch (err) {
      setError('加载用户数据失败');
      console.error('获取用户列表错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 处理管理员权限切换
  const handleAdminToggle = async (userId, newAdminStatus) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/set-admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isAdmin: newAdminStatus
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, isAdmin: newAdminStatus }
            : user
        ));
      } else {
        setError(data.message || '操作失败');
      }
    } catch (err) {
      setError('操作失败，请重试');
      console.error('设置管理员状态错误:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // 处理锁定状态切换
  const handleLockToggle = async (user) => {
    if (!user.isLocked) {
      setSelectedUser(user);
      setLockReason('');
      setShowLockDialog(true);
    } else {
      await toggleUserLock(user._id, false);
    }
  };

  // 执行锁定/解锁
  const toggleUserLock = async (userId, isLocked, reason = '') => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/toggle-lock', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isLocked,
          lockReason: reason
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setUsers(users.map(user => 
          user._id === userId 
            ? { ...user, isLocked, lockReason: reason }
            : user
        ));
        setShowLockDialog(false);
      } else {
        setError(data.message || '操作失败');
      }
    } catch (err) {
      setError('操作失败，请重试');
      console.error('锁定/解锁用户错误:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // 确认锁定用户
  const handleConfirmLock = async () => {
    if (selectedUser) {
      await toggleUserLock(selectedUser._id, true, lockReason);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-red-50 text-red-500 p-4 rounded-md text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">用户管理</h1>
        
        {/* 用户列表 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用户名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  邮箱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注册时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  管理员状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  账号状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users?.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.isAdmin ? '是' : '否'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${user.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                      title={user.lockReason}>
                      {user.isLocked ? '已锁定' : '正常'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {session?.user?.name === 'admin' && !user.isLocked && (
                      <button
                        onClick={() => handleAdminToggle(user._id, !user.isAdmin)}
                        disabled={actionLoading}
                        className={`text-sm px-4 py-2 rounded-md
                          ${user.isAdmin 
                            ? 'bg-red-600 text-white hover:bg-red-700' 
                            : 'bg-blue-600 text-white hover:bg-blue-700'}
                          disabled:opacity-50`}
                      >
                        {user.isAdmin ? '取消管理员' : '设为管理员'}
                      </button>
                    )}
                    {!user.isAdmin && (
                      <button
                        onClick={() => handleLockToggle(user)}
                        disabled={actionLoading}
                        className={`text-sm px-4 py-2 rounded-md
                          ${user.isLocked 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-yellow-600 text-white hover:bg-yellow-700'}
                          disabled:opacity-50`}
                      >
                        {user.isLocked ? '解锁' : '锁定'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 锁定用户对话框 */}
      {showLockDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              锁定用户: {selectedUser?.name}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                锁定原因
              </label>
              <textarea
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows="3"
                placeholder="请输入锁定原因..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowLockDialog(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                取消
              </button>
              <button
                onClick={handleConfirmLock}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                确认锁定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}