const { Pool } = require('pg');
require('dotenv').config({ path: '.env.production' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function addEmissionReduceBoard() {
  try {
    // Check if board already exists
    const checkResult = await pool.query(
      'SELECT * FROM boards WHERE slug = $1',
      ['emission_reduce']
    );

    if (checkResult.rows.length > 0) {
      console.log('emission_reduce board already exists');
      return;
    }

    // Add emission_reduce board
    const insertResult = await pool.query(
      `INSERT INTO boards (name, slug, description, type, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING *`,
      [
        '온실가스 감축 사업',
        'emission_reduce',
        '서울대학교 온실가스 감축 사업 현황',
        'gallery-01'
      ]
    );

    console.log('Successfully added emission_reduce board:', insertResult.rows[0]);
  } catch (error) {
    console.error('Error adding emission_reduce board:', error);
  } finally {
    await pool.end();
  }
}

addEmissionReduceBoard();