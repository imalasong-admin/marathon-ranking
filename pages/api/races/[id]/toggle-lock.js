// pages/api/races/[id]/toggle-lock.js
import connectDB from '../../../../lib/mongodb';
import Race from '../../../../models/Race';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: '不支持的请求方法' });
  }

  await connectDB();
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.isAdmin) {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }

  try {
    const { id } = req.query;
    const race = await Race.findById(id);

    if (!race) {
      return res.status(404).json({ success: false, message: '场次不存在' });
    }

    race.isLocked = !race.isLocked;
    race.lastModifiedBy = session.user.id;
    await race.save();

    res.status(200).json({
      success: true,
      message: race.isLocked ? '场次已锁定' : '场次已解锁',
      race
    });
  } catch (error) {
    console.error('切换场次锁定状态错误:', error);
    res.status(500).json({ success: false, message: '操作失败，请重试' });
  }
}