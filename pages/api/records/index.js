// pages/api/records/index.js
import connectDB from '../../../lib/mongodb';
import Record from '../../../models/Record';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只支持 GET 请求' });
  }

  try {
    await connectDB();
    
    const { top } = req.query;

    if (top === 'true') {
      const baseQuery = {
        'raceId.date': {
          $gte: new Date('2024-01-01'),
          $lt: new Date('2025-01-01')
        },
        'raceId.seriesId.raceType': '全程马拉松'
      };

   

      try {
        // 并行获取所有 TOP 10 数据
        const [maleTopRecords, femaleTopRecords, adjustedTopRecords, bqTopRecords] = 
        await Promise.all([
          // 男子前10
          Record.find()
            .populate({
              path: 'userId',
              select: 'name gender birthDate state city chineseName'
            })
            .populate({
              path: 'raceId',
              populate: {
                path: 'seriesId',
                select: 'name raceType'
              }
            })
            .sort({ totalSeconds: 1 })
            .limit(10),
      
          // 女子前10
          Record.find()
            .populate({
              path: 'userId',
              select: 'name gender birthDate state city chineseName'
            })
            .populate({
              path: 'raceId',
              populate: {
                path: 'seriesId',
                select: 'name raceType'
              }
            })
            .sort({ totalSeconds: 1 })
            .limit(10),
      
          // 调整后前10
          Record.find()
            .populate({
              path: 'userId',
              select: 'name gender birthDate state city chineseName'
            })
            .populate({
              path: 'raceId',
              populate: {
                path: 'seriesId',
                select: 'name raceType'
              }
            })
            .sort({ adjustedSeconds: 1 })
            .limit(10),
      
          // BQ前10
          Record.find()
            .populate({
              path: 'userId',
              select: 'name gender birthDate state city chineseName'
            })
            .populate({
              path: 'raceId',
              populate: {
                path: 'seriesId',
                select: 'name raceType'
              }
            })
            .sort({ bqDiff: -1 })
            .limit(10)
        ]);

        const formatRecords = (records) => records.map(record => {
          const recordObj = record.toObject();
          return {
            ...recordObj,
            userName: recordObj.userId?.name,
            gender: recordObj.userId?.gender,
            state: recordObj.userId?.state,
            city: recordObj.userId?.city,
            chineseName: recordObj.userId?.chineseName,
            age: recordObj.raceAge,
            date: recordObj.raceId?.date,
            raceName: recordObj.raceId?.seriesId?.name,
            bostonAge: recordObj.bqAge,
            bqDiff: recordObj.bqDiff,
            isBQ: recordObj.isBQ,
            adjustedSeconds: recordObj.adjustedSeconds
          };
        });


        return res.status(200).json({
          success: true,
          data: {
            topRecords: {
              male: formatRecords(maleTopRecords),
              female: formatRecords(femaleTopRecords)
            },
            topAdjustedRecords: formatRecords(adjustedTopRecords),
            bqTopRecords: formatRecords(bqTopRecords)
          }
        });

        

      } catch (error) {
        console.error('Top 10 data fetch error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch top 10 data'
        });
      }
    }

    // 原有的获取所有记录的逻辑保持不变
    const records = await Record.find()
      .populate({
        path: 'userId',
        select: 'name gender birthDate state city chineseName'
      })
      .populate({
        path: 'raceId',
        populate: {
          path: 'seriesId',
          select: 'name raceType'
        }
      })
      .populate({
        path: 'verifiedBy.userId',
        select: 'name'
      })
      .populate({
        path: 'reportedBy.userId',
        select: 'name'
      })
      .sort({ createdAt: -1 });

    const recordsWithDetails = records.map(record => {
      const recordObj = record.toObject();
      return {
        ...recordObj,
        userName: recordObj.userId?.name,
        gender: recordObj.userId?.gender,
        state: recordObj.userId?.state,
        city: recordObj.userId?.city,
        chineseName: recordObj.userId?.chineseName,
        age: recordObj.raceAge,
        date: recordObj.raceId?.date,
        raceName: recordObj.raceId?.seriesId?.name,
        bostonAge: recordObj.bqAge,
        bqStandard: recordObj.bqStandard,  
        bqDiff: recordObj.bqDiff,
        isBQ: recordObj.isBQ,
        adjustedSeconds: recordObj.adjustedSeconds
      };
    });

    return res.status(200).json({
      success: true,
      records: recordsWithDetails
    });

  } catch (error) {
    console.error('获取记录列表错误:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || '获取记录列表失败' 
    });
  }
}