//scraping tools
var request = require("request");
var cheerio = require("cheerio");
var methodOverride = require("method-override");
var Article = require('../models/Article')
var Note = require('../models/Note')

module.exports = function(router) {

	router.get("/", function(req, res){
		Article.find({
			saved: false
		}, function(err, doc) {
		if (err) {
			res.send(err);
		}

		else{
			res.render("home", {article: doc} );
		}
	});
});

	// This route renders the saved handledbars page
  router.get("/saved", function(req, res) {
	  	// res.json('route hit')
	  	 Article.find({saved: true}).populate('notes', 'body').exec(function(err, doc) {
	    if (err) {
	      res.send(err);
	    }
	    else {
	      res.render("saved", {saved: doc});
	    }
  	});
  });

  router.get('/scrape', function(req, res){	
  request("http://www.azcentral.com/", function(error, response, html) {
    var $ = cheerio.load(html);
    $("h1.shpm-section-header").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");


      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.redirect("/");
  })

  // route to updated the article to be saved
  router.post("/saved/:id", function(req, res) {
	  Article.update({_id: req.params.id}, {$set: {saved: true}}, function(err, doc) {
	    if (err) {
	      res.send(err);
	    }
	    else {
	      res.redirect("/");
	    }
	  });
	});

	//delete route for articles
	router.post("/delete/:id", function(req, res){
		 Article.update({_id: req.params.id}, {$set: {saved: false}}, function(err, doc) {
	    if (err) {
	      res.send(err);
	    }
	    else {
	      res.redirect("/saved");
	    }
	  });
	})

	//post route for saving a note 
	router.post("/saved/notes/:id", function(req, res) {
	  var newNote = new Note(req.body);
	  console.log("new note" + newNote);
	  newNote.save(function(error, doc) {
	    if (error) {
	      res.send(error);
	    }
	    else {
	      Article.findOneAndUpdate({_id: req.params.id}, { $push: { "notes": doc._id } }, { new: true }).exec(function(err, newdoc) {
	        if (err) {
	          res.send(err);
	        }
	        else {
	          res.redirect("/saved");
	        }
	      });
	    }
	  });
	});

	// delete route to delete notes
	router.post("/saved/delete/:id", function(req, res) {
	  Note.remove({_id: req.params.id}, function(err, doc){
	    if (err) {
	      res.send(err);
	    }
	    else {
	      res.redirect("/saved");
	    }
	  });
	});
}