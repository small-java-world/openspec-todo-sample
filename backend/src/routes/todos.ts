import { Hono } from 'hono';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const todos = new Hono();

// 全てのTODOエンドポイントに認証を適用
todos.use('*', authMiddleware);

// TODO一覧取得（ログインユーザーのTODOのみ）
todos.get('/', async (c) => {
  try {
    const userId = c.get('userId');
    
    const result = await pool.query(
      'SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    return c.json({ todos: result.rows });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return c.json({ error: 'Failed to fetch todos' }, 500);
  }
});

// 特定のTODO取得（自分のTODOのみ）
todos.get('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');
    
    const result = await pool.query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return c.json({ error: 'Todo not found' }, 404);
    }
    
    return c.json({ todo: result.rows[0] });
  } catch (error) {
    console.error('Error fetching todo:', error);
    return c.json({ error: 'Failed to fetch todo' }, 500);
  }
});

// TODO作成
todos.post('/', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { title, description } = body;
    
    if (!title || title.trim() === '') {
      return c.json({ error: 'Title is required' }, 400);
    }
    
    const result = await pool.query(
      'INSERT INTO todos (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, description || null]
    );
    
    return c.json({ todo: result.rows[0] }, 201);
  } catch (error) {
    console.error('Error creating todo:', error);
    return c.json({ error: 'Failed to create todo' }, 500);
  }
});

// TODO更新（自分のTODOのみ）
todos.put('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const body = await c.req.json();
    const { title, description, completed } = body;
    
    // 既存のTODOを取得（所有者チェック）
    const checkResult = await pool.query(
      'SELECT * FROM todos WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return c.json({ error: 'Todo not found or access denied' }, 404);
    }
    
    const currentTodo = checkResult.rows[0];
    
    // 更新値を決定
    const newTitle = title !== undefined ? title : currentTodo.title;
    const newDescription = description !== undefined ? description : currentTodo.description;
    const newCompleted = completed !== undefined ? completed : currentTodo.completed;
    
    const result = await pool.query(
      `UPDATE todos 
       SET title = $1, description = $2, completed = $3, updated_at = NOW() 
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [newTitle, newDescription, newCompleted, id, userId]
    );
    
    return c.json({ todo: result.rows[0] });
  } catch (error) {
    console.error('Error updating todo:', error);
    return c.json({ error: 'Failed to update todo' }, 500);
  }
});

// TODO削除（自分のTODOのみ）
todos.delete('/:id', async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');
    
    const result = await pool.query(
      'DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    
    if (result.rows.length === 0) {
      return c.json({ error: 'Todo not found or access denied' }, 404);
    }
    
    return c.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return c.json({ error: 'Failed to delete todo' }, 500);
  }
});

export default todos;
