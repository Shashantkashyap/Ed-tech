const Course = require('../models/Course');
const Category = require('../models/Category');

const User = require('../models/User')
const {uploadImageToCloudinary}= require('../utills/imageUploader');

exports.createCourse = async(req,res)=>{
     try{
        const {courseName, courseDescription, whatYouWillLearn, price, category, tag}= req.body;

        const thumbnail = req.file.thumbnailImage;
        
        if(!courseName || !courseDescription|| !whatYouWillLearn|| !price|| !tag){
            return res.status(400).json({
                success:false,
                message:"all fields are required"
            });
        }

        const userId = req.user.id;
        const instructorDetail = await User.findById(userId);
        console.log("Instructor Details:", instructorDetail);

        if(!instructorDetail){
            return res.status(404).json({
                success:false,
                message:"Instructor details  not found"
            })
        }
        const categoryDetails= await Category.findById(tag);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"Tag details  not found"
            });
        }
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetail._id,
            whatYouWillLearn,
            price,
            category:categoryDetails._id,
            tag,
            thumbnail:thumbnailImage.secure_url,
        });

        await User.findByIdAndUpdate({_id:instructorDetail._id},
            {
                $push:{
                    courses:newCourse._id,
                }
            },
            {new:true}
            )

            return res.status(200).json({
                success:true,
                message:"Course created success fully",
                data:newCourse
            })
     }
     catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"failed to create courses",
            error:error.message
        });
     }
}

exports.showAllCourses = async(req,res)=>{
    try{
        const allCourses = await Course.find({});

        return res.status(200).json({
            success:true,
            message:"Data found successfully",
            data:allCourses
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"failed to fetch the courses",
            error:error.message
        });
     }
    
}