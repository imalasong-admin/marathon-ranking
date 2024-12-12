// lib/bqStandards.js

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