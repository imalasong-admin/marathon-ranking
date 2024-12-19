// lib/statsService.js
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