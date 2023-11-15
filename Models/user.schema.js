import mongoose from 'mongoose'

const userScheme=new mongoose.Schema({
    username:String,
    email:{type:String,unique:true},
    password:String,
    resetPasswordToken: String,
    resetPasswordTokenExpiery: String,

})

const User=mongoose.model("User",userScheme)

export default User