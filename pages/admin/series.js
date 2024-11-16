// pages/admin/series.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function SeriesManagement() {
 const { data: session, status } = useSession();
 const router = useRouter();

 // 状态管理
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [series, setSeries] = useState([]);
 const [showAddDialog, setShowAddDialog] = useState(false);
 const [editingSeries, setEditingSeries] = useState(null);

 // 表单状态
 const [form, setForm] = useState({
   name: '',
   raceType: '全程马拉松',
   location: '',
   website: ''
 });

 // 权限检查和数据加载
 useEffect(() => {
   if (status === 'loading') return;
   if (!session?.user?.isAdmin) {
     router.push('/');
     return;
   }
   fetchSeries();
 }, [status, session]);

 // 获取赛事列表
 const fetchSeries = async () => {
   try {
     const res = await fetch('/api/series');
     const data = await res.json();
     if (data.success) {
       setSeries(data.series);
     }
   } catch (err) {
     setError('加载失败');
   } finally {
     setLoading(false);
   }
 };

 // 添加/编辑赛事
 const handleSubmit = async () => {
   if (!form.name || !form.raceType) {
     setError('名称和类型不能为空');
     return;
   }

   try {
     const url = editingSeries ? `/api/series/${editingSeries._id}` : '/api/series';
     const method = editingSeries ? 'PUT' : 'POST';

     const res = await fetch(url, {
       method,
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(form)
     });

     const data = await res.json();
     if (data.success) {
       await fetchSeries();
       handleCloseDialog();
     } else {
       setError(data.message);
     }
   } catch (err) {
     setError('保存失败');
   }
 };

 const handleEdit = (series) => {
   setEditingSeries(series);
   setForm({
     name: series.name,
     raceType: series.raceType,
     location: series.location || '',
     website: series.website || ''
   });
   setShowAddDialog(true);
 };

 const handleCloseDialog = () => {
   setShowAddDialog(false);
   setEditingSeries(null);
   setForm({
     name: '',
     raceType: '全程马拉松',
     location: '',
     website: ''
   });
 };

 if (loading) return <div>加载中...</div>;

 return (
   <div className="max-w-6xl mx-auto py-8 px-4">
     {error && (
       <div className="mb-4 bg-red-50 text-red-500 p-4 rounded-md">{error}</div>
     )}

     <div className="bg-white rounded-lg shadow-sm p-6">
       <div className="flex justify-between items-center mb-6">
         <h1 className="text-2xl font-bold">赛事管理</h1>
         <button
           onClick={() => setShowAddDialog(true)}
           className="bg-blue-600 text-white px-4 py-2 rounded-md"
         >
           添加赛事
         </button>
       </div>

       <div className="overflow-x-auto">
         <table className="min-w-full divide-y divide-gray-200">
           <thead className="bg-gray-50">
             <tr>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">赛事名称</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">地点</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
             </tr>
           </thead>
           <tbody className="bg-white divide-y divide-gray-200">
             {series.map((s) => (
               <tr key={s._id}>
                 <td className="px-6 py-4">{s.name}</td>
                 <td className="px-6 py-4">{s.raceType}</td>
                 <td className="px-6 py-4">{s.location || '-'}</td>
                 <td className="px-6 py-4 space-x-2">
                   <button
                     onClick={() => handleEdit(s)}
                     className="text-blue-600 hover:text-blue-900"
                   >
                     编辑
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
           <h3 className="text-lg font-semibold mb-4">
             {editingSeries ? '编辑赛事' : '添加赛事'}
           </h3>
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium mb-2">赛事名称</label>
               <input
                 type="text"
                 value={form.name}
                 onChange={(e) => setForm({...form, name: e.target.value})}
                 className="w-full px-3 py-2 border rounded-md"
               />
             </div>
             <div>
               <label className="block text-sm font-medium mb-2">类型</label>
               <select
                 value={form.raceType}
                 onChange={(e) => setForm({...form, raceType: e.target.value})}
                 className="w-full px-3 py-2 border rounded-md"
               >
                 <option value="全程马拉松">全程马拉松</option>
                 <option value="超马">超马</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium mb-2">地点</label>
               <input
                 type="text"
                 value={form.location}
                 onChange={(e) => setForm({...form, location: e.target.value})}
                 className="w-full px-3 py-2 border rounded-md"
               />
             </div>
             <div>
               <label className="block text-sm font-medium mb-2">官网</label>
               <input
                 type="text"
                 value={form.website}
                 onChange={(e) => setForm({...form, website: e.target.value})}
                 className="w-full px-3 py-2 border rounded-md"
               />
             </div>
           </div>
           <div className="flex justify-end space-x-2 mt-6">
             <button
               onClick={handleCloseDialog}
               className="px-4 py-2 text-sm text-gray-600"
             >
               取消
             </button>
             <button
               onClick={handleSubmit}
               className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md"
             >
               确认
             </button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
}