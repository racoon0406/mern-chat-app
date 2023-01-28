//save user in database
const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Can't be blank"]
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "Can't be blank"],//message
    index: true, //retrieve the user by email
    validate: [isEmail, "invalid email"]
  },
  password: {
    type: String,
    required: [true, "Can't be blank"]
  },
  picture: {
    type: String
  },
  newMessages: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    default: 'online'
  }
}, {minimize: false});


//method: hide the password before it saves
UserSchema.pre('save', function(next){
  const user = this;
  if(!user.isModified('password')) return next();//password not modified, do nothing
  //if password is modified
  bcrypt.genSalt(10, function(err, salt){
    if(err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash){//hide the password
      if(err) return next(err);

      user.password = hash;
      next();
    })
  })
})

//method: send back user without password
UserSchema.methods.toJSON = function() {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
}

//method
UserSchema.statics.findByCredentials = async function(email, password) {
  const user = await User.findOne({email});//find user by Email
  if(!user) throw new Error('invlaid email or password');//return

  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) throw new Error('invlaid email or password');//return
  return user;
}


const User = mongoose.model('User', UserSchema);
module.exports = User;
