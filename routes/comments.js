const 	express 		= require("express"),
	  		router 			= express.Router({mergeParams: true})
				Campground 	= require("../models/campground"),
				middleware 	= require("../middleware"),
				Comment 		= require("../models/comment");


// CREATE COMMENT - OK
//===================================================
router.post("/", middleware.isLoggedIn, async (req, res) => {
	req.body.comment.text = req.sanitize(req.body.comment.text);
	// lookup campground by ID
	let campground = await Campground.findById(req.params.id)

	// error handling if campground doesn't exist
	if (!campground) {
		req.flash("error", "Item not found.")
		return res.redirect("back")
	}

	// creating new comment
	let comment = await Comment.create(req.body.comment)
		// add username and id to comment and save
		comment.author.id = req.user._id;
		comment.author.username = req.user.username
		comment.save();

	// push comment into comments on the campground and save
	campground.comments.push(comment);
	campground.save();

	// success messaging to user
	req.flash("success", "Successfully added a comment")
	return res.redirect("/campgrounds/" + campground._id);
});

// EDIT COMMENT ROUTE - OK
//===================================================
router.get("/:comment_id/edit", middleware.checkCommentOwnership, async (req, res) => {
	// finding the comment
	let foundComment = await Comment.findById(req.params.comment_id);

	// error handling if it doesn't exist
	if (!foundComment) {
		req.flash("error", "Item not found.");
		return res.redirect("back");
	}

	// sending user to the edit comment page
	return res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
});

// UPDATE COMMENT ROUTE - OK
//===================================================
router.put("/:comment_id", middleware.checkCommentOwnership, async (req, res) => {
	req.body.comment.text = req.sanitize(req.body.comment.text);
	// finding and updating the comment with params from form submission
	let updatedComment = await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);

	// alert success and redirect back to the show page
	req.flash("success", "Successfully edited a comment")
	return res.redirect("/campgrounds/" + req.params.id);
});

// DESTROY COMMENT ROUTE - OK
//===================================================
router.delete("/:comment_id", middleware.checkCommentOwnership, async (req, res) => {
	await Comment.findByIdAndRemove(req.params.comment_id)
	req.flash("success", "Comment deleted");
	res.redirect("/campgrounds/" + req.params.id);
});

module.exports = router;
