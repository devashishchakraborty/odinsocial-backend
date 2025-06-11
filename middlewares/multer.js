import multer from "multer";
const storage = multer.memoryStorage(); // store in memory to directly upload to cloudinary
const upload = multer({ storage });

export default upload;
