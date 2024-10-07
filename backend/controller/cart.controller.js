import Product from "../model/product.model.js";
import User from "../model/user.model.js";

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // find the user
    const user = await User.findById(userId);

    // check if the product is in the cart
    const existingItem = user.cartItems.find((item) => item.id === productId);

    // if already present in cart then increment the quantity
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      // if not present then add to cart
      user.cartItems.push(productId);
    }
    // save the user
    await user.save();
    res.status(200).json({ message: "Product added to cart" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to add to cart" });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user.id;
    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }

    await user.save();
    res.status(200).json({ message: "Product removed from cart" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to remove from cart" });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      if (quantity === 0) {
        //if the item is 0 then remove that item from the cart
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        return res.status(200).json(user.cartItems);
      }

      existingItem.quantity = quantity;
      await user.save();
      res.status(200).json(user.cartItems);
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to update quantity" });
  }
};

export const getCartProducts = async () => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });

    //add the quantity for each product (calculate)
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product.id
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });
    res.status(200).json(cartItems);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to get cart products" });
  }
};
