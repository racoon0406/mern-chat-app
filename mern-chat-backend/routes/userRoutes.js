const router = require('express').Router();
const User = require('../models/User');//user models

//sign up: create user
router.post('/', async(req, res) => {//request and response
  try{
    const {name, email, password, picture} = req.body;//get input info
    console.log(req.body);
    const user = await User.create({name, email, password, picture});//create user
    res.status(201).json(user); //created
  } catch(e) {//error
    let msg;
    if(e.code == 11000) {
      msg = "User already exists"
    } else {
      msg = e.message;
    }
    console.log(e);
    res.status(400).json(msg);//bad request
  }
})

//login User
router.post('/login', async(req, res) => {
  try {
    const {email, password} = req.body;
    const user = await User.findByCredentials(email, password);//find user using email
    user.status = 'online';
    await user.save();
    res.status(200).json(user);//success
  } catch (e) {
    res.status(400).json(e.message);//bad request
  }
})

module.exports = router;
