const mongoose = require("mongoose");

const campgroundSchema = mongoose.Schema({
	name: String,
	price: String,
	image: String,
	description: String,
	location: String,
	amenities: [],
	highSeasonStart: String,
	highSeasonEnd: String,
	website: String,
	createdAt: {type: Date, default: Date.now},
	lat: Number,
	lng: Number,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref:"User"
		},
		username: String
	},
	rating: Number,
	comments: [
		{
			type: mongoose.Schema.Types.ObjectID,
			ref: "Comment"
		}
	]
});

module.exports = mongoose.model('Campground', campgroundSchema);
