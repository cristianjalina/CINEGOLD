import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadController = {
  image: asyncHandler(async (req, res) => {
    res.status(201).json({
      file: req.webpFile,
    });
  }),
};
