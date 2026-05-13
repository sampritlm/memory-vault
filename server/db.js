import mongoose from 'mongoose';

let gfsBucket = null;

export const connectDB = async (uri) => {
  await mongoose.connect(uri);
  console.log('MongoDB Connected');
  const db = mongoose.connection.db;
  gfsBucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
};

export const getGFS = () => gfsBucket;
