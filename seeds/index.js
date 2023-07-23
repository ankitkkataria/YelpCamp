const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground"); // .. means one level above since models folder is not here.

mongoose
  .connect("mongodb://127.0.0.1:27017/yelpCamp")
  .then(() => {
    console.log("Successfully connected to the database specified above");
  })
  .catch((err) => {
    console.log(
      "Oh! no you got a error connecting to the database specified above"
    );
    console.log(err);
  });

const randomElementFromArray = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
  // This function will make 300 enteries in your database with random names and random places.
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 30) + 10;
    const camp = new Campground({
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        // Just hardcoding some coordinates on every campground so atleast I can show some marker even if it's correct or not that doesn't matter as of yet.
        type: "Point",
        coordinates: [
          // This is me storing the geometry information for every campground directly from our seed data otherwise you'd have to geocode your entire data everytime you reseed your data.
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      title: `${randomElementFromArray(descriptors)} ${randomElementFromArray(
        places
      )}`,
      images: [
        {
          url: "https://res.cloudinary.com/dnttigdlc/image/upload/v1689287215/YelpCamp/m6mxumocebno3llifhrx.jpg",
          filename: "YelpCamp/m6mxumocebno3llifhrx",
        },
        {
          url: "https://res.cloudinary.com/dnttigdlc/image/upload/v1689287223/YelpCamp/c0bfygxb7aygyoybjvpc.png",
          filename: "YelpCamp/c0bfygxb7aygyoybjvpc",
        },
      ],
      description:
        "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Architecto, sed delectus vel aliquid temporibus sit quam accusantium sapiente vero ducimus animi necessitatibus. Dignissimos maiores accusamus ab quam eveniet, explicabo minima.",
      price: price,
      author: "64ad1a20268e90f66ac91c52", // Just putting in a random user as a author and reseeding the random campgrounds. (We're doing this cause when adding a new campground we will add the user who is signed in currently to that campground (if they are not signed in they won't even be able to make a campground)) and if we don't add a user to already existing ones when we go to show their name of the show page it will break things or for some we will so username and for some we won't that will make things look a bit inconsistant.
    });
    await camp.save();
  }
};

// Calling seedDB
seedDB() // All async functions automatically return Promises. If you declare a function as async, it will return a Promise, even if your only return value is a simple value like a string or number. If you don't return explicitly, your async function will still return a Promise with a value of undefined.
  .then(() => {
    mongoose.connection.close(); // Closing the database connection after seeding is a good practice to ensure that the program terminates cleanly and does not leave any open connections to the database. In this case, it's just a small seed script, that will end and get us back to the system terminal after the database connection is properly closed. In larger applications or web servers that continuously run and interact with the database, leaving open connections can cause issues like performance problems, so it's good to close the database connection when it's not needed anymore.
  });


