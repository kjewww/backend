    const db = require('../config/db');

    const createList = async (userId, name, description) => {
        const query = `
            INSERT INTO custom_lists (user_id, name, description, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING *
        `;
        const values = [userId, name, description];
        const result = await db.query(query, values);
        return result.rows[0];
    };

    const getAllListsByUserId = async (userId, includeMovies = false) => {
    if (includeMovies) {
        const query = `
        SELECT 
            cl.*,
            COUNT(li.tmdb_id) as movie_count,
            COALESCE(
                json_agg(
                    json_build_object(
                        'tmdb_id', m.tmdb_id,
                        'title', m.title,
                        'release_year', m.release_year,
                        'poster_path', m.poster_path,
                        'media_type', m.media_type,
                        'genre', m.genre,
                        'added_at', li.added_at
                    ) ORDER BY li.added_at DESC
                ) FILTER (WHERE m.tmdb_id IS NOT NULL), '[]'
            ) as movies
        FROM custom_lists cl
        LEFT JOIN list_items li ON cl.id = li.list_id
        LEFT JOIN movies m ON li.tmdb_id = m.tmdb_id
        WHERE cl.user_id = $1
        GROUP BY cl.id
        ORDER BY cl.created_at DESC
        `;

        const result = await db.query(query, [userId]);
        return result.rows.map(r => {
            // Ensure movie_count is integer and movies is an array
            return Object.assign({}, r, { movie_count: parseInt(r.movie_count, 10), movies: r.movies || [] });
        });
    }

    const query = `
        SELECT 
        cl.*,
        COUNT(li.tmdb_id) as movie_count
        FROM custom_lists cl
        LEFT JOIN list_items li ON cl.id = li.list_id
        WHERE cl.user_id = $1
        GROUP BY cl.id
        ORDER BY cl.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows.map(r => Object.assign({}, r, { movie_count: parseInt(r.movie_count, 10) }));
    };

    const getListById = async (listId) => {
    const query = `
        SELECT 
        cl.*,
        json_agg(
            json_build_object(
            'tmdb_id', m.tmdb_id,
            'title', m.title,
            'release_year', m.release_year,
            'poster_path', m.poster_path,
            'media_type', m.media_type,
            'genre', m.genre,
            'added_at', li.added_at
            ) ORDER BY li.added_at DESC
        ) FILTER (WHERE m.tmdb_id IS NOT NULL) as movies
        FROM custom_lists cl
        LEFT JOIN list_items li ON cl.id = li.list_id
        LEFT JOIN movies m ON li.tmdb_id = m.tmdb_id
        WHERE cl.id = $1
        GROUP BY cl.id
    `;
    const result = await db.query(query, [listId]);
    return result.rows[0];
    };

    const updateList = async (listId, name, description) => {
    const query = `
        UPDATE custom_lists
        SET name = $1, description = $2
        WHERE id = $3
        RETURNING *
    `;
    const values = [name, description, listId];
    const result = await db.query(query, values);
    return result.rows[0];
    };

    const deleteList = async (listId) => {
    // Hapus semua item di list terlebih dahulu
    await db.query('DELETE FROM list_items WHERE list_id = $1', [listId]);
    
    // Hapus list
    const query = 'DELETE FROM custom_lists WHERE id = $1 RETURNING *';
    const result = await db.query(query, [listId]);
    return result.rows[0];
    };

    const isListOwner = async (listId, userId) => {
    const query = 'SELECT user_id FROM custom_lists WHERE id = $1';
    const result = await db.query(query, [listId]);
    
    if (result.rows.length === 0) {
        return false;
    }
    
    return result.rows[0].user_id === userId;
    };

    const addMovieToList = async (listId, tmdbId) => {
    // Cek apakah movie sudah ada di list
    const checkQuery = 'SELECT * FROM list_items WHERE list_id = $1 AND tmdb_id = $2';
    const checkResult = await db.query(checkQuery, [listId, tmdbId]);
    
    if (checkResult.rows.length > 0) {
        throw new Error('Movie already exists in this list');
    }

    // Cek apakah movie ada di tabel movies
    const movieQuery = 'SELECT * FROM movies WHERE tmdb_id = $1';
    const movieResult = await db.query(movieQuery, [tmdbId]);
    
    if (movieResult.rows.length === 0) {
        throw new Error('Movie not found in database');
    }

    // Tambahkan movie ke list
    const insertQuery = `
        INSERT INTO list_items (list_id, tmdb_id, added_at)
        VALUES ($1, $2, NOW())
        RETURNING *
    `;
    const insertResult = await db.query(insertQuery, [listId, tmdbId]);

    // Ambil data movie yang baru saja ditambahkan beserta waktu penambahan
    const addedMovieQuery = `
        SELECT m.tmdb_id, m.title, m.release_year, m.poster_path, m.media_type, m.genre, li.added_at
        FROM list_items li
        JOIN movies m ON li.tmdb_id = m.tmdb_id
        WHERE li.list_id = $1 AND li.tmdb_id = $2
        LIMIT 1
    `;
    const addedMovieRes = await db.query(addedMovieQuery, [listId, tmdbId]);
    const addedMovie = addedMovieRes.rows[0];

    // Hitung jumlah movie di list
    const countRes = await db.query('SELECT COUNT(*) FROM list_items WHERE list_id = $1', [listId]);
    const movieCount = parseInt(countRes.rows[0].count, 10);

    return { addedMovie, movieCount };
    };

    // Hapus movie dari list
    const removeMovieFromList = async (listId, tmdbId) => {
    const query = `
        DELETE FROM list_items 
        WHERE list_id = $1 AND tmdb_id = $2
        RETURNING *
    `;
    const result = await db.query(query, [listId, tmdbId]);
    
    if (result.rows.length === 0) {
        throw new Error('Movie not found in this list');
    }
    
    return result.rows[0];
    };

    module.exports = {
    createList,
    getAllListsByUserId,
    getListById,
    updateList,
    deleteList,
    isListOwner,
    addMovieToList,
    removeMovieFromList
    };