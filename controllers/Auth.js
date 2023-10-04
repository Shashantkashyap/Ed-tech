const Profile = require("../models/Profile");
const User = require("../models/User");
const OTP = require("../models/otp");
const otpGenerator = require("otp-generator");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const mailSender= require('../utills/mailSender');
require('dotenv').config();

exports.sentOTP = async(req,res)=>{
    try{
        const {email} = req.body;
    const checkUserPresent = await User.findOne({email});

    if(checkUserPresent){
       return res.status(401).json({
        success: false,
        message:"user already registered"
       })
    }
    var otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
        
    });
    console.log("otp generated", otp);

    const result = await OTP.findOne({otp: otp});

    while (result){
        otp = otpGenerator(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        result = await OTP.findOne({otp: otp});
    }

    const otpPayload = {email,otp};

    const otpBody= await OTP.create(otpPayload);
    console.log(otpBody);

    res.status(200).json({
        success:true,
        message:"OTP sent successfully"
    })



    }

    
    
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }

};

exports.signUp =async (req,res)=>{
    try{
        const {
            firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp
        }= req.body;
    
        if(!firstName|| !lastName|| !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"all fields required to fill "
            });
        }
    
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"password and confirm password are not matched"
            });
        }
    
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"user is already registered"
            });
        }
    
        const recentOtp= await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);
    
        if(recentOtp.length ==0){
            return res.status(400).json({
                success:false,
                message:"otp not found"
            })
        }else if(otp !==recentOtp){
            return res.status(400).json({
                success:false,
                message:"invalid otp"
            });
        }
    
        const hashedPassword = await bcrypt.hash(password,10);
    
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        })
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber, 
            password:hashedPassword, 
            accountType, 
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
            
        })

        return res.status(200).json({
            success:true,
            message:"User is registered successfully",
            user,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"user cannot be registered , try again later"
        })

    }
}

exports.login= async(req,res)=>{
    try{
         const {email,password}= req.body;
         if(!email ||!password){
            return res.status(403).json({
                success:false,
                message:"all feilds are required"
            });
         }
         const user = await User.findOne({email}).populate('additionalDetails');
         if(!user){
            return res.status(401).json({
                success:false,
                message:"user is not registered please registered first"
            })
         }

         if(await bcrypt.compare(password,user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            user.token= token;
            user.password= undefined;

            const options ={
                expires : new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true
            }

            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"logged in successfully"

            })
         }
         else{
            return res.status(401).json({
                success:false,
                message:"password is incorrect"
            })
         }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"login failure please try again"
        })
    }
}

exports.changePassword = async(req,res)=>{
    try{
        const {email,oldPassword, newpassword, confirmNewPassword} = req.body;
    if (!email||!oldPassword || !newpassword || !confirmNewPassword){
        return res.status(403).json({
            success:false,
            message:"all fields required to fill "
        });
    }
    const user = await User.findOne({email})
    if(await bcrypt.compare(oldPassword,user.password)){
        const user = await User.findOneAndUpdate({email},
            {
                password:newpassword
            })
        await mailSender(email,"password updation", "password updated successfully");

        return res.status(200).json({
            success:true,
            message:"password updated"
        })
    }
    else{
        return res.status(403).json({
            success:false,
            message:"incorrect password entered during updation"
        })
    }

    }

    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"password updation failure, please try again later"
        })
    }
}
