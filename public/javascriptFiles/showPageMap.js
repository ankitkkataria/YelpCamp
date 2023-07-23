// const campground = require("../../models/campground"); // This line sometimes automatically gets added as our editor thinks this is some backend code and it sees a symbol that's undefined which is campground but it doesn't know oh! they might be sending this campground from a file called show.ejs (which is nothing but an backend file.). This line can lead to a lot of wasted time if not spotted earlier as it's something you don't even add yourself so just keep that in mind okay.

mapboxgl.accessToken = mapboxToken;
// console.log('This is the mapboxToken here');
// console.log(mapboxToken);
const map = new mapboxgl.Map({
  container: "map", // container ID
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: campground.geometry.coordinates, // starting position [lng, lat]
  zoom: 10, // starting zoom
});

// Add zoom and rotation controls to the map
map.addControl(new mapboxgl.NavigationControl());

// Your ejs is compiled and all the things are substituted before the page even loads.
// But scrips only run on the browser they are not compiled initially before the page loads.

new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h6>${campground.title}</h6><p>${campground.location}</p>`
    )
  )
  .addTo(map); // map here refers to the variable in line 4 which says this is the map to which I would like to add a marker to.
