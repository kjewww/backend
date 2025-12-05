const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');

dotenv.config();
app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const listRoutes = require('./routes/listRoutes');
const quotesRoutes = require('./routes/quotesRoutes');
const ratingRoutes = require('./routes/ratingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/rating', ratingRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/quotes', quotesRoutes);

module.exports = app;