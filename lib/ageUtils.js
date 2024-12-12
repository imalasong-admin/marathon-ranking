// lib/ageUtils.js
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