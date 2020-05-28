<strong>My take on the famous (infamous?) YelpCamp.</strong>
<br>
As my final project for the Udemy full-stack web developer bootcamp, I walked through the guided build of YelpCamp. If you're unfamiliar, seach for yelpcamp on github and you'll find many, but each one is different. This respository holds my take on the YelpCamp theme, with some unique features and  quirks that I hope you'll enjoy. 

If you're a current Udemy student, feel free to use this for inspiration and copy any part of it. Most of the images are mine, with the excpetion of a few on the LeaveNoTrace page that I snagged from unsplash. 

<strong>What's differnt about this one?</strong>
<br>
1. Async refactor
I refactored my routes to use async/await instead of nested callbacks. This helped avoid callback hell on some of them, especially the campground CREATE route. 
<br>
2. Profile pages
I added some elements to my user models to make the profiles more interesting, including things like hometown and a picture. You can use cloudinary api for profile pictures, similar to what's outlined in the tutorial. 
<br>
3. Rotating carousel on the index page 
If you're interested in this, check out the code on the views/campgrounds/index.ejs file as well as app.css. 
<br>
4. User management system
This is a backend system for the administrators to control users:

<br>
5. inline comment creation
Used JQuery to toggle comment fild up and down. 
<br>
6. Leave no trace page
Repurposed Colt's candy store page from earlier in the course to make a flexbox page for the 7 Leave No Trace principles.
<br>
**Here's a visual of the underlying stack for this app:**

<br>
**Things I wanted to improve to but ran out of time:**
1. Code under campground CREATE route is not DRY, due to adding all the amenities to the campground object. I am sure there is an easier way to do this, but I went with a quick, wet solution to save time. 
<br>
2. Cover image on profile pages
<br>
3. Sorting on the index page
<br>
4. Map view for index
<br>
Thanks for reading, and good luck coding!
<br>
Images are mine, except for a few on the Leave no trace page, which are from upsplash. Feel free to use mine if you like them. 
