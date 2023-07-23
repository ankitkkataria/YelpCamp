const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  const newReview = new Review(req.body.review);
  // If you get till this point that means you're logged in for sure now we will just go ahead and associate the user to posted this review with this review.
  newReview.author = req.user._id;
  campground.reviews.push(newReview);
  await campground.save(); // If i add await in front of both of them then they will be saved sequentially but right now they will be saved parallelly.
  await newReview.save(); // See if you have to use the saved result here immediately let's say for campground in that case adding a await makes sense but if you're not using it then you don't need to make these saves sequential.
  req.flash("success", "Successfully created a new review!");
  res.redirect(`/campgrounds/${id}`); // Can not awaiting both those above lines cause an error.
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // What the pull operator does is from array reviews it pulls/deletes all the occurences of reviewId.
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Deleted review successfully!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.renderEditReviewForm = async (req, res) => {
  const { id, reviewId } = req.params;
  const campground = await Campground.findById(id).populate("reviews");
  const foundReview = await Review.findById(reviewId);
  console.log(foundReview); // Incase you bookmark the review editing page and then that review is deleted then foundReview will become null and the code when their is no review will be executed in the ejs file so you don't need to put and flash message here.
  res.render("campgrounds/show", { campground, foundReview });
}

module.exports.updateReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Review.findByIdAndUpdate(reviewId, req.body.review);
  const review = await Review.findById(reviewId);
  /*
  Down below is what I was doing previously it's stupid I know but still let's just keep it here.
  const campground = await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // What the pull operator does is from array reviews it pulls/deletes all the occurences of reviewId.
  await Review.findByIdAndDelete(reviewId);
  const updatedReview = new Review(req.body.review);
  campground.reviews.push(updatedReview);
  await campground.save();
  await review.save();
  */
  req.flash("success", "Updated review successfully!");
  res.redirect(`/campgrounds/${id}`);
}