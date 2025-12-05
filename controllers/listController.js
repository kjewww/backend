const listModel = require('../models/listModel');

// Membuat list baru
const addList = async (req, res) => {
try {
    const { name, description } = req.body;
    const userId = req.userId;

    // Validasi input
    if (!name || name.trim() === '') {
    return res.status(400).json({
        success: false,
        message: 'List name is required'
    });
    }

    const newList = await listModel.createList(userId, name, description || '');

    res.status(201).json({
    success: true,
    message: 'List created successfully',
    data: newList
    });
} catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({
    success: false,
    message: 'Failed to create list',
    error: error.message
    });
}
};

// Mendapatkan semua list milik user
const getAllList = async (req, res) => {
try {
    const userId = req.userId;
    // support ?include=movies to include movie objects per list
    const include = req.query.include;
    const includeMovies = include === 'movies';
    const lists = await listModel.getAllListsByUserId(userId, includeMovies);
    res.status(200).json({
    success: true,
    data: lists,
    count: lists.length
    });
} catch (error) {
    console.error('Error getting lists:', error);
    res.status(500).json({
    success: false,
    message: 'Failed to get lists',
    error: error.message
    });
}
};

// Mendapatkan detail list beserta movies
const getListDetail = async (req, res) => {
try {
    const { listId } = req.params;
    const userId = req.userId;

    // Cek apakah user adalah pemilik list
    const isOwner = await listModel.isListOwner(listId, userId);
    
    if (!isOwner) {
    return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this list'
    });
    }

    const list = await listModel.getListById(listId);

    if (!list) {
    return res.status(404).json({
        success: false,
        message: 'List not found'
    });
    }

    res.status(200).json({
    success: true,
    data: list
    });
} catch (error) {
    console.error('Error getting list detail:', error);
    res.status(500).json({
    success: false,
    message: 'Failed to get list detail',
    error: error.message
    });
}
};

// Update list
const updateList = async (req, res) => {
try {
    const { listId } = req.params;
    const { name, description } = req.body;
    const userId = req.userId;

    // Validasi input
    if (!name || name.trim() === '') {
    return res.status(400).json({
        success: false,
        message: 'List name is required'
    });
    }

    // Cek apakah user adalah pemilik list
    const isOwner = await listModel.isListOwner(listId, userId);
    
    if (!isOwner) {
    return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this list'
    });
    }

    const updatedList = await listModel.updateList(listId, name, description || '');

    if (!updatedList) {
    return res.status(404).json({
        success: false,
        message: 'List not found'
    });
    }

    res.status(200).json({
    success: true,
    message: 'List updated successfully',
    data: updatedList
    });
} catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({
    success: false,
    message: 'Failed to update list',
    error: error.message
    });
}
};

// Hapus list
const deleteList = async (req, res) => {
try {
    const { listId } = req.params;
    const userId = req.userId;

    // Cek apakah user adalah pemilik list
    const isOwner = await listModel.isListOwner(listId, userId);
    
    if (!isOwner) {
    return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this list'
    });
    }

    const deletedList = await listModel.deleteList(listId);

    if (!deletedList) {
    return res.status(404).json({
        success: false,
        message: 'List not found'
    });
    }

    res.status(200).json({
    success: true,
    message: 'List deleted successfully',
    data: deletedList
    });
} catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({
    success: false,
    message: 'Failed to delete list',
    error: error.message
    });
}
};

// Tambah movie ke list
const addMovieToList = async (req, res) => {
try {
    const { listId } = req.params;
    const { tmdbId } = req.body;
    const userId = req.userId;

    // Validasi input
    if (!tmdbId) {
    return res.status(400).json({
        success: false,
        message: 'Movie ID (tmdbId) is required'
    });
    }

    // Cek apakah user adalah pemilik list
    const isOwner = await listModel.isListOwner(listId, userId);
    
    if (!isOwner) {
    return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this list'
    });
    }

    const listItem = await listModel.addMovieToList(listId, tmdbId);
    // listModel now returns { addedMovie, movieCount }
    const { addedMovie, movieCount } = listItem;

    res.status(201).json({
    success: true,
    message: 'Movie added to list successfully',
    data: {
        addedMovie,
        movieCount
    }
    });
} catch (error) {
    console.error('Error adding movie to list:', error);
    
    if (error.message === 'Movie already exists in this list') {
    return res.status(409).json({
        success: false,
        message: error.message
    });
    }
    
    if (error.message === 'Movie not found in database') {
    return res.status(404).json({
        success: false,
        message: error.message
    });
    }

    res.status(500).json({
    success: false,
    message: 'Failed to add movie to list',
    error: error.message
    });
}
};

// Hapus movie dari list
const removeMovieFromList = async (req, res) => {
try {
    const { listId, tmdbId } = req.params;
    const userId = req.userId;

    // Cek apakah user adalah pemilik list
    const isOwner = await listModel.isListOwner(listId, userId);
    
    if (!isOwner) {
    return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this list'
    });
    }

    const removedItem = await listModel.removeMovieFromList(listId, tmdbId);

    res.status(200).json({
    success: true,
    message: 'Movie removed from list successfully',
    data: removedItem
    });
} catch (error) {
    console.error('Error removing movie from list:', error);
    
    if (error.message === 'Movie not found in this list') {
    return res.status(404).json({
        success: false,
        message: error.message
    });
    }

    res.status(500).json({
    success: false,
    message: 'Failed to remove movie from list',
    error: error.message
    });
}
};

module.exports = {
addList,
getAllList,
getListDetail,
updateList,
deleteList,
addMovieToList,
removeMovieFromList
};