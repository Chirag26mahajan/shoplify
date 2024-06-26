//Create token and save in cookie

const sendToken= (user,StatusCode,res)=>{
    const token=user.getJWTToken();
    const options = {
        expires:new Date(
            Date.now() + (process.env.COOKIE_EXPIRE)*24*60*60*1000 
        ),
        httpOnly: true,
    };
    res.status(StatusCode).cookie('token',token,options).json({
        success:true,
        user,token,
    });
};

module.exports = sendToken;