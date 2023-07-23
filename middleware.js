// Requiring Joi Validation Schema
const { campgroundSchema, reviewSchema } = require("./validationSchemas"); // So i can use it to validate my post and put routes for my campgrounds here.
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  // console.log("REQ.USER...", req.user); // Bcz of passport every request just like isAuthenticated has another method that is set to undefined if the user is not logged in otherwise if he is loggedin in that case it will contain information about the user that has logged in. (Behind the scenes it must work like we did when we were implementing the user authentication from scratch like after login our session object might have a user_id property using which you can fetch the user object.) also req.user doesn't show hash or salt only the username and email in our case also we can use it to selectively display logout if a user is logged in and hide the login,register button and vice-versa.
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; // req.path would return /new (what the router uses after the prefix removal) and req.originalUrl returns campgrounds/new so, here if we were not logged in when this isLoggedIn middleware was called in that case it would store the req.originalUrl on that req so we can take that out after our login and go back to the page from where we were redrirected to login.
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next(); // Always always remember next();
};

// Validation Middleware
// Setting up my custom middleware function that will use Joi to validate the campground whereever needed.
module.exports.validateCampground = (req, res, next) => {
  // After building the schema this line below is used to run the validation code on the req.body object.
  // const result = campgroundSchema.validate(req.body); // It will return you an result that will contain a error object that will be defined if a error is generated if any of the property doesn't follow any of the specified constraints but if everything is valid in that case the value of the error property will be left undefined and the if condition if(error) will surely fail.
  // console.log(result);
  // console.dir(result.error.details);
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    // This line below takes the details array of objects in the error object and makes a new array containing all the messages present in that details array if there are more than one errors using the map operator and then joins all those messages using (,) and returns it.
    const allErrorMessages = error.details.map((ele) => ele.message).join(","); // Here ele is a element which is nothing but a object of the details array and this join will help us return a string of all the elements in the new mapped array that we formed out of all the messages.
    throw new ExpressError(allErrorMessages, 400);
  } else {
    next(); // If there is no error just go ahead and call the next middleware function that will go ahead and try to add a new campground or edit an existing campground.
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const allErrorMessages = error.details.map((ele) => ele.message).join(",");
    throw new ExpressError(allErrorMessages, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    // Incase someone bookmarked a campground and then that campground is deleted when that bookmark is then accessed at some point of time a weird looking error is generated there we can rather show a flash message.
    req.flash("error", "Campground no longer exists!");
    return res.redirect("/campgrounds");
  }
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    // Incase someone bookmarked a review editing page and then that review is deleted when that bookmark is then accessed at some point of time a weird looking error is generated there we can rather show a flash message.
    req.flash("error", "Review no longer exists!");
    return res.redirect("/campgrounds");
  }
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
