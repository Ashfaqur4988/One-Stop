import Product from "../model/product.model.js";
import cloudinary from "../utils/cloudinary.js";
import { redis } from "../utils/redis.js";
import dotenv from "dotenv";

dotenv.config();

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ products });
  } catch (error) {
    console.log("error in getAllProducts controller:", error.message);
  }
};

export const featuredProducts = async (req, res) => {
  try {
    //if present in redis
    let featuredProducts = await redis.get("featuredProducts");
    if (featuredProducts) {
      return res.status(200).json(JSON.parse(featuredProducts));
    }
    //else from database
    //lean -> returns js object instead of mongoose document, good for performance
    featuredProducts = await Product.find({ isFeatured: true }).lean();
    if (!featuredProducts) {
      return res.status(404).json({ message: "Featured products not found" });
    }
    //set in redis
    await redis.set("featuredProducts", JSON.stringify(featuredProducts));
    //send response
    res.status(200).json(products);
  } catch (error) {
    console.log("error in featuredProducts controller:", error.message);
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log(process.env.CLOUDINARY_SECRET_KEY);
    console.log(process.env.CLOUDINARY_API_KEY);
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(400).json({ message: "product not found" });
    }

    //product image should be deleted from cloudinary
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; //this will get the id of the image
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("image deleted successfully");
      } catch (error) {
        console.log(error.message);
      }
    }
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "product deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to delete product" });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 3 } },
      { $project: { _id: 1, name: 1, image: 1, price: 1 } },
    ]);

    res.status(200).json(products);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to get recommended products" });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.find({ category });
    res.status(200).json({ products });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to get products by category" });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.isFeatured = !product.isFeatured;
    const updatedProduct = await product.save();

    //update in redis
    await updateFeaturedProductCache();
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to toggle featured product" });
  }
};

const updateFeaturedProductCache = async () => {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featuredProducts", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error in update cache ", error.message);
  }
};
