const cloudinary 	= require('cloudinary'),
			nodemailer 	= require("nodemailer"),
			middleware 	= require("../middleware"),
			express 		= require("express"),
			Comment 		= require("../models/comment"),
			router 			= express.Router({mergeParams: true})
			crypto 			= require("crypto"),
			multer 			= require('multer'),
			async 			= require("async"),
			User 				= require("../models/user");

// MULTER CONFIG
	let storage = multer.diskStorage({
	  	filename: function(req, file, callback) {
			callback(null, Date.now() + file.originalname);
	  	}
	});
	let imageFilter = function (req, file, cb) {
		// accept image files only
		if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
			return cb(new Error('Only image files are allowed!'), false);
		}
		cb(null, true);
	};
	let upload = multer({ storage: storage, fileFilter: imageFilter})

// CLOUDINARY
cloudinary.config({
  	cloud_name: 'dckibiawc',
  	api_key: 789593126451718,
  	api_secret: process.env.CLOUDINARY_API_SECRET
});

//============================================================
// INDEX ROUTE
//============================================================
router.get("/users", middleware.isLoggedIn, middleware.isAdmin, async (req, res) => {
	try {
		let foundUsers = await User.find({});
		return res.render("users/index", {users: foundUsers});
	} catch(err) {
		req.flash("error", err.message);
		res.redirect("back");
	}
});

//============================================================
// FORGOT PASSWORD ROUTE (EDIT)
//============================================================
router.get("/users/forgot", async (req, res) => {
	res.render("users/forgot")
});

//============================================================
// FORGOT PASSWORD ROUTE - GENERATE TOKEN AND SEND EMAIL
//============================================================
router.post('/users/forgot', function(req, res, next) {
	async.waterfall([
  	function(done) {
    		crypto.randomBytes(20, function(err, buf) {
      	var token = buf.toString('hex');
      	done(err, token);
    		});
  	},
		function(token, done) {
	  	User.findOne({ email: req.body.email }, function(err, user) {
				if (!user) {
					req.flash('error', 'No account with that email address exists.');
					return res.redirect('/users/forgot');
				}

				// assigning password token and expiration date to user in database and saving
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
				user.save(function(err) {
		  		done(err, token, user);
				});
			});
		},
  	function(token, user, done) {
    	var smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
				  user: 'wholeearth857@gmail.com',
				  pass: process.env.GMAILPW
				}
    	});
			var mailOptions = {
				to: user.email,
				from: 'wholeearth857@gmail.com',
				subject: 'YelpCamp Password Reset',
				text: 'It looks like you (or someone else) requested a reset link for your YelpCamp account.\n\n' +
				  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
				  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
				  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			smtpTransport.sendMail(mailOptions, function(err) {
				console.log('mail sent');
				req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
				done(err, 'done');
			});
  	}
	], function(err) {
	if (err) return next(err);
	res.redirect('/users/forgot');
	});
});

//============================================================
// FORGOT PASSWORD ROUTE - RENDER THE EDIT PASSWORD PAGE
//============================================================
router.get('/reset/:token', async (req, res) => {
	try {
		let user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
		if (!user) {
			req.flash('error', 'Password reset token is invalid or has expired.');
			return res.redirect('/users/forgot');
		}
		res.render('users/reset', {token: req.params.token});
	} catch(err){
		req.flash("error", err.message);
		return res.redirect("back");
	}
});

//============================================================
// FORGOT PASSWORD ROUTE - POST NEW PASSWORD
//============================================================
router.post('/reset/:token', function(req, res) {
	async.waterfall([
  	function(done) {
    	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
				if (!user) {
					req.flash('error', 'Password reset token is invalid or has expired.');
					return res.redirect('back');
				}
				if(req.body.password === req.body.confirm) {
					user.setPassword(req.body.password, function(err) {
					user.resetPasswordToken = undefined;
					user.resetPasswordExpires = undefined;
					user.save(function(err) {
						req.logIn(user, function(err) {
							done(err, user);
						});
					});
				})
			} else {
				req.flash("error", "Passwords do not match.");
				return res.redirect('back');
      	}
    	});
  	},
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
				  user: 'wholeearth857@gmail.com',
				  pass: process.env.GMAILPW
	       }
	     });
      var mailOptions = {
				to: user.email,
				from: 'wholeearth857@gmail.com',
				subject: 'Mischief managed',
				text: 'Hello,\n\n' +
				  'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
		 	};
      smtpTransport.sendMail(mailOptions, function(err) {
				req.flash('success', 'Success! Your password has been changed.');
				done(err);
     	});
    }
	], function(err) {
    	res.redirect('/campgrounds');
  });
});


//============================================================
// USER PROFILE PAGE - SHOW
//============================================================
router.get("/users/:id", middleware.isLoggedIn, async (req, res) => {
	try {
		let foundUser = await User.findById(req.params.id);
		let campgrounds = await Campground.find().where("author.id").equals(foundUser._id);
		res.render("users/show", {user: foundUser, campgrounds: campgrounds});
	} catch(err) {
		req.flash("error", err.message);
		return res.redirect("back");
	}
});

//============================================================
// USER - NEW
//============================================================
router.get("/register", (req, res) => {
	res.render("users/register");
});

//============================================================
// USER - CREATE
//============================================================
router.post("/register", upload.single("image"), async (req, res) => {
	try{
		let imageObject = await cloudinary.uploader.upload(req.file.path);
		req.body.image = imageObject["secure_url"]
		let newUser = new User(
			{
				username: req.body.username,
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				email: req.body.email,
				image: req.body.image,
				bio: req.sanitize(req.body.bio),
				homeTown: req.body.hometown,
				image: req.body.image
			}
		);
		if(req.body.adminCode === process.env.SECRET_ADMIN_CODE) {
			newUser.isAdmin = true;
		}
		let user = await User.register(newUser, req.body.password)
		await	passport.authenticate("local")(req, res, () => {
			req.flash("success", "Welcome to YelpCamp " + user.username)
			res.redirect("/campgrounds");
		});
	} catch(err) {
		req.flash("error", err.message);
		return res.redirect("back");
	}
});

//============================================================
// USER - EDIT PROFILE
//============================================================
router.get("/users/:id/edit", middleware.checkUserOwnership, async (req, res) => {
	try {
		let foundUser = await User.findById(req.params.id);
		return res.render("users/edit", {user: foundUser});
	} catch(err) {
		req.flash("error", err.message);
		res.redirect("back");
	}
});

//============================================================
// USER - UPDATE PROFILE
//============================================================
router.put("/users/:id", middleware.checkUserOwnership, upload.single("image"), async (req, res) => {
	try{
		let imageObject = await cloudinary.uploader.upload(req.file.path);
		req.body.user.image = imageObject.secure_url;
		req.body.user.bio = req.sanitize(req.body.user.bio);

		// find and update the user
		await User.findByIdAndUpdate(req.params.id, req.body.user)

		// redirect back to show page
		req.flash("success", "Edits complete");
		res.redirect("/users/" + currentUser._id)
	} catch(err) {
		req.flash("error", err.message);
		res.redirect("back");
	}
});



//============================================================
// USER - DELETE
//============================================================
router.delete("/users/:id", middleware.isAdmin, async (req, res) => {
	try {
		await User.findByIdAndRemove(req.params.id);
		res.redirect("/users");
	} catch(err) {
		req.flash("error", err.message);
		res.redirect("back");
	}
});


module.exports = router;
