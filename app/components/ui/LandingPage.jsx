import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";


const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl w-full space-y-8"
            >
                <h1 className="text-5xl sm:text-6xl font-bold text-blue-600">
                    Campus
                </h1>

                {/* Animated message bubbles */}
                <div className="space-y-4">
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                        className="bg-blue-600 text-white rounded-3xl p-6 shadow-lg relative"
                    >
                        <p className="text-2xl font-semibold">Buy Mac or iPad for college</p>
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/1/1b/MacBook_Air_M2.png"
                            alt="MacBook"
                            className="absolute -top-6 right-4 w-20 sm:w-28"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
                        className="bg-blue-600 text-white rounded-3xl p-4 shadow-lg flex items-center space-x-2"
                    >
                        <span className="text-2xl">🎓</span>
                        <p className="text-xl font-medium">with education savings</p>
                    </motion.div>

                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, delay: 0.6 }}
                        className="bg-blue-600 text-white rounded-3xl p-6 shadow-lg"
                    >
                        <p className="text-2xl font-semibold">
                            Choose AirPods or an eligible accessory
                        </p>
                    </motion.div>
                </div>

                {/* Sign Up Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/signup")}
                    className="mt-10 px-8 py-4 cursor-pointer bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition"
                >
                    Sign Up
                </motion.button>
            </motion.div>
        </div>
    );
};

export default LandingPage;
