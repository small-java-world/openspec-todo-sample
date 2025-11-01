import { Hono } from 'hono';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const auth = new Hono();

const SALT_ROUNDS = 10;

// ユーザー登録
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { username, email, password } = body;

    // バリデーション
    if (!username || !email || !password) {
      return c.json({ error: 'Username, email, and password are required' }, 400);
    }

    if (username.length < 3 || username.length > 50) {
      return c.json({ error: 'Username must be between 3 and 50 characters' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    // メールアドレスの簡易バリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    // ユーザーの重複チェック
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return c.json({ error: 'User with this email or username already exists' }, 409);
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // ユーザーを作成
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];

    // JWTトークンを生成
    const token = generateToken(user.id, user.email);

    return c.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
      token,
    }, 201);
  } catch (error) {
    console.error('Error registering user:', error);
    return c.json({ error: 'Failed to register user' }, 500);
  }
});

// ログイン
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    // バリデーション
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // ユーザーを検索
    const result = await pool.query(
      'SELECT id, username, email, password, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    const user = result.rows[0];

    // パスワードを検証
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }

    // JWTトークンを生成
    const token = generateToken(user.id, user.email);

    return c.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return c.json({ error: 'Failed to login' }, 500);
  }
});

// 現在のユーザー情報取得（認証必要）
auth.get('/me', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');

    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

export default auth;
