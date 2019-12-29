var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");
var middleware = require("../middleware");

// NEW COMMENT ROUTE
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err) console.log(err);
        else res.render("comments/new.ejs", {campground: campground});
    });
});

// POST NEW COMMENT ROUTE
router.post("/", middleware.isLoggedIn, function(req, res){
    // find campground by id.
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/");
        }
        else{
            // Create new comment in db, and link it to campground db.
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong.");
                    console.log(err);
                }
                else{
                    // add username and id of user to the comment, and save comment.
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    // redirect to show page.
                    req.flash("success", "Successfully added your comment.");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

// EDIT COMMENT ROUTE - campground id is in base route.
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err) res.redirect("back");
        else res.render("comments/edit.ejs", {campground_id: req.params.id, comment: foundComment});
    });
});

// UPDATE COMMENT ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err) res.redirect("back");
        else{
            req.flash("success", "Comment edited.")
            res.redirect("/campgrounds/" + req.params.id);
        }   
    });
});

// DESTROY COMMENT ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err) res.redirect("back");
        else{
            req.flash("success", "Comment deleted.");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;
