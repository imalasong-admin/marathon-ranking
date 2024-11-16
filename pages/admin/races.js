// pages/admin/races.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function RacesManagement() {
 const { data: session, status } = useSession();
 const router = useRouter();

 // 状态管理
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [series, setSeries] = useState([]); // 标准赛事列表
 const [showAddDialog, setShowAddDialog] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [races, setRaces] = useState([]);
 const [editId, setEditId] = useState(null);

 // 表单状态
 const [form, setForm] = useState({
   seriesId: '',  // 选择的标准赛事ID
   date: ''       // 比赛日期
 });

 // 权限检查和加载标准赛事数据
 useEffect(() => {
    const loadData = async () => {
      if (status === 'loading') return;
      if (!session?.user?.isAdmin) {
        router.push('/');
        return;
      }
      setLoading(true);
      try {
        await fetchSeries();
        await fetchRaces();
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [status, session]);

 // 获取标准赛事列表
 const fetchSeries = async () => {
   try {
     const res = await fetch('/api/series');
     const data = await res.json();
     if (data.success) {
       setSeries(data.series);
     }
   } catch (err) {
     setError('加载标准赛事失败');
   } finally {
     setLoading(false);
   }
 };

// 添加获取场次列表的函数
const fetchRaces = async () => {
    try {
      const res = await fetch('/api/races');
      const data = await res.json();
      if (data.success) {
        setRaces(data.races);
      } else {
        setError(data.message || '加载场次列表失败');
      }
    } catch (err) {
      console.error('加载场次列表错误:', err);
      setError('加载场次列表失败');
    }
};

 // 处理提交
 const handleSubmit = async () => {
    if (!form.date) {
      setError('请选择比赛时间');
      return;
    }
  
    setSubmitting(true);
    try {
      const url = editId ? `/api/races/${editId}` : '/api/races';
      const method = editId ? 'PUT' : 'POST';
  
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
  
      const data = await res.json();
      if (data.success) {
        await fetchRaces();
        handleCloseDialog();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('保存失败');
    } finally {
      setSubmitting(false);
    }
  };

 // 关闭对话框并重置表单
 const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditId(null);  // 清除编辑ID
    setForm({
      seriesId: '',
      date: ''
    });
    setError('');
  };

  const handleToggleLock = async (race) => {
    try {
      const res = await fetch(`/api/races/${race._id}/toggle-lock`, {
        method: 'PATCH'
      });
  
      const data = await res.json();
      if (data.success) {
        await fetchRaces();  // 刷新列表
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('操作失败');
    }
  };


 const handleEdit = (race) => {
    setEditId(race._id);  // 保存正在编辑的场次ID
    setForm({
      seriesId: race.seriesId._id,
      date: new Date(race.date).toISOString().split('T')[0]
    });
    setShowAddDialog(true);
  };

 // 错误提示自动消失
 useEffect(() => {
   if (error) {
     const timer = setTimeout(() => {
       setError('');
     }, 3000);
     return () => clearTimeout(timer);
   }
 }, [error]);

 if (loading) return <div>加载中...</div>;

 return (
   <div className="max-w-6xl mx-auto py-8 px-4">
     {error && (
       <div className="mb-4 bg-red-50 text-red-500 p-4 rounded-md">{error}</div>
     )}

<div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">比赛场次管理</h1>
        <button
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          添加场次
        </button>
      </div>

      {/* 添加场次列表 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">赛事名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">比赛时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {races.map((race) => (
              <tr key={race._id}>
                <td className="px-6 py-4">{race.seriesId?.name || '-'}</td>
                <td className="px-6 py-4">{race.seriesId?.raceType || '-'}</td>
                <td className="px-6 py-4">
  {race.date ? new Date(race.date).toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC'  // 使用UTC时区显示
  }) : '-'}
</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    race.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {race.isLocked ? '已锁定' : '正常'}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => handleEdit(race)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    编辑
                  </button>
                  <button
  onClick={() => handleToggleLock(race)}
  className={`${race.isLocked ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
>
  {race.isLocked ? '解锁' : '锁定'}
</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

     {showAddDialog && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
         <div className="bg-white rounded-lg max-w-md w-full p-6">
           <h3 className="text-lg font-semibold mb-4">添加场次</h3>
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium mb-2">选择赛事</label>
               <select
                 value={form.seriesId}
                 onChange={(e) => setForm({...form, seriesId: e.target.value})}
                 disabled={submitting}
                 className="w-full px-3 py-2 border rounded-md"
               >
                 <option value="">请选择赛事</option>
                 {series
                   .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
                   .map((s) => (
                   <option key={s._id} value={s._id}>
                     {s.name} ({s.raceType})
                   </option>
                 ))}
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium mb-2">比赛时间</label>
               <input
                 type="date"
                 value={form.date}
                 onChange={(e) => setForm({...form, date: e.target.value})}
                 disabled={submitting}
                 min="2024-01-01"
                 max="2026-12-31"
                 className="w-full px-3 py-2 border rounded-md"
               />
             </div>
           </div>
           <div className="flex justify-end space-x-2 mt-6">
             <button
               onClick={handleCloseDialog}
               disabled={submitting}
               className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
             >
               取消
             </button>
             <button
               onClick={handleSubmit}
               disabled={submitting}
               className={`px-4 py-2 text-sm bg-blue-600 text-white rounded-md 
                 ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
             >
               {submitting ? '保存中...' : '确认'}
             </button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
}