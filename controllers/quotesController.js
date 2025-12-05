const quotesModel = require('../models/quotesModel');

// Membuat quote baru
const addQuote = async (req, res) => {
try {
    const { tmdbId, quoteText, quoter } = req.body;
    const userId = req.userId; // Dari JWT middleware

    // Validasi input
    if (!tmdbId || !quoteText || !quoter) {
    return res.status(400).json({
        success: false,
        message: 'tmdbId, quoteText, and quoter are required'
    });
    }

    if (quoteText.trim() === '') {
    return res.status(400).json({
        success: false,
        message: 'Quote text cannot be empty'
    });
    }

    const newQuote = await quotesModel.createQuote(userId, tmdbId, quoteText, quoter);

    res.status(201).json({
    success: true,
    message: 'Quote created successfully',
    data: newQuote
    });
} catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
    success: false,
    message: 'Failed to create quote',
    error: error.message
    });
}
};

// Mendapatkan semua quotes milik user
const getAllQuotes = async (req, res) => {
try {
    const userId = req.userId;

    const quotes = await quotesModel.getAllQuotesByUserId(userId);

    res.status(200).json({
    success: true,
    data: quotes,
    count: quotes.length
    });
} catch (error) {
    console.error('Error getting quotes:', error);
    res.status(500).json({
    success: false,
    message: 'Failed to get quotes',
    error: error.message
    });
}
};

// Mendapatkan detail quote berdasarkan ID
const getQuote = async (req, res) => {
try {
    const { quoteId } = req.params;
    const userId = req.userId;

    // Cek apakah user adalah pemilik quote
    const isOwner = await quotesModel.isQuoteOwner(quoteId, userId);
    
    if (!isOwner) {
    return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this quote'
    });
    }

    const quote = await quotesModel.getQuoteById(quoteId);

    if (!quote) {
    return res.status(404).json({
        success: false,
        message: 'Quote not found'
    });
    }

    res.status(200).json({
    success: true,
    data: quote
    });
} catch (error) {
    console.error('Error getting quote:', error);
    res.status(500).json({
    success: false,
    message: 'Failed to get quote',
    error: error.message
    });
}
};

// Update quote
const updateQuote = async (req, res) => {
try {
    const { quoteId } = req.params;
    const { quoteText, quoter } = req.body;
    const userId = req.userId;

    // Validasi input
    if (!quoteText || !quoter) {
    return res.status(400).json({
        success: false,
        message: 'quoteText and quoter are required'
    });
    }

    if (quoteText.trim() === '') {
    return res.status(400).json({
        success: false,
        message: 'Quote text cannot be empty'
    });
    }

    // Cek apakah user adalah pemilik quote
    const isOwner = await quotesModel.isQuoteOwner(quoteId, userId);
    
    if (!isOwner) {
    return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this quote'
    });
    }

    const updatedQuote = await quotesModel.updateQuote(quoteId, quoteText, quoter);

    if (!updatedQuote) {
    return res.status(404).json({
        success: false,
        message: 'Quote not found'
    });
    }

    res.status(200).json({
    success: true,
    message: 'Quote updated successfully',
    data: updatedQuote
    });
} catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({
    success: false,
    message: 'Failed to update quote',
    error: error.message
    });
}
};

// Hapus quote
const deleteQuote = async (req, res) => {
try {
    const { quoteId } = req.params;
    const userId = req.userId;

    // Cek apakah user adalah pemilik quote
    const isOwner = await quotesModel.isQuoteOwner(quoteId, userId);
    
    if (!isOwner) {
    return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this quote'
    });
    }

    const deletedQuote = await quotesModel.deleteQuote(quoteId);

    if (!deletedQuote) {
    return res.status(404).json({
        success: false,
        message: 'Quote not found'
    });
    }

    res.status(200).json({
    success: true,
    message: 'Quote deleted successfully',
    data: deletedQuote
    });
} catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({
    success: false,
    message: 'Failed to delete quote',
    error: error.message
    });
}
};

// Mendapatkan quotes berdasarkan movie (opsional)
const getQuotesByMovie = async (req, res) => {
try {
    const { tmdbId } = req.params;
    const userId = req.userId;

    const quotes = await quotesModel.getQuotesByTmdbId(userId, tmdbId);

    res.status(200).json({
    success: true,
    data: quotes,
    count: quotes.length
    });
} catch (error) {
    console.error('Error getting quotes by movie:', error);
    res.status(500).json({
    success: false,
    message: 'Failed to get quotes',
    error: error.message
    });
}
};

module.exports = {
addQuote,
getAllQuotes,
getQuote,
updateQuote,
deleteQuote,
getQuotesByMovie
};