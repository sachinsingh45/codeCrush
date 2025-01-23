const mongoose = require('mongoose');
const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://sachinsingh45:sachinsingh@cluster0.ibmkd.mongodb.net/codecrush');
}
module.exports = connectDB;