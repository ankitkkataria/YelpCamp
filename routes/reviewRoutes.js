// Requiring Express Router
const express = require("express");
const router = express.Router({ mergeParams: true });

// Requiring Utilities
const catchAsync = require("../utils/catchAsync");

// Requiring validateReview and isLoggedIn middleware
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

// Requiring Reviews Controller
const reviews = require("../controllers/reviewsController");

// Create-Review Route
router.post(
  "/",
  isLoggedIn, // Just hidding the form is not enough as someone might be able to circumvent that through postman in creating a review.
  validateReview,
  catchAsync(reviews.createReview)
);

// Render Edit-Review Form Route
router.get("/:reviewId/edit", catchAsync(reviews.renderEditReviewForm));

// :reviewId Path
router
  .route("/:reviewId")
  .put( // Update-Review Route
    catchAsync(reviews.updateReview) // For Updating a review what i was doing was first i would pull out the review with that id from this campground's review's array then I would go ahead find and delete the review from the reviews collection then finally i would make a new review with a brand new id and push it in the reviews array of this campground and render the page again but the problem with that was my new updated review would go to the end of the list so my new method works by just updating the data in the review object only in the reviews collection and not tempering with the objectId in the reviews array in campground object at all.
  )
  .delete( // Delete-Review Route
    isLoggedIn, // Just hiding the buttons is not enough.
    isReviewAuthor, // This will make sure that only the person who created the review can send a request to delete the review even through postman you can make sure this works by removing the logic that hides the edit and delete buttons from your reviews on your campground show page.
    catchAsync(reviews.deleteReview)
  );

module.exports = router;
