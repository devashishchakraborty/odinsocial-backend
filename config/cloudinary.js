import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (file, userId) => {
  let uploadResult;

  try {
    const result = await cloudinary.uploader
      .upload_stream(
        {
          folder: `odinsocial/user-${req.user.id}`,
          public_id: "image", // ← this sets the file name (without extension)
          overwrite: true, // optional: overwrite if a file with the same name exists
          resource_type: "image", // optional but safe
        },
        (error, result) => {
          if (error) return res.status(500).json({ error: error.message });
          return res.status(200).json({ url: result.secure_url });
        }
      )
      .end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }


  try {
    uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "filevault-uploads",
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
  } finally {
    // Always delete the file, even if upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }

  return uploadResult; // Might be undefined if upload failed
};

export default cloudinary;
