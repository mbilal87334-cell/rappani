import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("Testing with Cloudinary Config:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);

cloudinary.uploader.upload("https://via.placeholder.com/150", {
  folder: "rappani_store_uploads"
}).then(result => {
  console.log("Upload Success:", result.secure_url);
}).catch(error => {
  console.error("Upload Error:", error);
});
