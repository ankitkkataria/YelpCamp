const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, // https://stackoverflow.com/questions/62366192/the-unique-option-is-not-a-validator-in-mongoose/62367059#62367059
  },
});

userSchema.plugin(passportLocalMongoose); // This is going to add on a field for username and a field for password to our userSchema it's gonna make sure that those usernames are unique it's also going to give us some extra methods that we can use. // You can read more about it on the docs.

module.exports = mongoose.model('User',userSchema);

// From passport-mongoose-local docs (Read to usag portion after plugin line you'll see the sentence written below)
// You're free to define your User how you like. Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value.
// Additionally, Passport-Local Mongoose adds some methods to your Schema.
// These additional methods are like register(),serializeUser(),deserializeUser() etc.