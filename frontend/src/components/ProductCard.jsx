import { IndianRupee, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";

/* eslint-disable react/prop-types */
const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  const { user } = useUserStore();
  const navigate = useNavigate();
  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add to cart", { id: "login" });
      navigate("/login");
      return;
    } else {
      addToCart(product);
    }
  };
  return (
    <div className="flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg">
      <div className="relative mx-3 flex h-60 overflow-hidden rounded-xl mt-3">
        <img
          className="object-cover w-full"
          src={product.image}
          alt="product-image"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>
      <div className="mt-4 px-5 pb-5">
        <h5 className="text-xl font-semibold tracking-tight text-white">
          {product.name}
        </h5>
        <div className="mt-2 mb-5 flex items-center justify-between">
          <p>
            <span className="text-3xl font-bold text-blue-400 flex items-center">
              <IndianRupee />
              {product.price}
            </span>
          </p>
        </div>
        <button
          className="flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium
					 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={22} className="mr-2" />
          Add to cart
        </button>
      </div>
    </div>
  );
};
export default ProductCard;
