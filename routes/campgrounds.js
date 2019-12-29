var express = require("express");
var router = express.Router();
var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");
// middleware/index.js is actually where the methods are. But index.js is automatically used when using require.
var middleware = require("../middleware");

router.get("/", function(req, res){
    // Displays a list of all campgrounds
    // Retrieve all campgrounds from the db
    Campground.find({}, function(err, campgrounds){
        // campgrounds array of all campground objects.
        if(err){
            console.log(err);
        } else{
            res.render("campgrounds/index.ejs", {campgrounds: campgrounds});
        }
    })
});

router.post("/", middleware.isLoggedIn, function(req, res){
    // Adds the new campground.
    // Form on /campgrounds/new sends campground name as name, and the image url as image.
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {author: author, price: req.body.price, name: req.body.name, image: req.body.image, description: req.body.description};
    // Use Campground.create() to save newCampground to new database.
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else{
            // if no error, newCampground was successfully added to the db.
            res.redirect("/campgrounds");
            console.log(newlyCreated);
        }
    });
});

router.get("/new", middleware.isLoggedIn, function(req, res){
    // Page with form to create a new campground.
    res.render("campgrounds/new.ejs");
});

// NOTE THAT /:id MATCHES ANYTHING AFTER campgrounds/... THIS ROUTE MUST COME LAST BECAUSE OF THIS
router.get("/:id", function(req, res){
    // Displays info about the campground with a matching id.
    // First find the campground with the provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else{
            res.render("campgrounds/show.ejs", {campground: foundCampground});
        }
    });
});

// EDIT ROUTE - get request to show edit form
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit.ejs", {campground: foundCampground});
    });
});

// UPDATE ROUTE - put request to edit campground.
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err) res.redirect("/campgrounds");
        else{
            // Following comments to update author info. (Was used to add authors to old campgrounds which did not have an author)
            // updatedCampground.author.id = req.user._id;
            // updatedCampground.author.username = req.user.username;
            // updatedCampground.save();
            req.flash("success", "Campground Edited.")
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DESTROY ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err) res.redirect("/campgrounds");
        else{
            // Delete all comments associated with the foundCampground first.
            foundCampground.comments.forEach(function(comment){
                Comment.findByIdAndRemove(comment._id, function(err){
                    if(err) console.log(err);
                });
            });
            // Then delete the campground.
            Campground.findByIdAndRemove(req.params.id, function(err){
                if(err) res.redirect("/campgrounds");
                else{
                    req.flash("success", "Campground deleted.");
                    res.redirect("/campgrounds");
                }
            });
        }
    });
});

module.exports = router;