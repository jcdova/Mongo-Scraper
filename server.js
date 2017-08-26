//require dependencies
var express = require('express')
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var logger = require("morgan");

//require our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var methodOverride = require("method-override");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

//initialize express
var app = express()
var PORT = process.env.PORT || 8080;

// Set up an Express Router
var router = express.Router();

// Require our routes file pass our router object
require("./routes/routes")(router);

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Have every request go through our router middleware
app.use(router);

// Database configuration with mongoose
// mongoose.connect("mongodb://localhost/mongo-scraper", {
//   useMongoClient: true
// });

mongoose.connect("mongodb://heroku_68q4cb3q:jlcmlc08@ds161493.mlab.com:61493/heroku_68q4cb3q", {
  useMongoClient: true
});

// mongoose.connect("mongodb://heroku_5zzxjlhw:5nuph8s8jngoo5h76edkvi5a4@ds149433.mlab.com:49433/heroku_5zzxjlhw", {
// useMongoClient: true
// });

var db = mongoose.connection;

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});



// Listen on port 8080
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
});
