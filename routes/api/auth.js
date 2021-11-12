const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const {check, validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
//@route    GET api/auth
//@desc     Test route
//@access   private
router.get('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }
    catch (err){
        console.error(err.message);
        res.status(500).send('Server Error');

    }
});

//@route    POST api/auth
//@desc     Login User(auth and get token)
//@access   private
router.post('/',[
        check('email','Please enter valid email').isEmail(),
        check('password','Please enter a password with 6 or more characters').exists()
    ],
    async (req, res) => {
        const  errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array()
            })
        }
        const {email, password} = req.body;
        try{
            let user = await User.findOne({email});
            if (!user){
                return res.status(400).json({errors: [{msg: "Invalid Credentials"}]});
            }
            const isMatch = await bcrypt.compare(password,user.password);
            if(!isMatch){
            }
            const payload = {
                user: {
                    id: user.id
                }
            }
            jwt.sign(payload,config.get('jwtSecret'),{expiresIn: 360000},(err, token)=>{
                if (err) throw err;
                res.json({token})
            });
        }
        catch (err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });


module.exports = router;