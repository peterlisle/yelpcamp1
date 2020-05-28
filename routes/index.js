const 	passport 	= require("passport"),
				express 	= require("express"),
	  		router 		= express.Router({mergeParams: true}),
	  		User 			= require("../models/user");


// LADNING PAGE ROUTE
router.get("/", (req, res) => {
	res.render("landing");
});

// LEAVENOTRACE ROUTE
router.get("/leavenotrace", async (req, res) => {
	res.render("info/leave_no_trace")
});

//SHOW LOGIN FORM
router.get("/login", (req, res) =>{
	res.render("login");
});

//LOGIN LOGIC ROUTE
router.post("/login", passport.authenticate("local",
		{
			successRedirect: "/campgrounds",
			failureRedirect: "/login",
			failureFlash: true
		}), (req, res) => {
});

//LOGOUT ROUTE
router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "Logged you out")
	res.redirect("/campgrounds")
});

module.exports = router;
