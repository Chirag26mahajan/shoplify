const mongoose=require('mongoose');
const validator=require("validator");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const crypto = require("crypto");

const userSchema=new mongoose.Schema({
    name: {
        type:String,
        required:[true,"Please enter your name"],
        maxLength:[30,"Name cannot exceed 30 characters"],
        minLength:[4,"Name should have more than 4 characters"]
    },
    email:{
        type:String,
        required:[true,"Please Enter a valid Email"],
        unique:true,
        validate:[validator.isEmail,"Please Enter a valid Email"]
    },
    password:{
        type:String,
        required:[true,"Please Enter Your Password"],
        minLength:[8,"Password should be greater than 8 characters"],
        select:false //if we do user.find() then it not select
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{   
            type:String,
            required:true 
        }
    },
    role:{
        type:String,
        default:"user"
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
});
userSchema.pre("save",async function(next){//before save salt

    if(!this.isModified("password")){
        next();
    }

    this.password=await bcrypt.hash(this.password,10);
})

//JWT TOKEN 
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    });
};

//compare Password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

//reset Password
userSchema.methods.getResetPasswordToken = function(){
    //Generating Token

    const resetToken=crypto.randomBytes(20).toString("hex");//generate random 20 bytes and convert in hex
    
    //Hashing and adding resetPassword to userSchema
    this.resetPasswordToken= crypto.createHash("sha256")
                            .update(resetToken)
                            .digest("hex");

    this.resetPasswordExpire=Date.now()+15*60*60*1000;// in ms
    return resetToken;
}
module.exports=mongoose.model('User', userSchema);