var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String
});

// Provides User.authenticate, and .serialize and .deserialize.
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);