// components/Navbar.js
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
// import VerificationAlert from '../VerificationAlert'; 
import { Settings } from 'lucide-react';

export default function Navbar() {
 const { data: session } = useSession();

 return (
   <>
   <nav className="bg-white shadow">
     <div className="max-w-6xl mx-auto px-4">
       <div className="flex justify-between h-16">
         <div className="flex">
           <div className="flex-shrink-0 flex items-center">
             <Link href="/" className="relative">
               <Image
                 src="/images/logo.png"
                 alt="iMaLaSong.com Logo"
                 width={162}
                 height={30}
                 priority
                 className="h-auto"
               />
             </Link>
           </div>
           <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
           <Link
    href="/rankings"
    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
  >
    <Image
      src="/images/logo-M.png"
      alt="马拉松成绩榜"
      width={108}
      height={30}
      priority
    />
  </Link>
  <Link
    href="/age-adjusted-rankings"
    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
  >
    <Image
      src="/images/logo-P.png"
      alt="马拉松跑力榜"
      width={108}
      height={30}
      priority
    />
  </Link>
  <Link
    href="/ultra-rankings"
    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
  >
    <Image
      src="/images/logo-U.png" 
      alt="超马越野榜"
      width={93

      }
      height={32}
      priority
    />
  </Link>
             {session?.user?.isAdmin && (
               <Link
                 href="/admin"
                 className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
               >
                 <Settings className="w-4 h-4 mr-1" />
                 后台管理
               </Link>
             )}
           </div>
         </div>
         <div className="flex items-center">
 {session ? (
   <div className="flex items-center space-x-4">
     <Link
       href={`/users/${session.user.id}`}
       className="text-gray-700 hover:text-blue-600 hover:underline"
     >
      {session.user.name}  
     </Link>
     <button
       onClick={() => signOut()}
       className="text-red-600 hover:text-red-700"
     >
       退出
     </button>
   </div>
 ) : (
   <div className="flex items-center space-x-4">
     <Link
       href="/login"
       className="text-gray-700 hover:text-gray-900"
     >
       登录
     </Link>
     <Link 
       href="/register"
       className="text-gray-700 hover:text-gray-900"
     >
       注册
     </Link>
   </div>
 )}
</div>
       </div>
     </div>
   </nav>
 
 </>
 );
}