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
        required: true,
        minLength: 4,
        maxLength: 50,
      },
      lastName: {
        type: String,
      },
      emailId: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
          if (!validator.isEmail(value)) {
            throw new Error("Invalid email address: " + value);
          }
        },
      },
      password: {
        type: String,
        required: true,
        validate(value) {
          if (!validator.isStrongPassword(value)) {
            throw new Error("Enter a Strong Password: " + value);
          }
        },
      },
      age: {
        type: Number,
        min: 18,
      },
      gender: {
        type: String,
        enum: {
          values: ["male", "female", "other"],
          message: `{VALUE} is not a valid gender type`,
        },
        // validate(value) {
        //   if (!["male", "female", "others"].includes(value)) {
        //     throw new Error("Gender data is not valid");
        //   }
        // },
      },
      isPremium: {
        type: Boolean,
        default: false,
      },
      membershipType: {
        type: String,
      },
      photoUrl: {
        type: String,
        default: "https://geographyandyou.com/images/user-profile.png",
        validate(value) {
          if (!validator.isURL(value)) {
            throw new Error("Invalid Photo URL: " + value);
          }
        },
      },
      about: {
        type: String,
        default: "This is a default about of the user!",
      },
      skills: {
        type: [String],
      },
    },
    {
      timestamps: true,
    }
  );
  
  userSchema.methods.getJWT = async function () {
    const user = this;
  
    const token = await jwt.sign({ _id: user._id }, "DEV@Tinder$790", {
      expiresIn: "7d",
    });
  
    return token;
  };
  

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