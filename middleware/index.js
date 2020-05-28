const Campground = require("../models/campground"),
	  locus = require('locus'),
	  Comment = require("../models/comment");

// all middleware goes here
let middlewareObj = {};

// function to check if user is logged in and if their ID matches the campground ID
middlewareObj.checkCampgroundOwnership = (req, res, next) => {
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, (err, foundCampground) => {
			// if no, redirect
			if (err) {
				req.flash("error", "Campground not found")
				res.redirect("back");
			} else {
				if (!foundCampground) {
					req.flash("error", "Item not found.")
					return res.redirect("back")
				}
				// if yes, do they own the campground?
				currentUser = req.user
				if(foundCampground.author.id.equals(req.user._id) || (currentUser && currentUser.isAdmin === true)){
					next();
				} else {
					req.flash("error", "You don't have permission to do that")
					res.redirect("back");
				}
			}
		});
	// if not, redierct
	} else {
		req.flash("error", "You need to be logged in to do that")
		res.redirect("back");
	}
}

// function to check if user is logged in and if their ID matches the comment ID
middlewareObj.checkCommentOwnership = (req, res, next) => {
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, (err, foundComment) => {
			// if no, redirect
			if (err) {
				console.log(err);
				req.flash("error", "Comment not found")
				res.redirect("back");
			} else {
				// if yes, do they own the comment?
				if(foundComment.author.id.equals(req.user._id) || (currentUser && currentUser.isAdmin === true)){
					next();
				} else {
					req.flash("error", "You don't have permission to do that")
					res.redirect("back");
				}
			}
		});
	// if not, redierct
	} else {
		req.flash("error", "You need to be logged in to do that.")
		res.redirect("back");
	}
};

// function to check if user is logged in and if their ID matches the campground ID
middlewareObj.checkUserOwnership = (req, res, next) => {
	if(req.isAuthenticated()){
		User.findById(req.params.id, (err, foundUser) => {
			// if no, redirect
			if (err) {
				req.flash("error", err.message)
				res.redirect("back");
			} else {
				if (!foundUser) {
					req.flash("error", err.message)
					return res.redirect("back")
				}
				// if yes, do they own the campground?
				currentUser = req.user
				if(foundUser._id.equals(req.user._id) || (currentUser && currentUser.isAdmin === true)){
					next();
				} else {
					req.flash("error", "You don't have permission to do that")
					res.redirect("/campgrounds");
				}
			}
		});
	// if not, redierct
	} else {
		req.flash("error", "You need to be logged in to do that")
		res.redirect("back");
	}
}


// function to check if user is logged in or not
middlewareObj.isLoggedIn = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to be logged in to do that.")
	res.redirect("/login");
};


middlewareObj.isAdmin = (req, res, next) => {
	if(req.user.isAdmin === true) {
		return next();
	}
	req.flash("error", "Admin permissions required")
	res.redirect("/campgrounds")
};

// exporting module
module.exports = middlewareObj;
