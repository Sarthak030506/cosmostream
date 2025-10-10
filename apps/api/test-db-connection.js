// Quick test script to verify database connection
// Run this with: node test-db-connection.js

require('dotenv').config();
const { Pool } = require('pg');

console.log('\n🔍 Testing Database Connection...\n');

// Show what environment variables are loaded
console.log('Environment Variables:');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('  DATABASE_URL:', process.env.DATABASE_URL || 'NOT SET');
console.log('  PORT:', process.env.PORT || 'NOT SET');
console.log('');

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in .env file!');
  console.error('');
  console.error('Fix this by creating apps/api/.env with:');
  console.error('DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cosmostream');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function testConnection() {
  try {
    console.log('Attempting to connect to PostgreSQL...');

    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Connection successful!\n');

    // Test query
    console.log('Running test query: SELECT COUNT(*) FROM users');
    const result = await client.query('SELECT COUNT(*) as user_count FROM users');
    console.log('✅ Query successful!');
    console.log('   Users in database:', result.rows[0].user_count);
    console.log('');

    // Test getting actual users
    console.log('Fetching user emails...');
    const users = await client.query('SELECT email, name, role FROM users LIMIT 3');
    console.log('✅ Users found:');
    users.rows.forEach(user => {
      console.log(`   - ${user.email} (${user.role}): ${user.name}`);
    });
    console.log('');

    client.release();

    console.log('🎉 DATABASE CONNECTION TEST PASSED!\n');
    console.log('Your database is working correctly.');
    console.log('The API server should connect without errors.\n');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ DATABASE CONNECTION FAILED!\n');
    console.error('Error:', error.message);
    console.error('');

    if (error.message.includes('ECONNREFUSED')) {
      console.error('🔧 Fix: PostgreSQL is not running');
      console.error('   Run: docker-compose up -d postgres');
      console.error('   Wait 10 seconds, then try again');
    } else if (error.message.includes('password')) {
      console.error('🔧 Fix: Wrong password in DATABASE_URL');
      console.error('   Check docker-compose.yml for correct password');
      console.error('   Update apps/api/.env with correct password');
    } else if (error.message.includes('database')) {
      console.error('🔧 Fix: Database "cosmostream" does not exist');
      console.error('   Run: docker-compose down -v');
      console.error('   Then: docker-compose up -d postgres');
    } else {
      console.error('🔧 Check the error message above for clues');
    }

    console.error('');
    await pool.end();
    process.exit(1);
  }
}

testConnection();
