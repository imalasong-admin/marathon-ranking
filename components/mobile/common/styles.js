// components/mobile/common/styles.js
export const mobileStyles = {
    page: "min-h-screen bg-gray-50 p-2 sm:p-4",
    title: "text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-4",
    card: "bg-white rounded-lg shadow-sm p-2 mb-2",
    cardTitle: "text-sm sm:text-base font-medium text-gray-800",
    cardContent: "text-sm sm:text-base leading-tight",
    icon: {
      base: "shrink-0",
      small: "w-4 h-4",
      medium: "w-5 h-5",
      blue: "text-blue-600",
      pink: "text-pink-600",
      yellow: "text-yellow-600"
    },
    collapsible: {
      header: "flex items-center justify-between p-2 rounded-t-lg",
      button: "w-6 h-6 flex items-center justify-center text-gray-600 rounded-full",
      content: "transition-all duration-300 ease-in-out overflow-hidden"
    },

     // 导航相关样式
     nav: {
        root: "bg-white shadow",
        container: "px-3",
        headerWrapper: "flex justify-between items-center h-10",
        logoWrapper: "w-60 min-w-[10rem] flex items-center", // 给Logo固定宽度
        logo: "text-medium font-bold text-gray-900 truncate", // 可能过长时截断
        titleWrapper: "flex-1 flex justify-end items-center gap-2 ml-2", // flex-1自动占用剩余空间
        pageTitle: "text-sm font-medium text-gray-900 truncate", // 可能过长时截断
        menuButton: "p-1 flex-shrink-0", // 防止按钮被压缩
        menuIcon: "w-5 h-5",
    // 菜单样式
    menu: {
      overlay: "fixed inset-0 bg-black bg-opacity-50 z-40",
      container: "fixed inset-y-0 right-0 w-64 bg-white shadow-lg z-50",
      content: "py-6",
      item: "block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
    }
  },
  
};