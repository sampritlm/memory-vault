import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import memoryRoutes from './routes/memories.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json({ limit: '250mb' }));
app.use(express.urlencoded({ limit: '250mb', extended: true }));
let gfs;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    const db = mongoose.connection.db;
    gfs = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads'
    });
  })
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/memories', memoryRoutes);

// GridFS media streaming route
app.get('/api/media/:filename', async (req, res) => {
  if (!gfs) return res.status(500).json({ message: 'GridFS not initialized' });
  try {
    const files = await gfs.find({ filename: req.params.filename }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }
    const contentType = files[0].contentType || 'application/octet-stream';
    res.set('Content-Type', contentType);
    const readStream = gfs.openDownloadStreamByName(req.params.filename);
    readStream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching file' });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));