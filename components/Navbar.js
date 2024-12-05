import { useDeviceDetection } from '../lib/deviceDetection';
import MobileNavbar from './mobile/MobileNavbar';
import DesktopNavbar from './desktop/DesktopNavbar';
import VerificationAlert from './VerificationAlert';
import { useSession } from 'next-auth/react';


export default function Navbar() {
  const isMobile = useDeviceDetection();
  const { data: session } = useSession();
  
  // 只有在需要显示警告时才渲染 VerificationAlert
  const showAlert = session && 
    !session.user.emailVerified && 
    new Date(session.user.createdAt) >= new Date('2024-11-07');
  
  return (
    <div className="w-full">
      {isMobile ? <MobileNavbar /> : <DesktopNavbar />}
      {showAlert && <VerificationAlert />}
    </div>
  );
}