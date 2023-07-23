const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  // Configuring cloudinary storage with our credentials.
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  // Setting up an instance of cloudinary storage in this file.
  cloudinary, // cloudinary object we just configured.
  params: { // params is important to put here otherwise it just store things in the main gallery and not in YelpCamp folder.
    folder: "YelpCamp", // Folder in which the data shall be stored on the cloud.
    allowedFormats: ["jpeg", "jpg", "png"],
  },
});

module.exports = { // Just bca you're sending cloudinary & storage from here and you thing I'll write const {cloudinary} = require('../cloudinary') and you'll get cloudinary nope i wasted a lot of time on this actually you'll have to destructure cause module.exports is a object here containing two things.
  cloudinary, // cloudinary object we just configured.
  storage, // storage instance that says store it in YelpCamp folder and allowed formats.
};
