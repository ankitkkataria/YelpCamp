// Requiring Express Router
const express = require("express");
const router = express.Router();

// Requiring Utilities
const catchAsync = require("../utils/catchAsync");

// Requiring Passport
const passport = require("passport");

// Requiring storeReturnTo Middleware
const { storeReturnTo } = require("../middleware");

// Requiring Users Controller
const users = require("../controllers/usersController");

// Register Path
router
  .route("/register")
  .get(users.renderRegisterUserForm) // Render Register-User Form
  .post(catchAsync(users.registerUser)); // Register User Route

// Login Path
router
  .route("/login") // Render Login-User Form
  .get(users.renderLoginUserForm)
  .post( // Login and Redirection Route
    storeReturnTo, // Use the storeReturnTo middleware to save the returnTo value from session to res.locals
    passport.authenticate("local", { // passport.authenticate logs the user in and clears req.session
      failureFlash: true,
      failureRedirect: "login",
    }),
    // Now at this point we can use res.locals.returnTo to redirect the user after login which we will do in the function below.
    users.redirectToAPage // This just takes you either to campground if you weren't redirected to login page otherwise after login it takes you to the page you were redirected from.
  );

// Logout User Route
router.get("/logout", users.logout);

module.exports = router;
