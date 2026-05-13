import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import path from 'path';

console.log("--- AWS CONFIG DEBUG ---");
console.log("AWS_REGION:", process.env.AWS_REGION || 'not set (defaulting to us-east-1)');
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "SET (hidden for security)" : "UNDEFINED");
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "SET (hidden for security)" : "UNDEFINED");
console.log("AWS_S3_BUCKET_NAME:", process.env.AWS_S3_BUCKET_NAME || "UNDEFINED");
console.log("------------------------");

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'uploads/' + file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure upload limits and filters
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 250 * 1024 * 1024 // 250MB max file size
  }
});
