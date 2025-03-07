// Import necessary modules
const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-adminsdk.json');
require('dotenv').config();

// Initialize Firebase Admin SDK (Only for Firestore)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup Express
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint: Upload Image to Cloudinary
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'gallery',
        format: 'jpg', // Ensure JPEG format
        quality: 'auto:best', // Optimize without quality loss
      },
      async (error, result) => {
        if (error) return res.status(500).json({ error: error.message });

        // Store metadata in Firestore
        const photoRef = await db.collection('photos').add({
          url: result.secure_url,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.json({ id: photoRef.id, url: result.secure_url });
      }
    ).end(file.buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
