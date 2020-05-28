const mongoose = require("mongoose"),
	  passportLocalMongoose = require("passport-local-mongoose");

let UserSchema = new mongoose.Schema(
	{
		username: {type: String, unique: true, required: true},
		password: String,
		firstName: String,
		lastName: String,
		email: {type: String, unique: true, required: true},
		image: String,
		bio: String,
		homeTown: String,
		favActivites: String,
		isAdmin: {type: Boolean, default: false},
		createdAt: {type: Date, default: Date.now},
		resetPasswordToken: String,
    resetPasswordExpires: Date

	}
);

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
