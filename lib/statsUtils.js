// lib/statsUtils.js

// 数据验证函数
const validateRecord = (record) => {
    return record?.userId?._id && 
           record?.totalSeconds && 
           record?.raceId?.date &&
           record?.userId?.gender &&
           record?.raceId?.seriesId?.raceType;
  };
  
  // 初始化统计数据结构
  const initStatsData = () => ({
    runners: new Set(),
    races: 0,
    totalTime: 0,
    bqCount: 0,
    sub3Count: 0,
    sub330Count: 0
  });
  
  // 核心统计计算函数
  export const calculateRegionStats = (records) => {
    if (!Array.isArray(records)) {
      console.log('records不是数组');
      return null;
    }
  
    // 检查 seriesId 是否存在且为马拉松比赛
    const marathonRecords = records.filter(record => 
      record?.raceId?.seriesId?.raceType === '全程马拉松'
    );
  
    const stats = {
      total: initStatsData(),
      male: initStatsData(),
      female: initStatsData()
    };
  
    const stateStats = new Map();
    
    // 性别映射
    const genderMap = {
      'M': 'male',
      'F': 'female'
    };
  
    for (const record of marathonRecords) {
        // 首先打印记录信息
        console.log('处理记录:', {
          recordId: record._id,
          userId: record.userId._id,
          gender: record.userId.gender,
          isBQ: record.isBQ,
          totalSeconds: record.totalSeconds,
          raceType: record.raceId?.seriesId?.raceType
        });
      
        if (!validateRecord(record)) {
          console.log('记录验证失败，跳过');
          continue;
        }
      
        const gender = genderMap[record.userId.gender];
        const state = record.userId.state;
        const runnerId = record.userId._id.toString();
      
        const updateStats = (statsObj) => {
          if (!statsObj || !statsObj.runners) {
            console.error('统计对象无效:', statsObj);
            return;
          }
          
          // 在更新前打印BQ相关信息
          console.log('更新BQ统计前:', {
            isBQ: record.isBQ,
            currentBQCount: statsObj.bqCount
          });
          
          statsObj.runners.add(runnerId);
          statsObj.races++;
          statsObj.totalTime += record.totalSeconds;
          if (record.isBQ === true) {
            statsObj.bqCount++;
            console.log('BQ计数已增加');
          }
          if (record.totalSeconds <= 10800) statsObj.sub3Count++;
          if (record.totalSeconds <= 12600) statsObj.sub330Count++;
      
          // 在更新后打印统计信息
          console.log('更新后的统计:', {
            runners: statsObj.runners.size,
            races: statsObj.races,
            bqCount: statsObj.bqCount
          });
        };
      // 更新总体统计
      updateStats(stats.total);
  
      // 更新性别统计
      if (gender && stats[gender]) {
        updateStats(stats[gender]);
      }
  
      // 更新州统计
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
  
    // 格式化统计结果
    const formatStats = (statsData) => {
      // 如果完全没有数据，返回零值对象
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
  
    // 格式化返回结果
    return {
      totalStats: formatStats(stats.total),
      maleStats: formatStats(stats.male),
      femaleStats: formatStats(stats.female),
      stateStats: Array.from(stateStats.entries()).map(([state, data]) => ({
        region: state,
        totalStats: formatStats(data.total),
        maleStats: formatStats(data.male),
        femaleStats: formatStats(data.female)
      }))
    };
  };