console.log("server started");
const express = require('express');
const connectDB = require('./config/database');
const app = express();
var port = 3000;
const User = require('./models/user');
app.use(express.json());
const {validateSignUpData} = require('./utils/validation');
const bcrypt = require('bcrypt');

app.post('/login', async (req, res) => {
    const { emailId, password } = req.body;
    try {
        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(404).send("Invalid Credentials");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send("Invalid Credentials");
        }
        res.send("User logged in successfully");
    } catch (err) {
        res.status(400).send(`Error occurred while logging in: ${err.message}`);
    }
});

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

app.get('/user', async (req, res) => {
    const userEmail = req.query.emailId; 
    try {
        const user = await User.find({ emailId: userEmail });
        if (user.length < 1) {
            return res.status(404).send("No user found with this email");
        }
        res.send(user);
    } catch (err) {
        res.status(400).send(`Error occurred while fetching user: ${err.message}`);
    }
});

app.get('/feed', async (req, res) => {
    try {
        const users = await User.find({});
        if (users.length < 1) {
            return res.status(404).send("No users found");
        }
        res.send(users);
    } catch (err) {
        res.status(400).send(`Error occurred while fetching users: ${err.message}`);
    }
});

app.patch('/user/:userId', async (req, res) => {
    const userId = req.params?.userId;
    const data = req.body;
    
    try {
        const allowedUpdates = ["firstName", "lastName", "password", "age", "photoUrl", "aboutMe", "skills", "gender"];
        const isUpdateAllowed = Object.keys(data).every((k) => allowedUpdates.includes(k));
        if(!isUpdateAllowed){
            throw new Error("Invalid updates");
        }
        const user = await User.findByIdAndUpdate(userId, data,
            {
                returnDocument: "after",
                runValidators: true,
            }
        );
        console.log(user);
        res.send("User updated successfully");
    } catch (err) {
        res.send(`Something went wrong in updating the user: ${err.message}`);
    }
});

app.delete('/user', async (req, res) => {
    const userId = req.body.userId;
    try {
        const user = await User.findByIdAndDelete(userId);
        res.send("User deleted");
    } catch (err) {
        res.send(`Something went wrong in deleting the user: ${err.message}`);
    }
});

app.delete('/deleteUser', async (req, res) => {
    const emailId = req.body.emailId;
    try {
        const user = await User.deleteMany({ emailId: emailId });
        res.send("User deleted");
    } catch (err) {
        res.send(`Something went wrong in deleting the user: ${err.message}`);
    }
});
connectDB().then(() => {
    console.log("Database connected");
    app.listen(port, () => {
        console.log("server is listening at port", port);
    });
}).catch((err) => {
    console.error("Database connection failed:", err);
});
