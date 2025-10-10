// Test bcrypt password comparison
const bcrypt = require('bcrypt');

const hash = '$2b$10$XQ1YL.4eY3ZqF4UkT6QKDO4KGqJP9FpQ2uQw3xH0vB5LHxYmNmVGe';

const passwordsToTest = [
    'password123',
    'password',
    'admin123',
    'test123',
    'changeme',
];

async function testPasswords() {
    console.log('Testing passwords against hash from database...\n');
    console.log('Hash:', hash);
    console.log('');

    for (const password of passwordsToTest) {
        const matches = await bcrypt.compare(password, hash);
        console.log(`Password "${password}": ${matches ? '✅ MATCH!' : '❌ No match'}`);
    }

    console.log('\n---\n');
    console.log('Generating a NEW hash for "password123" to compare:');
    const newHash = await bcrypt.hash('password123', 10);
    console.log('New hash:', newHash);

    const testNewHash = await bcrypt.compare('password123', newHash);
    console.log('Test new hash:', testNewHash ? '✅ Works!' : '❌ Failed');
}

testPasswords();
