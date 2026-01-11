const express = require('express');
const router = express.Router();
const UserRepository = require('../repositories/UserRepository');
const GameHistoryRepository = require('../repositories/GameHistoryRepository');
const { requireAuth } = require('../middleware/auth');

// Get Profile
router.get('/:userId', requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await UserRepository.findByUserId(userId, true);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // Fetch game history
        const gameHistory = await GameHistoryRepository.getGameHistory(userId, 50);
        user.gameHistory = gameHistory;
        
        res.json(user);
    } catch (error) {
        console.error('User fetch error:', error);
        res.status(500).json({ error: 'Server error with user fetching' });
    }
});

// Update Profile
router.put('/:userId', requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

        const user = await UserRepository.update(userId, req.body);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json(user);
    } catch (error) {
        console.error('User update error:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

// Get Games
router.get('/:userId/games', requireAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        if (req.user.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

        const gameHistory = await GameHistoryRepository.getGameHistory(userId, 100);
        res.json(gameHistory);
    } catch (err) {
        console.error('Game history error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
