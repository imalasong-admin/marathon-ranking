import { useDeviceDetection } from '../lib/deviceDetection';
import MobileNavbar from './mobile/MobileNavbar';
import DesktopNavbar from './desktop/DesktopNavbar';
import VerificationAlert from './VerificationAlert';

export default function Navbar() {
  const isMobile = useDeviceDetection();
  
  return (
    <>
      {isMobile ? <MobileNavbar /> : <DesktopNavbar />}
      <VerificationAlert />
    </>
  );
}