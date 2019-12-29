var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    seedDB          = require("./seeds"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    flash           = require("connect-flash");
    // DB SCHEMAS
    User = require("./models/users"),
    Campground = require("./models/campgrounds"),
    Comment = require("./models/comments");

// ROUTES
var campgroundRoutes    = require("./routes/campgrounds"),
    authRoutes          = require("./routes/auth");
    commentRoutes       = require("./routes/comments"),

// Connect CSS and front end JS
app.use(express.static(__dirname + "/public"));

// Mongoose set up.
mongoose.set("useUnifiedTopology", true);
mongoose.set("useNewUrlParser", true);
mongoose.connect('mongodb://localhost:27017/yelp_camp');

// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "This string is used to hash the session details.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// seedDB();

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());

// Middleware that applies to every single http request. Feeds in req.user as currentUser variable to every ejs file.
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
app.locals.moment = require("moment");

// =============================
// HOME PAGE ROUTE
// =============================
app.get("/", function(req, res){
    res.render("landing.ejs");
});

// OTHER ROUTES
app.use("/", authRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

app.listen(3000, function() { 
    console.log('YelpCamp Server started on port 3000'); 
  });