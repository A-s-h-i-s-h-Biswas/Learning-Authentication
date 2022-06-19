// all required packages:
require("dotenv").config();
const express=require("express");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
// const momgooseEncryption=require("mongoose-encryption");
const md5=require("md5");

//using app
const app=express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');


///////////////////--Connecting with MongoDB server--////////////////////
mongoose.connect("mongodb://localhost:27017/userDB");

////////////Creating MOngoDB databases//////////////////////
const userSchema=new mongoose.Schema({
    email: String,
    password: String
});

// userSchema.plugin(momgooseEncryption,{secret:process.env.SECRET,encryptedFields:["password"]});
const User=mongoose.model("user",userSchema);

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
// app.get("/secrects",function(req,res){
//     
// });

//////////submit page///////////////////
app.get("/submit",function(req,res){
    res.render("submit");
});

//////////Logout page///////////////////
app.get("/logout",function(req,res){
    res.render("logout");
});

///////////////////--Featching data from  Register submitted action--////////////
app.post("/register",function(req,res){
    const user=new User({
        email: req.body.username,
        password: md5(req.body.password)
    });
    user.save(function(err){
        if(!err){
            console.log("You have successfully Registered");
            res.render("secrets")
        }else{
            console.log("Something went wrong when try to Register"+err);
        }
    });
});

//////////////////--Featching data from  login submitted action--///////////
app.post("/login",function(req,res){
    const newEmail=req.body.username;
    const newPassword=md5(req.body.password);
    User.findOne({email:newEmail},function(err,found){
        if(err){
            console.log(err);
        }
        else{
            if(found){
                if(found.password===newPassword){
                    res.render("secrets");
                }else{
                    console.log("User not found");
                }
            }
            else{
                console.log("User not found");
            }
        }
    });
});

//////////////////// Listening from Local Sever /////////////////
app.listen(2000,function(){
    console.log("You are live in port 2000");
});
