// lib/timeUtils.js
export const formatTime = (time) => {
    if (!time) return '-';
    return `${time.hours}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  };
  
  export const getTimeFromSeconds = (seconds) => {
    if (!seconds || typeof seconds !== 'number') return null;
    return {
      hours: Math.floor(seconds / 3600),
      minutes: Math.floor((seconds % 3600) / 60),
      seconds: seconds % 60
    };
  };