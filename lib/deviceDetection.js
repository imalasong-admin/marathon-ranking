// lib/deviceDetection.js
import { useState, useEffect } from 'react'; 

// 检测是否为移动设备
export const isMobileDevice = () => {
    if (typeof window === 'undefined') return false; // 服务器端渲染时
    return window.innerWidth <= 768;
  };
  
  // 监听设备变化的钩子函数
  export const useDeviceDetection = () => {
    const [isMobile, setIsMobile] = useState(false);
  
    useEffect(() => {
      const checkDevice = () => {
        setIsMobile(isMobileDevice());
      };
  
      // 初始检测
      checkDevice();
  
      // 监听窗口大小变化
      window.addEventListener('resize', checkDevice);
      
      // 清理监听器
      return () => window.removeEventListener('resize', checkDevice);
    }, []);
  
    return isMobile;
  };