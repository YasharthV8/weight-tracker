const db = require('../config/db'); // Your database connection pool

class User {
    static async findByUsername(username) {
        // Parameterized query for security
        const sql = `SELECT id, username, password_hash FROM users WHERE username = ?`;
        
        // Executes the query (syntax depends on your specific SQL library, e.g., mysql2 or pg)
        const [rows] = await db.execute(sql, [username]);
        return rows[0]; 
    }
}

module.exports = User;