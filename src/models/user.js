const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper function to validate email format
// const validateEmail = (email) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
// };

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            minlength: [3, "First name must be at least 3 characters long"],
            maxlength: [20, "First name cannot exceed 20 characters"],
            match: [/^[A-Za-z]+$/, "First name can only contain alphabets"],
        },
        lastName: {
            type: String,
            trim: true,
            minlength: [3, "Last name must be at least 3 characters long"],
            maxlength: [20, "Last name cannot exceed 20 characters"],
            match: [/^[A-Za-z]+$/, "Last name can only contain alphabets"],
        },
        emailId: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            validate(value){
                if(!validator.isEmail(value)){
                    throw new Error('Email is invalid '+value);
                }
            }
            // validate: {
            //     validator: validateEmail,
            //     message: "Invalid email format",
            // },
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            // minlength: [8, "Password must be at least 8 characters long"],
            // validate: {
            //     validator: function (v) {
            //         // At least one uppercase, one lowercase, one number, and one special character and Minimum length of 8 characters.
            //         return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
            //     },
            //     message:
            //         "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            // },
        },
        age: {
            type: Number,
            min: [13, "Age must be at least 13"],
            max: [100, "Age cannot exceed 100"],
        },
        gender: {
            type: String,
            enum: {
                values: ["male", "female", "other"],
                message: "Gender must be either 'male', 'female', or 'other'",
            },
            default: "other",
        },
        photoUrl: {
            type: String,
            default: "https://png.pngtree.com/png-vector/20190710/ourlarge/pngtree-user-vector-avatar-png-image_1541962.jpg",
            // validate: {
            //     validator: function (v) {
            //         return /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/.test(v);
            //     },
            //     message: "Photo URL must be a valid image URL",
            // },
            validate(value){
                if(!validator.isURL(value)){
                    throw new Error('URL is invalid '+value);
                }
            }
        },
        about: {
            type: String,
            trim: true,
            maxlength: [500, "About me section cannot exceed 500 characters"],
        },
        skills: {
            type: [String],
            default: [],
            validate: {
                validator: function (v) {
                    return v.length <= 10;
                },
                message: "Skills cannot exceed 10 entries",
            },
        },
    },
    { 
        timestamps: true,
    }
);

userSchema.methods.getJWT = async function(){
    //this keyword will not work in arrow function
    const token = await jwt.sign({_id: this._id}, "codecrush@123456789",{
        expiresIn: "2 days"
    });
    return token;
}
userSchema.methods.validatePassword = async function(password){
    // this.password is the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, this.password);
        return isMatch;
}
const User = mongoose.model('User', userSchema);
module.exports = User;