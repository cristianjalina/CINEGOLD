import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import multer from 'multer';
import sharp from 'sharp';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new ApiError(422, 'Solo se permiten imágenes.'));
    }
    callback(null, true);
  },
});

export const uploadImage = memoryUpload.single('image');

export async function convertUploadedImageToWebp(req, _res, next) {
  try {
    if (!req.file) {
      throw new ApiError(422, 'Debe adjuntar una imagen en el campo image.');
    }

    mkdirSync(env.uploadDir, { recursive: true });
    const safeName = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9]/g, '-')}.webp`;
    const outputPath = join(env.uploadDir, safeName);

    await sharp(req.file.buffer).webp({ quality: 82 }).toFile(outputPath);

    req.webpFile = {
      filename: safeName,
      path: outputPath,
      url: `/uploads/${safeName}`,
    };

    next();
  } catch (error) {
    next(error);
  }
}
