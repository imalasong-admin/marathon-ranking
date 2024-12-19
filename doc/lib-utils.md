工具文件合集
- `/lib/ageFactors.js`
- `/lib/ageUtils.js`
- `/lib/auth.js`
- `/lib/bqStandards.js`
- `/lib/deviceDetection.js`
- `/lib/rateLimiter.js`
- `/lib/timeUtils.js`
- `/lib/urlUtils.js`
- `/lib/statsService.js`
- `/lib/statsUtils.js`
- `/lib/email.js`
- `/lib/Mongodb.js`
- `/lib/styles.js`
- `/lib/us-cities-data.js`

### // lib/ageFactors.js
export function getAgeFactor(age, gender) {
    const factors = {
      'M': {
        19: 1.00, 20: 1.00, 21: 1.00, 22: 1.00, 23: 1.00, 24: 1.00,
        25: 1.00, 26: 1.00, 27: 1.00, 28: 1.00, 29: 1.00, 30: 1.00,
        31: 1.00, 32: 1.00, 33: 1.00, 34: 1.00,
        35: 0.98, 36: 0.98, 37: 0.98, 38: 0.98, 39: 0.98,
        40: 0.94, 41: 0.94, 42: 0.94, 43: 0.94, 44: 0.94,
        45: 0.90, 46: 0.90, 47: 0.90, 48: 0.90, 49: 0.90,
        50: 0.89, 51: 0.88, 52: 0.87, 53: 0.86, 54: 0.85,
        55: 0.84, 56: 0.83, 57: 0.82, 58: 0.81, 59: 0.80,
        60: 0.78, 61: 0.77, 62: 0.76, 63: 0.75, 64: 0.74,
        65: 0.69, 66: 0.68, 67: 0.68, 68: 0.67, 69: 0.67,
        70: 0.64, 71: 0.63, 72: 0.62, 73: 0.61, 74: 0.60
      },
      'F': {
        19: 1.00, 20: 1.00, 21: 1.00, 22: 1.00, 23: 1.00, 24: 1.00,
        25: 1.00, 26: 1.00, 27: 1.00, 28: 1.00, 29: 1.00, 30: 1.00,
        31: 1.00, 32: 1.00, 33: 1.00, 34: 1.00,
        35: 0.97, 36: 0.97, 37: 0.97, 38: 0.97, 39: 0.97,
        40: 0.92, 41: 0.92, 42: 0.92, 43: 0.92, 44: 0.92,
        45: 0.87, 46: 0.87, 47: 0.87, 48: 0.87, 49: 0.87,
        50: 0.85, 51: 0.84, 52: 0.83, 53: 0.82, 54: 0.81,
        55: 0.78, 56: 0.77, 57: 0.76, 58: 0.75, 59: 0.74,
        60: 0.70, 61: 0.69, 62: 0.68, 63: 0.67, 64: 0.66,
        65: 0.61, 66: 0.60, 67: 0.59, 68: 0.59, 69: 0.58,
        70: 0.54, 71: 0.53, 72: 0.51, 73: 0.50, 74: 0.49
      }
    };
  
    if (age < 19) return factors[gender][19];
    if (age > 74) return factors[gender][74];
    
    return factors[gender][age];
  }
  
  export function calculateAdjustedSeconds(totalSeconds, gender, birthDate, raceDate) {
    if (!totalSeconds || !gender || !birthDate || !raceDate) {
      return null;
    }
    // 性别系数
    const genderFactor = gender === 'F' ? 0.9 : 1.0;
    
    // 计算比赛时的年龄
    const race = new Date(raceDate);
    const birth = new Date(birthDate);
    let age = race.getFullYear() - birth.getFullYear();
    const m = race.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && race.getDate() < birth.getDate())) {
      age--;
    }
    
    // 获取年龄系数
    const ageFactor = getAgeFactor(age, gender);
    
    return Math.round(totalSeconds * (genderFactor * ageFactor));
  }

  ### // lib/ageUtils.js
export const calculateAge = (birthDate, targetDate) => {
    if (!birthDate || !targetDate) return null;
    
    const birth = new Date(birthDate);
    const target = new Date(targetDate);
    
    let age = target.getFullYear() - birth.getFullYear();
    if (birth.getMonth() > target.getMonth() || 
       (birth.getMonth() === target.getMonth() && birth.getDate() > target.getDate())) {
      age--;
    }
    return age;
  };


### // lib/auth.js
export { authOptions } from '../pages/api/auth/[...nextauth]';

  ### // lib/bqStandards.js

const BQ_RACE_DATE = '2026-04-21';

const BQ_STANDARDS = {
 'M': {
   '18-34': 2 * 3600 + 55 * 60,    // 2:55:00
   '35-39': 3 * 3600,              // 3:00:00
   '40-44': 3 * 3600 + 5 * 60,     // 3:05:00
   '45-49': 3 * 3600 + 15 * 60,    // 3:15:00
   '50-54': 3 * 3600 + 20 * 60,    // 3:20:00
   '55-59': 3 * 3600 + 30 * 60,    // 3:30:00
   '60-64': 3 * 3600 + 50 * 60,    // 3:50:00
   '65-69': 4 * 3600 + 5 * 60,     // 4:05:00
   '70-74': 4 * 3600 + 20 * 60,    // 4:20:00
   '75-79': 4 * 3600 + 35 * 60,    // 4:35:00
   '80+': 4 * 3600 + 50 * 60       // 4:50:00
 },
 'F': {
   '18-34': 3 * 3600 + 25 * 60,    // 3:25:00
   '35-39': 3 * 3600 + 30 * 60,    // 3:30:00
   '40-44': 3 * 3600 + 35 * 60,    // 3:35:00
   '45-49': 3 * 3600 + 45 * 60,    // 3:45:00
   '50-54': 3 * 3600 + 50 * 60,    // 3:50:00
   '55-59': 4 * 3600,              // 4:00:00
   '60-64': 4 * 3600 + 20 * 60,    // 4:20:00
   '65-69': 4 * 3600 + 35 * 60,    // 4:35:00
   '70-74': 4 * 3600 + 50 * 60,    // 4:50:00
   '75-79': 5 * 3600 + 5 * 60,     // 5:05:00
   '80+': 5 * 3600 + 20 * 60       // 5:20:00
 }
};

export const getAgeGroup = (age) => {
 if (!age || age < 18) return null;
 if (age <= 34) return '18-34';
 if (age <= 39) return '35-39';
 if (age <= 44) return '40-44';
 if (age <= 49) return '45-49';
 if (age <= 54) return '50-54';
 if (age <= 59) return '55-59';
 if (age <= 64) return '60-64';
 if (age <= 69) return '65-69';
 if (age <= 74) return '70-74';
 if (age <= 79) return '75-79';
 return '80+';
};

export const getStandard = (gender, age) => {
 const ageGroup = getAgeGroup(age);
 return ageGroup ? BQ_STANDARDS[gender]?.[ageGroup] : null;
};

export const checkBQ = (totalSeconds, gender, age) => {
 const standard = getStandard(gender, age);
 return standard ? totalSeconds <= standard : false;
};

export const getBQDiff = (totalSeconds, gender, age) => {
 const standard = getStandard(gender, age);
 return standard ? standard - totalSeconds : null;
};

export const formatBQTimeDiff = (diffSeconds) => {
    if (diffSeconds === null || diffSeconds === undefined) return '-';
    
    const absSeconds = Math.abs(diffSeconds);
    const minutes = Math.floor(absSeconds / 60);
    const seconds = absSeconds % 60;
    
    const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`;
    return diffSeconds >= 0 ? `BQ-${timeStr}` : `慢${timeStr}`;
  };

export { BQ_RACE_DATE, BQ_STANDARDS };


### // lib/deviceDetection.js
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


  
### // lib/rateLimiter.js

  import { rateLimit } from 'express-rate-limit'  // 修改导入语句

// IP限制
export const ipLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: '请求过于频繁，请稍后再试' },
  legacyHeaders: false, // 禁用 `X-RateLimit-*` headers
  standardHeaders: 'draft-7' // 使用新的速率限制头
});

// 邮箱限制
export const emailLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body.email,
  message: { message: '该邮箱今日验证码次数已达上限' },
  legacyHeaders: false,
  standardHeaders: 'draft-7'
});

### // lib/timeUtils.js
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

### // lib/urlUtils.js
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


### // lib/statsService.js
import Stats from '../models/Stats';
import Record from '../models/Record';
import { calculateRegionStats } from './statsUtils';

export async function updateStatsForYear(year) {
  try {
    const records = await Record.find()
      .populate({
        path: 'userId',
        select: 'name gender birthDate state city'
      })
      .populate({
        path: 'raceId',
        populate: {
          path: 'seriesId',
          select: 'name raceType'
        }
      });

    const yearRecords = records.filter(record => {
      const raceDate = new Date(record.raceId?.date);
      return raceDate.getFullYear() === year;
    });

    const statsData = calculateRegionStats(yearRecords);
    if (!statsData) {
      console.error('统计数据计算失败');
      return false;
    }

    let stats = await Stats.findOne({ year });
    if (!stats) {
      stats = new Stats({ year });
    }

    stats.northAmerica = {
      region: 'NA',
      totalStats: statsData.totalStats,
      maleStats: statsData.maleStats,
      femaleStats: statsData.femaleStats
    };

    stats.stateStats = statsData.stateStats;
    stats.ultraStats = statsData.ultraStats;
    stats.lastUpdated = new Date();

    await stats.save();
    return true;

  } catch (error) {
    console.error('统计更新错误:', error);
    return false;
  }
}

export async function getStatsForYear(year = 2024) {
  try {
    const stats = await Stats.findOne({ year });
    if (!stats) {
      return null;
    }
    return stats;
  } catch (error) {
    console.error('获取统计数据错误:', error);
    return null;
  }
}

### // lib/statsUtils.js
const validateRecord = (record) => {
    return record?.userId?._id && 
           record?.totalSeconds && 
           record?.raceId?.date &&
           record?.userId?.gender &&
           record?.raceId?.seriesId?.raceType;
  };
  
  const initStatsData = () => ({
    runners: new Set(),
    races: 0,
    totalTime: 0,
    bqCount: 0,
    sub3Count: 0,
    sub330Count: 0
  });
  
  export const calculateRegionStats = (records) => {
    console.log('总记录数:', records.length);
    if (!Array.isArray(records)) {
      console.log('records不是数组');
      return null;
    }
  
    // 计算超马统计
    const ultraStats = records
      .filter(record => record?.raceId?.seriesId?.raceType === '超马')
      .reduce((stats, record) => {
        if (!validateRecord(record)) return stats;
        
        const gender = record.userId.gender;
        const runnerId = record.userId._id.toString();
        
        if (!stats.runners.has(runnerId)) {
          stats.runners.add(runnerId);
          if (gender === 'M') stats.maleRunners++;
          if (gender === 'F') stats.femaleRunners++;
        }
        
        stats.races++;
        if (gender === 'M') stats.maleRaces++;
        if (gender === 'F') stats.femaleRaces++;
        
        return stats;
      }, {
        runners: new Set(),
        races: 0,
        maleRunners: 0,
        femaleRunners: 0,
        maleRaces: 0,
        femaleRaces: 0
      });
  
    // 马拉松统计
    const marathonRecords = records.filter(record => 
      record?.raceId?.seriesId?.raceType === '全程马拉松'
    );
    
    console.log('马拉松记录数:', marathonRecords.length);
    console.log('有BQ标记的记录数:', marathonRecords.filter(r => r.isBQ).length);

    const stats = {
      total: initStatsData(),
      male: initStatsData(),
      female: initStatsData()
    };
  
    const stateStats = new Map();
    
    const genderMap = {
      'M': 'male',
      'F': 'female'
    };
  
    for (const record of marathonRecords) {
      if (!validateRecord(record)) continue;
      
      const gender = genderMap[record.userId.gender];
      const state = record.userId.state;
      const runnerId = record.userId._id.toString();
    
      const updateStats = (statsObj) => {
        if (!statsObj || !statsObj.runners) return;
        
        statsObj.runners.add(runnerId);
        statsObj.races++;
        statsObj.totalTime += record.totalSeconds;
        if (record.isBQ) statsObj.bqCount++;
        if (record.totalSeconds <= 10800) statsObj.sub3Count++;
        if (record.totalSeconds <= 12600) statsObj.sub330Count++;
      };
  
      updateStats(stats.total);
      if (gender && stats[gender]) {
        updateStats(stats[gender]);
      }
  
      if (state) {
        if (!stateStats.has(state)) {
          stateStats.set(state, {
            total: initStatsData(),
            male: initStatsData(),
            female: initStatsData()
          });
        }
        const stateData = stateStats.get(state);
        updateStats(stateData.total);
        if (gender && stateData[gender]) {
          updateStats(stateData[gender]);
        }
      }
    }
  
    const formatStats = (statsData) => {
      if (!statsData || !statsData.runners) {
        return {
          runners: 0,
          races: 0,
          avgFinishTime: 0,
          bqCount: 0,
          sub3Count: 0,
          sub330Count: 0
        };
      }
      
      return {
        runners: statsData.runners.size || 0,
        races: statsData.races || 0,
        avgFinishTime: statsData.races ? Math.round(statsData.totalTime / statsData.races) : 0,
        bqCount: statsData.bqCount || 0,
        sub3Count: statsData.sub3Count || 0,
        sub330Count: statsData.sub330Count || 0
      };
    };
  
    return {
      totalStats: formatStats(stats.total),
      maleStats: formatStats(stats.male),
      femaleStats: formatStats(stats.female),
      stateStats: Array.from(stateStats.entries()).map(([state, data]) => ({
        region: state,
        totalStats: formatStats(data.total),
        maleStats: formatStats(data.male),
        femaleStats: formatStats(data.female)
      })),
      ultraStats: {
        runners: ultraStats.runners.size,
        races: ultraStats.races,
        maleRunners: ultraStats.maleRunners,
        femaleRunners: ultraStats.femaleRunners,
        maleRaces: ultraStats.maleRaces,
        femaleRaces: ultraStats.femaleRaces
      }
    };
  };

###  // lib/styles.js
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

###  // lib/mongodb.js

import mongoose from 'mongoose';
import '../models/Race';  // 添加这行
import '../models/Series';  // 添加这行，因为Race依赖Series模型
import '../models/User';  // 添加这行，因为Race引用了User

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// 打印出连接字符串（隐藏密码）
console.log('Connecting to MongoDB:', MONGODB_URI.replace(/:[^:]*@/, ':****@'));

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
    cached.conn = await cached.promise;
    
    console.log('Successfully connected to MongoDB');
    return cached.conn;
  } catch (e) {
    console.error('MongoDB connection error:', e);
    throw e;
  }
}

export default connectDB;
