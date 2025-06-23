const express = require("express");
const route = express.Router();
const multer = require("multer");
const { v2 } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const Verify = require("../authMiddleware");
const { put } = require("@vercel/blob");
const sharp = require("sharp");
require("dotenv").config()
// v2.config({
//   cloud_name:process.env.CLOUDNAME,
//   api_key:process.env.APIKEY,
//   api_secret:process.env.APISECRECT,
// });
// const storage = new CloudinaryStorage({
//   cloudinary: v2,
//   params: {
//     folder: "CourseFinder",
//     allowed_formats: ["jpg", "jpeg", "png"],
//   },
// });
const upload = multer({ storage: multer.memoryStorage() });



route.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // ✅ Compress Image with Sharp
    const compressedImage = await sharp(req.file.buffer)
      .resize({ width: 800 }) // Resize width to 800px
      .jpeg({ quality: 70 }) // Compress JPEG to 70% quality
      .toBuffer();

    const blob = await put(req.file.originalname, compressedImage, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    res.json({ image: blob.url });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

route.delete("/delete",Verify,async(req,res)=>{

  try {
    const {public_id} = req.body
    const result = await v2.uploader.destroy(public_id);
    if (result.result === "ok") {
     return  res.status(200).json({ message: "Image deleted successfully" });
    } else {
      throwError(400,"Failed to delete image")
    }
  } catch (error) {
    throwError(error)
  }
})


module.exports = route