const Section = require('../models/Section')
const Course = require('../models/Course');

exports.createSection = async(req,res)=>{
    try{
        const {sectionName, courseId}= req.body;

        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"missing properties for section"
            });

        }

        const newSection = await Section.create({sectionName});
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,{ 
                                                                        $push:{
                                                                            courseContent:newSection._id,
                                                                        }  
                                           
        },{new:true}).populate();

        return res.status(200).json({
            success:true,
            message:"Section created successfull",
            updatedCourseDetails,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"unable to create section please try again",
            error:error.message
        });
     }
}

exports.updateSection = async(req,res)=>{
    try{
        const {sectionName, sectionId}= req.body;
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"missing properties "
            });

        }

        const section = await Section.findByIdAndUpdate(sectionId, { sectionName},{new:true});
        return res.status(200).json({
            success:true,
            message:"section updated successfully"
        })
        

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"unable to create section please try again",
            error:error.message
        });
    }

}

exports.deleteSection= async(req,res)=>{
    try{
        const {sectionId}= req.params;

        await Section.findByIdAndDelete(sectionId);
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully"
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"unable to delete section please try again",
            error:error.message
        });
    }
}