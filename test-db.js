const mongoose = require('mongoose');

const password = 'Marathon2024'; // 使用您设置的新密码
const uri = 
`mongodb+srv://marathon:${password}@cluster0.xc1i2.mongodb.net/marathon?retryWrites=true&w=majority&appName=Cluster0`;

// 打印连接字符串（隐藏密码）
console.log('尝试连接到:', uri.replace(/:[^:]*@/, ':****@'));

mongoose.connect(uri)
  .then(() => {
    console.log('✅ 连接成功！');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ 连接错误:', err);
    process.exit(1);
  });
