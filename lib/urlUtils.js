// 处理所有链接相关的工具函数
export const urlUtils = {
    // 格式化URL
    format: (url) => {
      if (!url || typeof url !== 'string') return '';
      const trimmedUrl = url.trim();
      if (!trimmedUrl) return '';

      // 如果没有协议前缀，添加 https://
      if (!trimmedUrl.match(/^https?:\/\//i)) {
        return `https://${trimmedUrl}`;
      }
      return trimmedUrl;
    },

    // 验证URL
    validate: (url) => {
      if (!url) return true; // 允许为空
      try {
        new URL(urlUtils.format(url));
        return true;
      } catch {
        return false;
      }
    },

    // 获取显示用的URL
    getDisplayUrl: (url) => {
      if (!url) return '';
      return urlUtils.format(url);
    }
  };
