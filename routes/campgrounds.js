const 	Campground 		= require("../models/campground"),
				express 			= require("express"),
	  		router 				= express.Router(),
	  		middleware 		= require("../middleware"),
	  		moment				= require("moment"),
				NodeGeocoder 	= require('node-geocoder');

//multer config
	var multer = require('multer');
	var storage = multer.diskStorage({
	  filename: function(req, file, callback) {
		callback(null, Date.now() + file.originalname);
	  }
	});
	var imageFilter = function (req, file, cb) {
		// accept image files only
		if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
			return cb(new Error('Only image files are allowed!'), false);
		}
		cb(null, true);
	};
	var upload = multer({ storage: storage, fileFilter: imageFilter});

//cloudinary config
	var cloudinary = require('cloudinary');
	cloudinary.config({
	  cloud_name: 'dckibiawc',
	  api_key: 789593126451718,
	  api_secret: process.env.CLOUDINARY_API_SECRET
	});


//Geocoder config
let options = {
  		provider: 'google',
  		httpAdapter: 'https',
  		apiKey: process.env.GEOCODER_API_KEY,
  		formatter: null
};

let geocoder = NodeGeocoder(options);

//INDEX ROUTE - OK
//===================================================
router.get("/", async (req, res) => {
	try {
		if(req.query.search) {
			let regex = await new RegExp(escapeRegex(req.query.search), 'gi');
			let campgrounds = await Campground.find({name: regex})
		//render that file
			return res.render('campgrounds/index', {campgrounds:campgrounds, currentUser: req.user})
		} else {
			let campgrounds = await Campground.find({})
			//render that file
			return res.render('campgrounds/index', {campgrounds:campgrounds, currentUser: req.user})
		}
	} catch(err){
			console.log(err);
	};
});


//CREATE ROUTE - OK
//===================================================
router.post("/", middleware.isLoggedIn, upload.single('image'), async (req, res) => {
// initializing data, imageObject, and amenities;
	let data;
	let imageObject;
	let amenities;

// Assigning values to data and imageObject
	[data, imageObject] = await Promise.all([
		data = geocoder.geocode(req.body.location),
		imageObject = cloudinary.uploader.upload(req.file.path)
	]);

//error handling if geocoder comes back as undefined
	if (!data || data.length === 0) {
		req.flash("error", "Please enter a valid address")
		return res.redirect("back")
	}

	try{
		// creating array with amenties as strings
		let amenities = []
		if (req.body.wifi === 'on'){
			amenities.push("Wifi")
		};
		if (req.body.breakfast === 'on'){
			amenities.push("Breakfast included")
		};
		if (req.body.privateRooms === 'on'){
			amenities.push("Private rooms")
		};
		if (req.body.restaurant === 'on'){
			amenities.push("Restaurant")
		};
		if (req.body.bar === 'on'){
			amenities.push("Bar")
		};
		if (req.body.music === 'on'){
			amenities.push("Live music")
		};
		if (req.body.vegan === 'on'){
			amenities.push("Vegan friendly")
		};
		if (req.body.celiac === 'on'){
			amenities.push("Celiac friendly")
		};
		if (req.body.area === 'on'){
			amenities.push("Common area")
		};
		if (req.body.vibes === 'on'){
			amenities.push("Good vibes")
		};
		if (req.body.storage === 'on'){
			amenities.push("Bag storage")
		};
		if (req.body.tp === 'on'){
			amenities.push("Toilet Paper")
		};

		let campground = {
			name: req.body.name,
			image: imageObject["secure_url"],
			description: req.sanitize(req.body.description),
			price: req.body.price,
			website: req.body.website,
			author: {
	    	id: req.user._id,
	    	username: req.user.username
		 	},
			highSeasonStart: req.body.start,
			highSeasonEnd: req.body.end,
			location: data[0].formattedAddress,
			lat: data[0].latitude,
			lng: data[0].longitude
		};
		// calling the create function to make the new campground in mongoose
		let newlyCreated = await Campground.create(campground);
		//push amenities into campgrounds
		await amenities.forEach(function(amenity){
			newlyCreated.amenities.push(amenity);
		});
		newlyCreated.save();
		// redirecting to the show page for the new campground
	 	return res.redirect("/campgrounds/" + newlyCreated.id);
	} catch(err) {
		req.flash("error", err.message);
		return res.redirect("back");
	}
});



//NEW ROUTE - OK
//===================================================
router.get('/new', middleware.isLoggedIn, async (req, res) => {
	res.render('campgrounds/new');
});


//SHOW ROUTE -- must come AFTER New route - OK
//===================================================
router.get('/:id', async (req, res) => {
	try{
		//find campground with provided ID
		let foundCampground = await Campground.findById(req.params.id).populate("comments");
		if (!foundCampground || foundCampground.length === 0) {
			req.flash("error", "Item not found");
			return res.redirect("back");
		}
		return res.render('campgrounds/show', {campground:foundCampground});
	} catch(err) {
		console.log(err);
	}
});

// EDIT CAMPGROUND ROUTE - OK
//===================================================
router.get("/:id/edit", middleware.checkCampgroundOwnership, async (req, res) => {
	try{
		let foundCampground = await Campground.findById(req.params.id)
			if (!foundCampground || foundCampground.length === 0) {
				req.flash("error", "Item not found.");
				return res.redirect("back");
			};
		return res.render("campgrounds/edit", {campground: foundCampground});
	} catch(err) {
		console.log(err);
	}
});

//	UPDATE CAMPGROUND ROUTE
//===================================================
router.put("/:id", middleware.checkCampgroundOwnership, upload.single("image"), async (req, res) => {
// sanitizing description
	req.body.campground.description = req.sanitize(req.body.campground.description);

	try{
		// building amenities array and populating it
		let amenities = []
		if (req.body.wifi === 'on'){
			amenities.push("Wifi")
		};
		if (req.body.breakfast === 'on'){
			amenities.push("Breakfast included")
		};
		if (req.body.privateRooms === 'on'){
			amenities.push("Private rooms")
		};
		if (req.body.restaurant === 'on'){
			amenities.push("Restaurant")
		};
		if (req.body.bar === 'on'){
			amenities.push("Bar")
		};
		if (req.body.music === 'on'){
			amenities.push("Live music")
		};
		if (req.body.vegan === 'on'){
			amenities.push("Vegan friendly")
		};
		if (req.body.celiac === 'on'){
			amenities.push("Celiac friendly")
		};
		if (req.body.area === 'on'){
			amenities.push("Common area")
		};
		if (req.body.vibes === 'on'){
			amenities.push("Good vibes")
		};
		if (req.body.storage === 'on'){
			amenities.push("Bag storage")
		};
		if (req.body.tp === 'on'){
			amenities.push("Toilet Paper")
		};

		// ingesting and coding new location and assigning to req.body.campground
	  let data = await geocoder.geocode(req.body.campground.location);
		  if (!data || !data.length) {
		    req.flash('error', 'Invalid address');
		    return res.redirect('back');
		  };
	  req.body.campground.lat = data[0].latitude;
	  req.body.campground.lng = data[0].longitude;
	  req.body.campground.location = data[0].formattedAddress;

		// ingesting new image and assigning image url to req.body.campground
		let image = await cloudinary.uploader.upload(req.file.path);
		req.body.campground.image = image.secure_url;

		// executing updates using mongoose
		let campground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground)

		// emptying amenities array
		campground.amenities = [];

		//inserting ameities and saving
		await amenities.forEach(function(amenity){
			campground.amenities.push(amenity);
		});
		campground.save();

		// redirecting to the campground show page with based on updated entry
		req.flash("success", "Successfully Updated!");
		return res.redirect("/campgrounds/" + campground._id);
	} catch(err) {
		req.flash("error", err.message);
		return res.redirect("back")
	}
});


// DESTROY CAMPGROUND ROUTE - OK
//===================================================
router.delete("/:id", middleware.checkCampgroundOwnership, async (req, res) => {
	try{
		let foundCampground = await Campground.findByIdAndRemove(req.params.id)
		return res.redirect("/campgrounds")
	} catch(err) {
		req.flash("error", err.mesasge);
		return res.redirect("back");
	}
});

// regex function
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
