// all required packages:
require("dotenv").config();
const express=require("express");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
// const momgooseEncryption=require("mongoose-encryption");
// const md5=require("md5");
// const bcrypt=require("bcrypt");
// const saltRound=10;
const expressSession=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate=require("mongoose-findorcreate");

//using app
const app=express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(expressSession({
    secret:"This is secret code.",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());


///////////////////--Connecting with MongoDB server--////////////////////
mongoose.connect("mongodb://localhost:27017/userDB");

////////////Creating MOngoDB databases//////////////////////
const userSchema=new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
// userSchema.plugin(momgooseEncryption,{secret:process.env.SECRET,encryptedFields:["password"]});
const User=mongoose.model("user",userSchema);

passport.use(User.createStrategy());

// passport.serializeUser(function(user, cb) {
//     cb(null, user.id );
// });
  
// passport.deserializeUser(function(id, cb) {
//     User.findById(id,function(err,user) {
//         cb(err, user);
//     });
// });

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username, name: user.displayName });
    });
  });
  
  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLINT_ID,
    clientSecret: process.env.CLINT_SECRET,
    callbackURL: "http://localhost:2000/auth/google/authentication",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

////////////////////GETTING REQUEST TO ACCESS THE PAGES/////////////////

//////////Home page///////////////////
app.get("/",function(req,res){
    res.render("home");
});

//////////Login page///////////////////
app.get("/login",function(req,res){
    res.render("login");
});

//////////Register page///////////////////
app.get("/register",function(req,res){
    res.render("register");
});

//////////secrect page only access to the known users///////////////////
app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

//////////submit page///////////////////
app.get("/submit",function(req,res){
    res.render("submit");
});

//////////Logout page///////////////////
app.get("/logout",function(req,res){
    req.logout(function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("Successfully loged out");
        }
    });
    res.redirect("/");
});

app.get("/auth/google",passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/google/authentication", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  });


///////////////////--Featching data from  Register submitted action--////////////
app.post("/register",function(req,res){
    User.register({username:req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});

//////////////////--Featching data from  login submitted action--///////////
app.post("/login",function(req,res){
    const newEmail=req.body.username;
    const newPassword=req.body.password;
    const user=new User({
        username:newEmail,
        password:newPassword
    });
    req.login(user,function(err){
        if(err){
            console.log(err);
            res.redirect("/login");
        }
        else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
});

//////////////////// Listening from Local Sever /////////////////
app.listen(2000,function(){
    console.log("You are live in port 2000");
});
