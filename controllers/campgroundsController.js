// So the term controller comes from MVC, which is a pattern MVC model view controller frameworks, or it's just an approach to structuring applications.
// You know, we've been using models, the term models, we have a model directory, we've been using views, right?. So we can set up controllers as well.
// In general, the concept is that you put all of your data heavy stuff here, your modeling of the data in the models,
// You put all of your view content, the layouts, everything a user sees in views and then
// Controllers is where you really structure everything. It's kind of the heart of your application. It's where all the main logic happens that where you're rendering views and you're working with models.

const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary"); // Bcz we want to delete the images from our cloudinary cloud storage too not just from mongoDB (Also remember this is not cloudinary package rather it's the local instance that we formed of it in our cloudinary folder with our credentials).
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); // Cause we want to convert the location the user enters and store it's lattitude/longitude in our database.
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find();
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  // Putting isLoggedIn here only protect the form route someone can still send this information with the correct fields if they want and if we have left the post route for campgrounds left unprotected they can make as many campgrounds as they want so we will add this isLoggedIn middlware over there too similar logic for edit and put route too.
  // INSTEAD OF PUTTING THIS CODE IN EVERY SINGLE PATH WE WANT TO PROTECT WE JUST PUT THE CODE INSIDE A MIDDLEWARE.JS FILE.
  // if (!req.isAuthenticated()) {
  //   req.flash("error", "You must be signed in first!");
  //   return res.redirect("/login");
  // }
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res) => {
  // You're using client side validation using bootstrap which means it won't allow you to submit the form with fields missing from the form.
  // But it's still possible to do it using postman/axios or something.
  // So, One way is to use required in mongoose schema itself.
  // Otherway could be like
  // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); // This will only save us from cases where campground key is not present in the post request we're not making sure if campground itself is a object to begin with so it's still possible to fool this method but just naming something campground but this is just to show the concept of things that can be done.

  // Just a hardcoded example of how we can find longitude and lattitude for a location using forwardGeocode.
  // const geoData = await geocoder.forwardGeocode({
  //   query:'Yosemite,CA',
  //   limit : 1
  // }).send()
  // console.log(geoData.body.features[0].geometry.coordinates);

  const geoData = await geocoder.forwardGeocode({ // I'm not going to allow the campground to change it's location so I'm not adding this capability when you edit the campground.
    query: req.body.campground.location,
    limit: 1
  }).send()

  const camp = new Campground(req.body.campground); 
  camp.geometry = geoData.body.features[0].geometry; // (geoData.body.features[0].geometry returns geoJSON compatible object like geometry: {type : 'Point', coordinates: [-122.2342, 32.3402]})}
  camp.images = req.files.map((file) => { // This is so we can upload images that we get from our new form and show them on show page here we will store the filename and url of the files that we uploaded to cloudinary. (This will make us an array of objects each containing url & filename)
    return { url: file.path, filename: file.filename };
  });
  // Easier way of doing the above thing in one line is using implicit return req.files.map(file => ({ url: file.path, filename: file.filename }))
  // Since to get to this point we have to be logged in that means due to passport middleware we have access to req.user and with that we can store the author id of the currently logged in user who is making this campground in this campground before saving it. (So, when going to it's show page I can have it's id here using which I can show the username on the show page)
  camp.author = req.user._id;
  await camp.save();
  console.log(camp);
  req.flash("success", "Successfully created a new campground!"); 
  res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      // What this does is it populates the reviews on this campground and within each review it goes ahead and populates the author too that gives us access to the username so we can show it on each review.
      path: "reviews",
      populate: {
        path: "author", // Instead of populating the entire user here you could have also went down the path of just storing the username here itself too if that's the only thing we will use here but that's a choice only you can make.
      },
    })
    .populate("author"); // We want to populate the author too if we want to show the username too. (One more random thing you can't do .populate('reviews','author')) you have to chain them separetely like we did here.
  // console.log(campground); // I added this just to check if everything like author was populated properly.
  if (!campground) {
    // Incase someone bookmarked a campground and then that campground is deleted when that bookmark is then accessed at some point of time a weird looking error is generated there we can rather show a flash message.
    req.flash("error", "Campground no longer exists!");
    res.redirect("/campgrounds");
  }
  const foundReview = 0;
  res.render("campgrounds/show", { campground, foundReview });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  // This functionality down below is now taken care of by isAuthor middleware.
  // if (!campground) {
  // Incase someone bookmarked a campground and then that campground is deleted when that bookmark is then accessed at some point of time a weird looking error is generated there we can rather show a flash message.
  //   req.flash("error", "Campground no longer exists!");
  //   res.redirect("/campgrounds");
  // }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  // THIS CODE BELOW CHECKS IF THE PERSON THAT'S TRYING TO SEND THIS REQUEST IS ALSO THE SAME PERSON WHO IS THE AUTHOR OF THIS CAMPGROUND (NOW YOU CAN EITHER REPEAT THIS CODE IN DELETE AND /EDIT PATH OR JUST MAKE A FUNCTION OUT OF IT (THAT'S WHAT WE WILL DO.))
  // const campground = await Campground.findById(id);
  // if(!campground.author.equals(req.user._id)) {
  //   req.flash('error','You do not have permission to do that!');
  //   return res.redirect(`/campgrounds/${id}`);
  // }
  // console.log(req.body.deleteImagesFilenames); // Now you have access to the deleteImagesFilenames array.
  const updatedCampground = await Campground.findByIdAndUpdate(
    id,
    req.body.campground,
    { new: true, runvalidators: true }
  ); // You could also have used {...req.body.campground} as second arg.

  // Getting the image's filename & path out so we can store it in MongoDB.
  const images = req.files.map((file) => {
    // This is so we can upload images that we get from our new form and show them on show page here we will store the filename and url of the files that we uploaded to cloudinary. (This will make us an array of objects each containing url & filename)
    return { url: file.path, filename: file.filename };
  });
  updatedCampground.images.push(...images); // Because we're editing we need to push rather then re-assigning and images here is the array of objects containing filename & url.
  await updatedCampground.save(); // Saving here is extremely important I was not doing it which lead to the situation of my images being uploaded to cloudinary but won't get stored on my page so here we after pushing also save. On top of that we don't need to update this campground in two steps first the text and then the images but we're just doing it for simplicity sake.
  if (req.body.deleteImagesFilenames) {
    // If there are any filenames in this array that means the user wants to delete some images.
    // Deleting files from cloudinary cloud.
    for (let filename of req.body.deleteImagesFilenames) {
      await cloudinary.uploader.destroy(filename);
    }
    // Deleting thier tracks from MongoDB as well.
    await updatedCampground.updateOne({
      // This will automatically save there is no need to expilicitly save this also we are doing this cause we want to delete the enteries from mongoDB. Also updateOne cause we're updating a single array.
      $pull: { images: { filename: { $in: req.body.deleteImagesFilenames } } }, // I wasted a lot of time here I had forgot to but $ symbol in front of pull idk why the hell that's allowed syntactically.
    });
  }
  req.flash("success", "Updated campground  successfully!");
  res.redirect(`/campgrounds/${updatedCampground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Deleted campground successfully!");
  res.redirect("/campgrounds");
};
