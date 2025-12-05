const db = require('../config/db');
const bcrypt = require('bcryptjs');

// create
const createUser = async (username, password, displayName) =>
{
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const query = 'INSERT INTO users(username, password_hash, display_name) VALUES($1, $2, $3) RETURNING id, username, display_name';
    const values = [username, passwordHash, displayName];

    try
    {
        const result = await db.query(query, values);
        return result.rows[0];
    }
    catch (error)
    {
        if (error.code === '23505') // usn sudah ada (unique_violation)
        {
            throw new Error('Username sudah ada');
        }
        throw error;
    }
};

const getUserById = async (id) =>
{
    // Ambil data user, tapi TIDAK perlu password_hash
    const query = 'SELECT id, username, display_name FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
};

// read
const getUserByUsername = async (username) =>
{
    const query = 'SELECT id, username, password_hash, display_name FROM users WHERE username = $1';
    const result = await db.query(query, [username]);
    return result.rows[0];
};

const comparePassword = async (inputPassword, storedHash) =>
{
    return bcrypt.compare(inputPassword, storedHash);
};

// update
const updateDisplayName = async (id, newDisplayName) =>
{
    const query = 'UPDATE users SET display_name = $2 WHERE id = $1 RETURNING id, username, display_name';
    const values = [id, newDisplayName];
    const result = await db.query(query, values);
    return result.rows[0];
}

// delete
const deleteUser = async (id) =>
{
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows[0];
};

const getAllUsers = async () => {
    // Hanya ambil kolom yang aman untuk dikirim ke client (tanpa password_hash)
    const query = 'SELECT id, username, display_name FROM users ORDER BY id';
    const result = await db.query(query);
    return result.rows;
}

module.exports = 
{
    createUser,
    getUserByUsername,
    comparePassword,
    updateDisplayName,
    deleteUser,
    getUserById,
    getAllUsers,
};