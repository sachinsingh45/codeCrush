console.log("server started");
const express = require('express');
const connectDB = require('./config/database');
const app = express();
var port = 3000;
const User = require('./models/user');
app.use(express.json());


app.post('/signup', (req, res)=>{
    console.log(req.body);
    // const userObj = {
    //     firstName: "Sachin",
    //     lastName: "Singh",
    //     emailId: "sachin@gmail.com",
    //     password: "Sachin@123",
    //     age: 21, 
    //     gender: "Male",
    // }
    const user = new User(req.body);
    user.save().then(()=>{
        res.send("User created successfully");
    }).catch((err)=>{
        res.send("User creation failed");
    });
});

app.get('/user',async (req, res)=>{
    const userEmail = req.body.emailId;
    try{
        const user = await User.find({emailId: userEmail});
        if(user.length < 1){
            res.status(404).send("No user found with this email");
        }
        res.send(user);

    }catch (err){
        res.status(400).send("Error occured while fetching user");
    };
}); 
app.get('/feed',async (req, res)=>{
    try{
        const users = await User.find({});
        if(users.length < 1){
            res.status(404).send("No user found with this email");
        }
        res.send(users);

    }catch (err){
        res.status(400).send("Error occured while fetching user");
    };
}); 
app.delete('/deleteUser', async (req, res)=>{
    const userId = req.body.userId;
    try{
        const user = User.findByIdAndDelete(userId);
        res.send("User deleted");
    }catch(err){
        res.send("something went wrong in deleting the user");
    }
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