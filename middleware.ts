// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    // 获取路径中的用户ID
    const url = req.nextUrl.pathname;
    const urlUserId = url.split('/')[2];  // 从 /users/[id]/edit 获取 [id]

    // 获取当前登录用户
    const token = req.nextauth.token;
    
    // 编辑页面的权限检查
    if (url.match(/\/users\/.*\/edit$/)) {
      // 检查是否是本人操作
      if (token?.id !== urlUserId) {
        return NextResponse.redirect(new URL(`/users/${urlUserId}`, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

// 配置需要验证的路由
export const config = {
  matcher: [
    "/users/:id/edit"
  ]
};