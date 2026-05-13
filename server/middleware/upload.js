import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    return {
      bucketName: 'uploads',
      filename: filename
    };
  }
});

// Configure upload limits and filters
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 250 * 1024 * 1024 // 250MB max file size
  }
});
