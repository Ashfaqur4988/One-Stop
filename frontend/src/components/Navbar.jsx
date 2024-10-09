import { Lock, LogIn, LogOut, ShoppingCart, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";

const Navbar = () => {
  //TODO: user & admin to be dynamic
  const { user, logout } = useUserStore();
  const isAdmin = user?.role === "admin";
  return (
    <header className="fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-blue-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-between items-center">
          <Link
            to={"/"}
            className="text-2xl font-bold text-blue-400 items-center space-x-2 flex"
          >
            One Stop
          </Link>
          <nav className="flex flex-wrap items-center gap-4">
            <Link
              to={"/"}
              className="text-gray-300 hover:text-blue-400 transition duration-300 ease-in-out"
            >
              Home
            </Link>
            {user && (
              <Link to={"/cart"} className="relative group">
                <ShoppingCart
                  className="inline-block mr-1 group-hover:text-blue-400"
                  size={20}
                />
                <span className="hidden sm:inline">Cart</span>
                <span className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs group-hover:bg-blue-400 transition duration-300 ease-in-out">
                  3
                </span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to={"/admin-dashboard"}
                className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center"
              >
                <Lock className="inline-block mr-1" size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}

            {user ? (
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center">
                <LogOut size={18} />
                <span className="hidden sm:inline" onClick={logout}>
                  Log Out
                </span>
              </button>
            ) : (
              <>
                <Link
                  to={"/signup"}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center"
                >
                  Sign Up
                  <UserPlus className="mr-2" size={18} />
                </Link>
                <Link
                  to={"/login"}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md font-medium transition duration-300 ease-in-out flex items-center"
                >
                  Login
                  <LogIn className="mr-2" size={18} />
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
