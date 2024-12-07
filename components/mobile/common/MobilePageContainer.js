// components/mobile/common/MobilePageContainer.js
import { mobileStyles } from './styles';  // 添加样式导入

export const MobilePageContainer = ({ children, className = "" }) => {
    return (
      <div className={`${mobileStyles.page} ${className}`}>
        {children}
      </div>
    );
  };