const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
{
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) =>
{
    const { username, password, displayName } = req.body;
    console.log("req.body: ",req.body);

    if (!username || !password)
    {
        return res.status(400).json({
            message: 'Mohon isi semua field'
        });
    }

    try
    {
        const newUser = await userModel.createUser(username, password, displayName || username);
        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            displayName: newUser.display_name,
            token: generateToken(newUser.id),
        });
    }
    catch (error)
    {
        if (error.message === 'Username sudah ada')
        {
            return res.status(409).json({
                meesage: "Username sudah terdaftar",
                error: error.message
            });
        }
        console.error(error);
        res.status(500).json({
            message: 'Pendaftaran gagal'
        });
    }
};  

const loginUser = async (req, res) =>
{
    const { username, password } = req.body;
    try
    {
        const user = await userModel.getUserByUsername(username);
        if (user && (await userModel.comparePassword(password, user.password_hash)))
        {
            res.json({
                id: user.id,
                username: user.username,
                displayName: user.display_name,
                token: generateToken(user.id),
            });
        }
        else
        {
            res.status(401).json({
                message: 'Username atau password salah'
            });
        }
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({
            message: 'Login gagal'
        });
    }
};

const updateUserDisplay = async (req, res) => {
    const userId = req.userId;
    const { newDisplayName } = req.body;

    if (!newDisplayName || newDisplayName.trim() === '') {
        return res.status(400).json({ message: 'Nama tampilan baru harus diisi.' });
    }

    try {
        const updatedUser = await userModel.updateDisplayName(userId, newDisplayName);

        if (!updatedUser) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        res.json({
            message: 'Nama tampilan berhasil diperbarui.',
            id: updatedUser.id,
            displayName: updatedUser.display_name,
            username: updatedUser.username,
        });

    } catch (error) {
        console.error('Error updating display name:', error);
        res.status(500).json({ message: 'Gagal memperbarui nama tampilan.' });
    }
};

const deleteAccount = async (req, res) => {
    const userId = req.userId; 

    try {
        const deletedUser = await userModel.deleteUser(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        res.status(200).json({
            message: 'Akun berhasil dihapus.',
            deletedId: deletedUser.id
        });

    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Gagal menghapus akun.' });
    }
};

const getAllUser = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        // Kembalikan array user
        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Gagal mengambil daftar user.' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    updateUserDisplay,
    deleteAccount,
    getAllUser,
}