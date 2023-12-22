const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
    });
    return token;
};

const User = mongoose.model("user", userSchema);

const userValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().label("Name"),
        userName: Joi.string().required().label("User Name"),
        phone: Joi.string().required().label("phone"),
        email: Joi.string().email().required().label("Email"),
        password: passwordComplexity().required().label("Password"),
        
    });
    return schema.userValidation(data);
};

module.exports = { User, userValidation };