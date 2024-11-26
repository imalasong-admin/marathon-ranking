import { useDeviceDetection } from '/lib/deviceDetection';
import DesktopEditProfile from '/components/desktop/users/[id]/DesktopEditProfile';
import MobileEditProfile from '/components/mobile/users/[id]/MobileEditProfile';

export default function EditProfile() {
  const isMobile = useDeviceDetection();
  return isMobile ? <MobileEditProfile /> : <DesktopEditProfile />;
}