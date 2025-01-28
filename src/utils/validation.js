const validator = require('validator');
const validateSignUpData = (req) => {
    const {firstName, lastName, emailId, password} = req.body;
    if(!firstName || !lastName || !emailId || !password){
        throw new Error("Name, email Id, and password are required");
        // return "Name, email Id, and password are required";
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("Invalid email format");
        // return "Invalid email format";
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("Password must contain at least one uppercase letter, one lowercase letter, one number, one special character and minimum length of 8 characters");
        // return "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character and minimum length of 8 characters";
    }
};
const validateEditProfileData = (req) => {
    const allowedEditFields = [
      "firstName",
      "lastName",
      "emailId",
      "photoUrl",
      "gender",
      "age",
      "about",
      "skills",
    ];
  
    const isEditAllowed = Object.keys(req.body).every((field) =>
      allowedEditFields.includes(field)
    );
  
    return isEditAllowed;
};
  
module.exports = {
    validateSignUpData,
    validateEditProfileData,
}; 