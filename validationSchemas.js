const BaseJoi = require("joi"); // I'll use Joi for data validation in my when submitting a new campground or updating a existing campground.
const sanitizeHtml = require("sanitize-html")

const extension = (joi) => ({ // We had a cross-site-scripting vulnerablilty when it came to us embedding html in map title both cluster map and show page map so we are fixing it using an extension function that we wrote with the help of sanitizeHtml npm package.
  type: 'string',
  base: joi.string(),
  messages: {
      'string.escapeHTML': '{{#label}} must not include HTML!'
  },
  rules: {
      escapeHTML: {
          validate(value, helpers) {
              const clean = sanitizeHtml(value, {
                  allowedTags: [],
                  allowedAttributes: {},
              });
              if (clean !== value) return helpers.error('string.escapeHTML', { value })
              return clean;
          }
      }
  }
});

const Joi = BaseJoi.extend(extension); // So I can use Joi name down below without changing anything.



// Using Joi to make a schema which will help us to validate the data before we even attempt to save it to the actual database.
module.exports.campgroundSchema = Joi.object({
  // This says whatever you pass in this schema during the validation it must be a object and yes req.body is a object inside that object there must be another object by the name of campground that is required and within that campground object there must be these properties having these types and following these particular constraints.
  // Format inside Joi schema => (property name : Joi.typeThatPropertyNeedsToBe().additionalConstraints().
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
  }).required(),
  deleteImagesFilenames: Joi.array() // This allows the req.body to contain this array otherwise you won't be able to send this array from edit.ejs
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    body: Joi.string().required().escapeHTML(),
    rating: Joi.number().required().min(1).max(5),
  }).required(),
});
