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