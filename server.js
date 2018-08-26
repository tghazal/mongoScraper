var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require('express-handlebars');
var request = require("request");


var dbArticle = require("./models/Article");
var dbNote = require("./models/Note");
var PORT = process.env.PORT || 3000;


var app = express();

//midlleware

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// HANDLEBARS
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");





app.post("/save",function(req,res){
var saveData={};
var title=req.body.title;
var summary=req.body.summary;
saveData.title=title;
saveData.summary=summary;
   dbArticle.create(saveData)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });

res.redirect("/scrape",)
})

app.get("/",function(req,res){

res.render("index")

})
app.get("/saved",function(req,res){
  dbArticle.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
     res.render("saved",{Article:dbArticle})
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });

})


app.get("/delete?:id", function(req, res) {
  // Remove a note using the objectID
  console.log("ffffffff"+req.query.id)
  console.log("id=========="+req.body.id)
 dbArticle.remove({ _id: req.query.id }, function(err) {
    if (!err) {
            res.redirect("/saved")
    }
    else {
      res.json(err);
    }
});

})




app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.nytimes.com/section/technology").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    var result = {};
    var data =[];
    console.log("hi")
    // Now, we grab every h2 within an article tag, and do the following:
    $("div.story-body").each(function (i, element) {
      //   // Save an empty result object 
      result={};
      console.log("hi")
      var title = $(element).find("h2.headline").text().trim();
      var summary = $(element).find("p.summary").text().trim();
      // console.log(title)
      // console.log(summary);
      result.title = title;
      result.summary = summary;
     // result.saved=false;
      
       data.push(result)
   

    });
  
    // If we were able to successfully scrape and save an Article, send a message to the client
   res.render("index",{Article:data})
  });
});

//connect mongoos
// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});



