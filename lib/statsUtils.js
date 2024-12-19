// lib/statsUtils.js

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