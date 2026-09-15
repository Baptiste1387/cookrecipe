const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

class UploadController {
  upload(req, res) {
    upload.single('image')(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      if (!ALLOWED.includes(req.file.mimetype)) return res.status(400).json({ error: 'Invalid file type' });

      try {
        const ext = req.file.mimetype === 'image/png' ? 'png' : req.file.mimetype === 'image/webp' ? 'webp' : 'jpg';
        const filename = `${Date.now()}-${Math.round(Math.random()*1e6)}.${ext}`;
        const outPath = path.join(__dirname, '..', '..', 'uploads', filename);

        // Resize to max width 1200 and optimize
        await sharp(req.file.buffer)
          .rotate()
          .resize({ width: 1200, withoutEnlargement: true })
          .toFile(outPath);

        return res.status(201).json({ image_path: `/uploads/${filename}` });
      } catch (e) {
        console.error('upload error', e);
        return res.status(500).json({ error: 'Upload failed' });
      }
    });
  }
}

module.exports = new UploadController();
