// components/mobile/MobileLayout.js
import MobileNavbar from './MobileNavbar';

const MobileLayout = ({ children }) => {
  return (
    <div>
      <MobileNavbar />
      {children}
    </div>
  );
};