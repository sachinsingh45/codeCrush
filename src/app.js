console.log("server started");
const express = require('express');
const connectDB = require('./config/database');
const app = express();
var port = 3000;
const User = require('./models/user');

app.post('/signup', (req, res)=>{
    const userObj = {
        firstName: "Sachin",
        lastName: "Singh",
        emailId: "sachin@gmail.com",
        password: "Sachin@123",
        age: 21,
        gender: "Male",
    }
    const user = new User(userObj);
    user.save().then(()=>{
        res.send("User created successfully");
    }).catch((err)=>{
        res.send("User creation failed");
    });
});
connectDB().then(()=>{
    console.log("Database connected");
    app.listen(port, ()=>{
        console.log("server is listening at port", port);
    });
}).catch((err)=>{
    console.error("Database connection failed");
});

app.use("/user",(req, res)=>{
    res.send("Hello from the server!");
});