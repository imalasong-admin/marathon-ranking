// scripts/migrate-race-types.js
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Race from '../models/Race.js';
import Record from '../models/Record.js';

// 设置 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 .env.local 文件
dotenv.config({ path: join(__dirname, '..', '.env.local') });

// 确保有 MONGODB_URI
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env.local file');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;

async function migrateRaceTypes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. 获取所有非全程马拉松的比赛
    const ultraRaces = await Race.find({
      raceType: { $ne: '全程马拉松' }
    });
    
    console.log(`Found ${ultraRaces.length} ultra races to migrate`);

    // 2. 遍历并更新
    for (const race of ultraRaces) {
      const originalType = race.raceType;
      console.log(`Processing race: ${race.name}, original type: ${originalType}`);
      
      race.raceType = '超马';
      await race.save();

      const result = await Record.updateMany(
        { raceId: race._id },
        { 
          $set: { 
            ultraDistance: originalType.replace('超马', '').trim()
          } 
        }
      );

      console.log(`Updated ${result.modifiedCount} records for race ${race.name}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

// 确保在发生未捕获的错误时也能清理连接
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise rejection:', error);
  mongoose.disconnect().then(() => {
    process.exit(1);
  });
});

migrateRaceTypes();