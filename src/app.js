console.log("server started");
const express = require('express');
const connectDB = require('./config/database');
const app = express();
var port = 3000;
const User = require('./models/user');
const {validateSignUpData} = require('./utils/validation');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const {userAuth} = require("./middlewares/auth");
app.use(express.json());
app.use(cookieParser());

app.post('/signup',async (req, res) => {
    try{
        //data validation
        validateSignUpData(req);
        //password encryption
        console.log(req.body);
        const { firstName, lastName, emailId, password} = req.body;
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: hashPassword,
        });
        await user.save();
        res.send("User created successfully");
    }
    catch(err){
        res.send(`User creation failed: ${err.message}`);
    };
});
app.get('/profile',userAuth, async (req, res) => {
    try{
        const user = req.user;
        res.send(user);
    }
    catch(err){
        res.status(400).send(`Error: ${err.message}`);
    }
    
});
app.post('/login', async (req, res) => {
    const { emailId, password } = req.body;
    try {
        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(404).send("Invalid Credentials");
        }
        const isMatch = await user.validatePassword(password);
        if (!isMatch) {
            return res.status(400).send("Invalid Credentials");
        }
        //create a JWT token 
        const token = await user.getJwt();
        //add the token to cookie and send the response
        res.cookie("token", token, {httpOnly:true, secure: true, expires: new Date(Date.now() + 1000*60*60*24*2)});
        res.send("User logged in successfully");
    } catch (err) {
        res.status(400).send(`Error occurred while logging in: ${err.message}`);
    }
});
app.post('/sendConnectionRequest',userAuth, (req, res)=>{
    const user = req.user;
    res.send(user.firstName + " sent connection request successfully");
});
connectDB().then(() => {
    console.log("Database connected");
    app.listen(port, () => {
        console.log("server is listening at port", port);
    });
}).catch((err) => {
    console.error("Database connection failed:", err);
});
