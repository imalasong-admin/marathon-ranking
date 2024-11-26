import { rateLimit } from 'express-rate-limit'  // 修改导入语句

// IP限制
export const ipLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: '请求过于频繁，请稍后再试' },
  legacyHeaders: false, // 禁用 `X-RateLimit-*` headers
  standardHeaders: 'draft-7' // 使用新的速率限制头
});

// 邮箱限制
export const emailLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body.email,
  message: { message: '该邮箱今日验证码次数已达上限' },
  legacyHeaders: false,
  standardHeaders: 'draft-7'
});