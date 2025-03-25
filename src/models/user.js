const mongoose = require('mongoose'); 
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper function to create an avatar URL using Robohash
const generateAvatar = (text) => {
    return `https://robohash.org/${encodeURIComponent(text)}?set=set1`;
};

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
            },
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        age: {
            type: Number,
            min: [13, "Age must be at least 13"],
            max: [100, "Age cannot exceed 100"],
        },
        gender: {
            type: String,
            enum: {
                values: ["Male", "Female", "Other"],
                message: "Gender must be either 'male', 'female', or 'other'",
            },
            default: "Other",
        },
        photoUrl: {
            type: String,
            default: function() {
                // Use first name and last name initials to generate a unique avatar
                const avatarText = `${this.firstName} ${this.lastName}`.trim();
                return generateAvatar(avatarText || "default-avatar");
            },
            validate(value){
                if(!validator.isURL(value)){
                    throw new Error('URL is invalid ' + value);
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

// JWT and password validation methods
userSchema.methods.getJWT = async function(){
    const token = await jwt.sign({_id: this._id}, "codecrush@123456789",{
        expiresIn: "2 days"
    });
    return token;
};

userSchema.methods.validatePassword = async function(password){
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
