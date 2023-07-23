const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema; // Just shortening the term mongoose.Schema for later use.

// I want to define a virtual called .thumbnail on each image so i can show smaller thumbnails on upload page.
// To do that we can use cloudinary image transformation tool that changes the image dynamically based on what option was passed in the URL after /upload
// But virtuals can only be defined on schema's so we will take out the url: String, filename: String and make a new schema and the define the virtual

const ImageSchema = new Schema({
  url: String, // This will store req.files.path so we can access the image from this url we get back from cloudinary.
  filename: String, // This will store the file name that is given by cloudinary to the file we uploaded this helps us in deleting the file from our cloud storage.
});

ImageSchema.virtual("thumbnail").get(function () {
  // Why do we want thumbnail sized images is cause it's less resource intensive what happens is normally when we want to show smaller images we can set a certain width and height but the problem is cloudinary will still send us those entire high res images one it's wastes data and second it's slow and third it's just not needed.
  return this.url.replace("/upload", "/upload/w_200"); // It will return this new thumbnail url for any image we want but we won't actaully be storing the thumbnail propery in images as it's just a derivative property.
});

const opts = { toJSON: { virtuals: true } }; // Without this option being passed into the campgroundSchema you won't be able to access the virtual property you set upon your campground after strinify operation is applied upon it from the ejs file from where you try to send campgrounds data to clusterMap script.

const campgroundSchema = new Schema({
  title: String,
  price: Number,
  images: [ImageSchema],
  description: String,
  location: String,
  geometry: { // We don't store location in just two variables lat,long cause that's not compatible with other APIs that let us find things that are let's say closer to our location etc.
    type: {
      type: String, // Don't do `{ geometry : { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point' cause of enum only having one option.
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true, // Required is true
    },
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  author: {
    // So we can find a user who created this current campground.
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  // images: [{ url: String, filename: String }], // Before defining a separate schema this is what the images property looked like.
},opts);

campgroundSchema.virtual('properties.popUpMarkup').get(function() { // Obviously without adding this virtual this properties.popUpMarkup can also be added in the clusterMap file on the client side by looping through all the campgrounds before the unclustered click function. But this way is just simpler as we don't need to store this information in our mongoDB we can just add this information here as a virtual property.
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
  <p>${this.description.substring(0,20)}...</p>`
})

campgroundSchema.post("findOneAndDelete", async (campground) => {
  if (campground) {
    await Review.deleteMany({ _id: { $in: campground.reviews } });
  }
});

module.exports = new mongoose.model("Campground", campgroundSchema);
