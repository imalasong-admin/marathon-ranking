// components/mobile/common/MobileTitle.js
import { mobileStyles } from './styles';  // 添加样式导入

export const MobileTitle = ({ children }) => {
    return (
      <h1 className={mobileStyles.title}>{children}</h1>
    );
  };

  <MobileTitle 
  title="2024马拉松完赛榜" 
  ></MobileTitle>