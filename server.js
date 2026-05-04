const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/versekit', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

// Asset Schema
const assetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'banner' },
  type: String,
  size: String,
  filename: { type: String, unique: true },
  url: String,
  uploadedAt: { type: Date, default: Date.now }
});

const Asset = mongoose.model('Asset', assetSchema);

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.random().toString(36).substring(7) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/zip'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Routes
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const asset = new Asset({
      title: req.body.title || req.file.originalname.split('.')[0],
      category: req.body.category || 'banner',
      type: path.extname(req.file.originalname).substring(1).toUpperCase(),
      size: (req.file.size / (1024 * 1024)).toFixed(1) + ' MB',
      filename: req.file.filename,
      url: `/api/file/${req.file.filename}`
    });

    await asset.save();
    res.json(asset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assets', async (req, res) => {
  try {
    const assets = await Asset.find().sort({ uploadedAt: -1 });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/file/:filename', (req, res) => {
  const filepath = path.join(__dirname, 'uploads', req.params.filename);
  res.download(filepath);
});

app.delete('/api/assets/:id', async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    if (asset) {
      const filepath = path.join(__dirname, 'uploads', asset.filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      res.json({ success: true, message: 'Asset deleted' });
    } else {
      res.status(404).json({ error: 'Asset not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
