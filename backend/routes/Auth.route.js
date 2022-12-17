const express = require('express');
const authRouter = express.Router();
const { AuthModel } = require('../models/Auth.model');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 6;
const secretKey = process.env.secretKey;

authRouter.post('/signup', [
    body('first_name', "Enter Your First Name").not().isEmpty(),
    body('last_name', "Enter Your Last Name").not().isEmpty(),
    body('email', "Enter a valid email").isEmail(),
    body('password', "password must be at least 3 Characters long").isLength({ min: 3 }),  // password must be at least 3 chars long
    body('confirm_password', "confirm password must be at least 3 Characters long").isLength({ min: 3 }),  // confirm password must be at least 3 chars long
    body('mobile', "Enter a valid mobile number").isLength({ min: 10, max : 10 }),
], async (req, res) => {
    try {
        // If Any Error Exists throw Error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        let {first_name, last_name, email, password, confirm_password, mobile, isAdmin, isSeller} = req.body;

        // Check If the password and confirm_password are not match throw Error
        if(password !== confirm_password){
           return res.status(400).send({ msg : "Please Check Confirm Password!" });
        }

        // Check if the user already Exists then throw Error
        let isAuth = await AuthModel.findOne({email});
        if(isAuth){
            res.status(400).send({ msg : "This Email Already Exists Please Login" });
        }

        // If user not Exists Create user
        // Create hashing Password
        let hashPassword = await bcrypt.hash(password, saltRounds);

        let createAuth = await AuthModel.create({first_name, last_name, email, password : hashPassword, mobile, isSeller, isAdmin});
        if(createAuth){
            res.status(200).send({msg : "Signup Successfully!", auth : createAuth});
        }

    } catch (error) {
        res.status(500).send({ msg : "Somthing Went Wrong In auth Signup", error });
    }
});


authRouter.post('/login', [
    body('email', "Enter a valid email").isEmail(),
    body('password', "password must be at least 3 Characters long").isLength({ min: 3 }),  // password must be at least 3 chars long
    body('confirm_password', "confirm password must be at least 3 Characters long").isLength({ min: 3 }),  // confirm password must be at least 3 chars long
], async (req, res) => {
    try {
        // If Any Error Exists throw Error
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        let {email, password, confirm_password} = req.body;

        // Check If the password and confirm_password are not match throw Error
        if(password !== confirm_password){
           return res.status(400).send({ msg : "Please Check Confirm Password!" });
        }

        // Check if the user already Exists then throw Error
        let isAuth = await AuthModel.findOne({email});
        if(!isAuth){
            res.status(400).send({ msg : "Sorry! You have to login first!" });
        }

    // if user email and password is match or not
    let isPasswordMatch = await bcrypt.compare(password, isAuth.password);
    if(isPasswordMatch){
       // Create Token
       res.status(200).send({msg : "Login Successfully", data : isAuth });
    }else{
       res.status(400).send({ msg : "Sorry! Fill the right credentials!" });
    }

    } catch (error) {
        res.status(500).send({ msg : "Somthing Went Wrong In auth Login", error });
    }
});


module.exports = {authRouter}