import { IndianRupee, MoveRight } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";

// Load Stripe on window object
const stripePromise = loadStripe(
  "pk_test_51O1rvUSDzmJr8Dy95EJSp4C8g9lKbCtvLTokWPeye6hY4qMnoY1LAyFrrxeoCTLngrzhtRYVdEe80Lkpq8KhPkTo002bnSgGbM"
);

const OrderSummary = () => {
  const { total, subTotal, cart } = useCartStore();
  const savings = subTotal - total;

  const handlePayment = async () => {
    const stripe = await stripePromise;

    // Gather customer information
    //TODO: make this come from user
    const customer = {
      name: "Customer Name", // Replace with actual customer name from input
      address: {
        line1: "Address Line 1", // Replace with actual address line 1
        line2: "Address Line 2", // Optional: Replace with actual address line 2
        city: "City", // Replace with actual city
        state: "State", // Replace with actual state
        country: "IN", // ISO 3166-1 alpha-2 code for India
        postalCode: "Postal Code", // Replace with actual postal code
      },
    };

    try {
      const res = await axios.post(`/payments/create-checkout-session`, {
        products: cart,
        customer: customer, // Include the customer object
      });

      // Redirect to Stripe checkout
      const { session_id } = res.data;
      const result = await stripe.redirectToCheckout({ sessionId: session_id });

      if (result.error) {
        // Handle error here
        console.error(result.error.message);
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      // Optionally show a user-friendly error message
    }
  };

  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xl font-semibold text-blue-400">Order Summary</p>
      <div className="space-y-4">
        <div className="space-y-2">
          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-300">
              Original Price
            </dt>
            <dt className="text-base font-medium text-blue-400 flex items-center">
              <IndianRupee size={16} />
              {subTotal.toFixed(2)}
            </dt>
          </dl>

          {savings > 0 && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">
                Original Price
              </dt>
              <dt className="text-base font-medium text-blue-400 flex items-center">
                <IndianRupee size={16} />
                {savings.toFixed(2)}
              </dt>
            </dl>
          )}

          {/* {coupon && isApplied && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">
                Original Price
              </dt>
              <dt className="text-base font-medium text-blue-400 flex items-center">
                <IndianRupee size={16} />
                {savings.toFixed(2)}
              </dt>
            </dl>
          )} */}
          <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
            <dt className="text-base font-bold text-white">Total</dt>
            <dd className="text-base font-bold text-blue-400 flex items-center">
              <IndianRupee size={16} />
              {total.toFixed(2)}
            </dd>
          </dl>
        </div>
        <motion.button
          className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePayment}
        >
          Proceed to Checkout
        </motion.button>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-normal text-gray-400">or</span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 underline hover:text-blue-300 hover:no-underline"
          >
            Continue Shopping
            <MoveRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
export default OrderSummary;
