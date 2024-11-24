// components/mobile/MobileNavMenu.js
import Link from 'next/link';

export default function MobileNavMenu({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50">
        <div className="py-6">
          <Link
            href="/rankings"
            className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            马拉松成绩榜
          </Link>
          
          <Link
            href="/age-adjusted-rankings"
            className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            马拉松跑力榜
          </Link>
          
          <Link
            href="/ultra-rankings"
            className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            超马越野榜
          </Link>

          <Link
            href="/users/submit"
            className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            提交成绩
          </Link>
        </div>
      </div>
    </>
  );
}