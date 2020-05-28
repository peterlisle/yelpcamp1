require('dotenv').config()

const 	methodOverride 		= require("method-override"),
	  		expressSanitizer 	= require("express-sanitizer"),
	  		LocalStrategy 		= require("passport-local"),
				bodyParser 				= require('body-parser'),
	  		Campground 				= require("./models/campground")
				mongoose 					= require('mongoose'),
				express 					= require('express'),
				seedDB						= require("./seeds")
				got 							= require('got'),
				app 							= express(),
				Comment 					= require("./models/comment")
				seedDB						= require("./seeds"),
				flash							= require("connect-flash"),
				passport					= require("passport"),
				moment						= require("moment"),
				User 							= require("./models/user"),
				PORT 							= process.env.PORT || 3000;

//Requiring routes
const 	commentRoutes 		= require("./routes/comments"),
				campgroundRoutes 	= require("./routes/campgrounds"),
	  		userRoutes				= require("./routes/users"),
				indexRoutes 			= require("./routes/index");

//connecting to yelp_camp database
let url = process.env.DATABASEURL || "mongodb://localhost:27017/yelp_camp"
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology : true });


app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs'); //allows us to render ejs files without appending .ejs to the file name
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");
app.use(expressSanitizer());
// seedDB(); //seed the database

//PASSPORT CONFIG
app.use(require("express-session")({
	secret: "Lucky is from cartegena",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);
app.use(userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(PORT, () => console.log(`We're in business on ${ PORT }`));
