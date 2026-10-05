import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, 
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      // Images
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      // Audio
      "audio/mpeg",  
      "audio/mp3",   
      "audio/wav",   
      "audio/wave",  
      "audio/ogg",   
      "audio/x-wav",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, PNG, WEBP images and MP3, WAV, OGG audio files are allowed"));
    }
  },
});
