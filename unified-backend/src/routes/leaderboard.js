const express = require('express');
const router = express.Router();
const UserRepository = require('../repositories/UserRepository');

router.get('/', async (req, res) => {
    try {
        const { limit = 10, timeControl = 'blitz' } = req.query;
        if (!['bullet', 'blitz', 'rapid', 'puzzles'].includes(timeControl)) {
            return res.status(400).json({ error: 'Invalid timeControl' });
        }

        const leaderboard = await UserRepository.getLeaderboard(timeControl, Number(limit));
        res.json(leaderboard);
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
