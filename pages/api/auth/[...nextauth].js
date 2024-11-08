import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email });
          
          if (!user) {
            throw new Error('用户不存在');
          }

          // 先检查用户是否被锁定
          if (user.isLocked) {
            throw new Error(user.lockReason ? 
              `账号已被锁定：${user.lockReason}` : 
              '账号已被锁定');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('密码错误');
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            emailVerified: user.emailVerified,  // 添加这行
            createdAt: user.createdAt          // 添加这行
          };
        } catch (error) {
          throw error;  // 直接抛出错误，让 Next Auth 处理
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.emailVerified = user.emailVerified;  // 添加这行
        token.createdAt = user.createdAt;         // 添加这行
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
        session.user.emailVerified = token.emailVerified;  // 添加这行
        session.user.createdAt = token.createdAt;         // 添加这行
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);