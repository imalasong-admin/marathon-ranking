// lib/bqUtils.js

const BQ_TIMES = {
    M: { // 男子标准
      '18-34': 10500,  // 2:55:00 in seconds
      '35-39': 10800,  // 3:00:00
      '40-44': 11100,  // 3:05:00
      '45-49': 11700,  // 3:15:00
      '50-54': 12000,  // 3:20:00
      '55-59': 12600,  // 3:30:00
      '60-64': 13800,  // 3:50:00
      '65-69': 14700,  // 4:05:00
      '70-74': 15600,  // 4:20:00
      '75-79': 16500,  // 4:35:00
      '80+': 17400    // 4:50:00
    },
    F: { // 女子标准
      '18-34': 12300,  // 3:25:00
      '35-39': 12600,  // 3:30:00
      '40-44': 12900,  // 3:35:00
      '45-49': 13500,  // 3:45:00
      '50-54': 13800,  // 3:50:00
      '55-59': 14400,  // 4:00:00
      '60-64': 15600,  // 4:20:00
      '65-69': 16500,  // 4:35:00
      '70-74': 17400,  // 4:50:00
      '75-79': 18300,  // 5:05:00
      '80+': 19200    // 5:20:00
    }
  };
  
  // 波马比赛日期
  const BOSTON_RACE_DATE = new Date('2026-04-21');
  
  // 计算在波马比赛日的年龄
  function getBostonAge(birthDate) {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    let age = BOSTON_RACE_DATE.getFullYear() - birth.getFullYear();
    
    // 检查是否已过生日
    if (
      birth.getMonth() > BOSTON_RACE_DATE.getMonth() || 
      (birth.getMonth() === BOSTON_RACE_DATE.getMonth() && birth.getDate() > BOSTON_RACE_DATE.getDate())
    ) {
      age--;
    }
    
    return age;
  }
  
  export function checkBQ(totalSeconds, gender, birthDate) {
    if (!totalSeconds || !gender || !birthDate) return false;
    
    // 计算波马比赛日的年龄
    const age = getBostonAge(birthDate);
    if (!age) return false;
    
    // 确定年龄组
    let ageGroup;
    if (age <= 34) ageGroup = '18-34';
    else if (age <= 39) ageGroup = '35-39';
    else if (age <= 44) ageGroup = '40-44';
    else if (age <= 49) ageGroup = '45-49';
    else if (age <= 54) ageGroup = '50-54';
    else if (age <= 59) ageGroup = '55-59';
    else if (age <= 64) ageGroup = '60-64';
    else if (age <= 69) ageGroup = '65-69';
    else if (age <= 74) ageGroup = '70-74';
    else if (age <= 79) ageGroup = '75-79';
    else ageGroup = '80+';
  
    const standardSeconds = BQ_TIMES[gender][ageGroup];
    return totalSeconds <= standardSeconds;
  }
  
  // 导出获取波马年龄的函数，方便在其他地方使用
  export { getBostonAge };