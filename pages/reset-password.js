// pages/reset-password.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ResetPassword() {
 const router = useRouter();
 const { email, code } = router.query;

 const [newPassword, setNewPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);

 // 如果没有邮箱或验证码参数，重定向到登录页
 useEffect(() => {
   if (router.isReady && (!email || !code)) {
     router.replace('/login');
   }
 }, [router.isReady, email, code]);

 const handleSubmit = async (e) => {
   e.preventDefault();
   setError('');

   // 验证密码
   if (newPassword.length < 6) {
     setError('密码长度至少为6位');
     return;
   }

   if (newPassword !== confirmPassword) {
     setError('两次输入的密码不一致');
     return;
   }

   setLoading(true);

   try {
     const res = await fetch('/api/auth/reset-password', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ 
         email,
         code,
         newPassword 
       })
     });

     const data = await res.json();

     if (data.success) {
       alert('密码重置成功！请登录。');
       router.replace('/login');
     } else {
       setError(data.message || '密码重置失败，请重试');
     }
   } catch (error) {
     setError('操作失败，请重试');
   } finally {
     setLoading(false);
   }
 };

 // 如果缺少必要参数，不渲染页面
 if (!email || !code) {
   return null;
 }

 return (
   <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
     <div className="max-w-md w-full space-y-8">
       <div>
         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
           设置新密码
         </h2>
       </div>

       {error && (
         <div className="rounded-md bg-red-50 p-4">
           <div className="text-sm text-red-700">
             {error}
           </div>
         </div>
       )}

       <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
         <div>
           <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
             新密码
           </label>
           <input
             id="new-password"
             type="password"
             value={newPassword}
             onChange={(e) => setNewPassword(e.target.value)}
             required
             minLength={6}
             className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
             placeholder="请输入不少于6位的新密码"
           />
         </div>

         <div>
           <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
             确认新密码
           </label>
           <input
             id="confirm-password"
             type="password"
             value={confirmPassword}
             onChange={(e) => setConfirmPassword(e.target.value)}
             required
             minLength={6}
             className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
             placeholder="请再次输入新密码"
           />
         </div>

         <button
           type="submit"
           disabled={loading}
           className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
             loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
           } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
         >
           {loading ? '提交中...' : '设置新密码'}
         </button>
       </form>
     </div>
   </div>
 );
}