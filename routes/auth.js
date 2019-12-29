var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/users");

// Show register form
router.get("/register", function(req, res){
    res.render("auth/register.ejs");
});

// Handle register request
router.post("/register", function(req, res){
    // Use passport to create a new user in the User db.
    var newUser = new User({username: req.body.username})
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            return res.render("auth/register.ejs", {"error": err.message});
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp, " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

// Show login form
router.get("/login", function(req, res){
    res.render("auth/login.ejs");
});

// Handle login request, using the passport.authenticate middleware. This will read the data in the request's body for
// both username and password, and determine if the password is correct or not, then follow the appropriate redirect path.
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }
), function(req, res){
    // nothing needed in callback at the moment.
});

// Logout route
router.get("/logout", function(req, res){
    // req.logout method from passport.
    req.logout();
    req.flash("success", "You logged out!");
    res.redirect("back");
});

module.exports = router;