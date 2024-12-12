// lib/statsService.js
import Stats from '../models/Stats';
import Record from '../models/Record';
import { calculateRegionStats } from './statsUtils';

export async function updateStatsForYear(year) {
  try {
    // 获取指定年份的全程马拉松记录
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

    // 过滤出目标年份的马拉松记录
    const marathonRecords = records.filter(record => {
      const raceDate = new Date(record.raceId?.date);
      return raceDate.getFullYear() === year && 
             record.raceId?.seriesId?.raceType === '全程马拉松';
    });

    // 使用 statsUtils 计算统计数据
    const statsData = calculateRegionStats(marathonRecords);
    if (!statsData) {
      console.error('统计数据计算失败');
      return false;
    }

    // 更新或创建统计记录
    let stats = await Stats.findOne({ year });
    if (!stats) {
      stats = new Stats({ year });
    }

    // 更新北美统计数据
    stats.northAmerica = {
      region: 'NA',
      totalStats: statsData.totalStats,
      maleStats: statsData.maleStats,
      femaleStats: statsData.femaleStats
    };

    // 更新州统计数据
    stats.stateStats = statsData.stateStats.map(state => ({
      region: state.region,
      totalStats: state.totalStats,
      maleStats: state.maleStats,
      femaleStats: state.femaleStats
    }));

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