import Coupon from "../model/coupon.model.js";
import Order from "../model/order.model.js";
import stripe from "../utils/stripe.js";

//user will send a request to this and try to create a check out session
export const createCheckOutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    //checking if product is an array
    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or empty products array" });
    }

    let totalAmount = 0;

    //creating line items for stripe
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); //100 = 1 rupee in stripe
      totalAmount = totalAmount + amount * product.quantity; //calculate total amount

      return {
        price_data: "inr",
        product_data: {
          name: product.name,
          images: [product.image],
        },
        unit_amount: amount,
      };
    });

    //checking if coupon is used
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });

      //if there is a valid coupon
      if (coupon) {
        totalAmount =
          totalAmount -
          Math.round((totalAmount * coupon.discountPercentage) / 100);
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/success?session_id=${CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-failed`,
      discounts: coupon
        ? [{ coupon: await createStripeCoupon(coupon.discountPercentage) }]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(products.map((p)=>({id: p._id, quantity: p.quantity, price: p.price}))),
      },
    });

    if(totalAmount >= 20000){
        await createNewCoupon(req.user._id);
    }
    res.status(200).json({session_id: session.id, totalAmount: totalAmount / 100});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Unable to create checkout session" });
  }
};

//creating stripe coupon and returning coupon id
const createStripeCoupon = async (discountPercentage) => {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });

  return coupon.id;
};

//creating new coupon and saving in db
const createNewCoupon = async (userId)=>{
    const newCoupon = new Coupon({
        code:"GIFT" + Math.random().toString(36).substring(2,8).toUpperCase(),
        discountPercentage:10,
        expirationDate: new Date(Date.now()  = 30 * 24 * 60 *60 *1000), //30 days from now
        userId: userId
    })

    await newCoupon.save();
    return newCoupon;
}


export const checkoutSuccess = async (req, res) => {
    try {
        const {sessionId} = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if(session.payment_status === "paid"){
            if(session.metadata.couponCode){
                await Coupon.findOneAndUpdate({
                    code: session.metadata.couponCode,
                    userId: session.metadata.userId,
                }, {isActive: false});
            }
            //create a new order because the payment just got done
            const products = JSON.parse(session.metadata.products)
            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map((product)=>({product: product.id, 
                    quantity: product.quantity, 
                    price: product.price})),
                    totalAmount: session.amount_total / 100, //convert to rupees from paise
                    stripeSessionId: sessionId
                })

                await newOrder.save();
                res.status(200).json({message: "Order created successfully", success: true, orderId: newOrder._id});
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Unable to checkout success" });
    }
}