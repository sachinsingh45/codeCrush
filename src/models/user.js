const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
    },
    lastName: {
        type: String,
        trim: true,
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    age: { 
        type: Number,
        min: 13,
        max: 100,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: "Other",
        // validate(value){
        //     if(!["Male", "Female", "Other"].includes(value)){
        //         throw new Error("Invalid gender");
        //     }
        // }
    },
    photoUrl: {
        type: String,
        default: "https://tse3.mm.bing.net/th?id=OIP.iIvHIfGGte2FI-G2K56kwQHaHa&pid=Api&P=0&h=220",
    },
    aboutMe: {
        type: String,
        trim: true,
    },
    skills: {
        type: [String],
        default: [],
    },
},{
    timestamps: true,
}
);
const User = mongoose.model('User', userSchema);
module.exports = User;