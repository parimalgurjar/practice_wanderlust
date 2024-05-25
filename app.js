if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

const express=require("express")
const app=express()
const mongoose=require("mongoose")
const PORT=8080;
const Listing=require("./models/listing")
const Review=require("./models/review.js")
const path=require("path")
const ejsMate = require('ejs-mate');
const wrapAsync=require("./utils/wrapAsync.js")
const methodOverride=require("method-override")
const ExpressError=require("./utils/ExpressError.js")
const {listingSchema,reviewSchema}=require("./schema.js")
const listings=require('./routes/listing.js')
const reviews=require("./routes/review.js")
const flash=require("connect-flash")
const session = require('express-session');
const MongoStore = require('connect-mongo');

const passport=require('passport')
const LocalStrategy=require("passport-local")
const User=require("./models/user.js")
const userRouter=require("./routes/user.js")
const listingRouter=require("./routes/listing.js")
const reviewRouter=require("./routes/review.js")

const dbUrl=process.env.ATLASDB_URL
async function main(){
    await mongoose.connect(dbUrl)
}
main().then(()=>{
    console.log("conneted to db")

}).catch((err)=>{
    console.log(err)
})

app.set("view engine",'ejs')
app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")))


const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,

})

store.on("error",()=>{
    console.log("error in mongo session store",err)
})

// Define session options
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};




// Use session middleware with sessionOptions
app.use(session(sessionOptions));
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currUser = req.user;  // Set the current user for use in views
    next();
});


const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};
app.get("/demouser",async(req,res)=>{
    let fakeUser=new User({
        email:"student@gmail.com",
        username:"delta",
    })
    let registerUser=await User.register(fakeUser,"Helloworld")
    res.send(registerUser)
    
})
app.use("/listings",listingRouter)
app.use("/listings/:id/reviews",reviewRouter)
app.use("/",userRouter)
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found"))

})

app.use((err, req, res, next) => {
    console.error(err); // Log the error for debugging
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { err: err }); // Pass 'err' object to the template
});

app.listen(PORT,()=>{
    console.log(`server is listing on port ${PORT}`)
})