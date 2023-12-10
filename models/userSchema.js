const mongoose=require('mongoose')
// defines user schema
const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value) => value.endsWith('@vcet.edu.in'),
        message: 'Only email addresses from @vcet.edu.in are allowed.',
      },
    },
    password: String,
    otp:{
      type:String, required:true
    },
    timestamp:{
      type:Date,default:Date.now
    },
    verified:{
      type:Boolean,default:false
    }
  
  });

  const User = mongoose.model('User', userSchema);
  module.exports=User;