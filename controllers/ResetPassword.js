 const User = require('../models/User')
 const mailSender = require('../utills/mailSender');
 const bcrypt = require('bcrypt');

 exports.resetPasswordToken = async(req,res)=>{

    try{
        const email = req.body.email;

    const user = await User.findOne({email:email});
    if(!user){
        return res.status(401).json({
            success:false,
            message:"your email.is not registered"
        })
    }
    const token =crypto.randomUUID();

    const updatedDetails = await User.findOneAndUpdate({email:email},
        {
            token:token,
            resetPasswordExpires:Date.now()+5*60*1000,
        },{new:true})

    const url= `http://localhost:3000/update-password/${token}`;

    await mailSender(email, "Password reset link", `Password reset link ${url}`);
    return res.json({
        success:true,
        message:"mail sent successfully , please check email"
    })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"reset password failure,while sending the mail"
        })
    }
 }

 exports.resetPassword =async(req,res)=>{
    try{
        const {password, confirmPassword, token} = req.body;

    if(password !== confirmPassword){
        return res.json({
            success:false,
            message:"password and confirm password are not matching"
        })
    }
    const userDetails = await User.findOne({token});
    if(!userDetails){
        return res.json({
            success:false,
            message:"invalid token "
        })
    }
    if(userDetails.resetPasswordExpires < Date.now()){
        return res.json({
            success:false,
            message:"reset link time limit exeeded, regenrate it again"
        })
    }
    const hashedPassword= await bcrypt.hash(password,10);

    await User.findOneAndUpdate({token},
        {
            password:hashedPassword
        },{new:true});

        return res.status(200).json({
            success:true,
            message:"password reset successfully"
        }
        )
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"reset password updation failure, after mail sent"
        })
    }
 }
