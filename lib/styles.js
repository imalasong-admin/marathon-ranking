// lib/styles.js
export const mobileStyles = {
    // 页面级样式
    page: "min-h-screen bg-gray-50 p-2 sm:p-4",
    title: "text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-4",
    
    // 卡片样式
    card: "bg-white rounded-lg shadow-sm p-2 mb-2",
    cardTitle: "text-sm sm:text-base font-medium text-gray-800",
    cardContent: "text-sm sm:text-base leading-tight",
    
    // 图标样式
    icon: {
      base: "shrink-0",
      small: "w-4 h-4",  // 16px
      medium: "w-5 h-5", // 20px
      blue: "text-blue-600",
      pink: "text-pink-600",
      yellow: "text-yellow-600"
    },
    
    // 折叠组件样式
    collapsible: {
      header: "flex items-center justify-between p-2 rounded-t-lg",
      button: "w-6 h-6 flex items-center justify-center text-gray-600 rounded-full",
      content: "transition-all duration-300 ease-in-out overflow-hidden"
    }
  };