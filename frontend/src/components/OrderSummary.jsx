import { IndianRupee, MoveRight } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const OrderSummary = () => {
  const { total, subTotal, coupon, isApplied } = useCartStore();
  const savings = subTotal - total;
  //   const formattedSubtotal = subtotal.toFixed(2);
  //   const formattedSavings = savings.toFixed(2);
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

          {coupon && isApplied && (
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
          //   onClick={handlePayment}
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
