const mysql = require('mysql2/promise');

async function testConnection(user, password, database) {
    console.log(`Testing connection for user: ${user}`);
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: user,
            password: password,
            database: database
        });
        console.log(`Successfully connected as ${user}!`);
        await connection.end();
        return true;
    } catch (error) {
        console.error(`Failed to connect as ${user}:`, error.message);
        return false;
    }
}

(async () => {
    // Config 1: From .env
    await testConnection('panodasehir01', 'D.220575dlk.', 'panodasehir');

    // Config 2: From history
    await testConnection('kaclira', 'KacliraKaclira1234**', 'panodasehir');
})();
