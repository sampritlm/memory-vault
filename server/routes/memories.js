import express from 'express';
import Sentiment from 'sentiment';
import Memory from '../models/Memory.js';
import { verifyToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();
const sentiment = new Sentiment();

// Create memory
router.post('/', verifyToken, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, content, category, date, unlockDate, isPrivate, password, isFavorite, isPinned } = req.body;
    const cleanContent = content ? content.replace(/<[^>]+>/g, '') : '';
    const result = sentiment.analyze(cleanContent);
    let moodEmoji = '😐';
    if (result.score >= 2) moodEmoji = '😄';
    else if (result.score > 0) moodEmoji = '🙂';
    else if (result.score <= -2) moodEmoji = '😢';
    else if (result.score < 0) moodEmoji = '😟';

    const imagePath = req.files && req.files['image'] ? `/uploads/${req.files['image'][0].filename}` : null;
    const audioPath = req.files && req.files['audio'] ? `/uploads/${req.files['audio'][0].filename}` : null;
    const videoPath = req.files && req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : null;

    const memory = new Memory({
      userId: req.user.userId,
      title,
      content,
      category,
      date: date || Date.now(),
      unlockDate: unlockDate || null,
      image: imagePath,
      audio: audioPath,
      video: videoPath,
      isPrivate: isPrivate === 'true' || isPrivate === true,
      password: (isPrivate === 'true' || isPrivate === true) ? password : '',
      isFavorite: isFavorite === 'true' || isFavorite === true,
      isPinned: isPinned === 'true' || isPinned === true,
      mood: moodEmoji
    });
    await memory.save();
    res.status(201).json(memory);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all memories for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const memories = await Memory.find({ userId: req.user.userId })
      .sort({ isPinned: -1, date: -1 });
    res.json(memories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single memory
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ message: 'Not found' });
    if (memory.userId.toString() !== req.user.userId)
      return res.status(401).json({ message: 'Not authorized' });
    res.json(memory);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update memory
router.put('/:id', verifyToken, async (req, res) => {
  try {
    let memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ message: 'Not found' });
    if (memory.userId.toString() !== req.user.userId)
      return res.status(401).json({ message: 'Not authorized' });

    const { title, content, category, date, image, isPrivate, password, isFavorite, isPinned } = req.body;
    if (title) memory.title = title;
    if (content) memory.content = content;
    if (category) memory.category = category;
    if (date) memory.date = date;
    if (image !== undefined) memory.image = image;
    if (isPrivate !== undefined) memory.isPrivate = isPrivate;
    if (password !== undefined) memory.password = password;
    if (isFavorite !== undefined) memory.isFavorite = isFavorite;
    if (isPinned !== undefined) memory.isPinned = isPinned;

    await memory.save();
    res.json(memory);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete memory
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) return res.status(404).json({ message: 'Not found' });
    if (memory.userId.toString() !== req.user.userId)
      return res.status(401).json({ message: 'Not authorized' });

    await memory.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;