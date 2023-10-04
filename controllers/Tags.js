
const Category = require('../models/Category');

exports.createCategory= async(req,res)=>{
    try{
        const {name,description}= req.body;
        if(!name ||!description){
            return res.status(400).json({
                success:false,
                message:"all feilds are required to fill"
            })
        }

        const categoryDetails = await Category.create({
            name:name,
            description:description
        });
        console.log(categoryDetails);

        return res.status(200).json({
            success:true,
            message:"Category created successfully"
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

exports.showAllCategories = async(req,res)=>{
    try{
        const allCategories = await Category.find({},{name:true, description:true});
        res.status(200).json({
            success:true,
            message:"All Categorys returned successfully",
            allCategories,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
    
}