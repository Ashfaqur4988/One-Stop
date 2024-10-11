import Coupon from "../model/coupon.model.js";
import Order from "../model/order.model.js";
import stripe from "../utils/stripe.js";

//user will send a request to this and try to create a check out session
export const createCheckOutSession = async (req, res) => {
  try {
    const { products, customer } = req.body; // Extract customer info from request body

    // Validate if products array exists and is not empty
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Invalid or empty products array" });
    }

    // Validate if customer information is provided
    if (!customer || !customer.name || !customer.address) {
      return res.status(400).json({ message: "Customer name and address are required" });
    }

    let totalAmount = 0;

    // Create line items for Stripe
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // Convert to smallest currency unit
      totalAmount += amount * product.quantity; // Accumulate total amount

      return {
        price_data: {
          currency: "INR",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });

    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`, // This will be replaced with session.id later
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      metadata: {
        userId: req.user._id.toString(),
        customerName: customer.name, // Store customer name in metadata
        customerAddress: JSON.stringify(customer.address), // Store customer address in metadata
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
      shipping_address_collection: {
        allowed_countries: ['IN'], // Collect shipping address for India
      },
    });

    // Fix for session_id: Update success_url with the session.id
    const successUrl = `${process.env.CLIENT_URL}/purchase-success?session_id=${session.id}`;

    // Send the session ID and total amount to the client
    res.status(200).json({ session_id: session.id, totalAmount: totalAmount / 100, success_url: successUrl });
  } catch (error) {
    console.log(error.message, "from here");
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