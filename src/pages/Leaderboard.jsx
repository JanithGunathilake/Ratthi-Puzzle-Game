import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png"; // Add your logo image path

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [showQRPopup, setShowQRPopup] = useState(false);

  useEffect(() => {
    // Query to fetch users sorted by score in descending order
    const q = query(collection(db, "users"), orderBy("score", "desc"));

    // Real-time listener for Firestore updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Include document ID for unique key
        ...doc.data(), // Spread all user data
      }));
      setUsers(userList);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const toggleQRPopup = () => {
    setShowQRPopup(!showQRPopup);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-yellow-600 text-white p-8 flex flex-col items-center">
      {/* QR Button */}
      <button
        onClick={toggleQRPopup}
        className="absolute top-4 left-4 bg-yellow-700 text-white px-4 py-2 rounded-lg hover:bg-yellow-900 transition-colors"
      >
        Show QR
      </button>

      {/* QR Popup (Full Page) */}
      <AnimatePresence>
        {showQRPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center"
            onClick={toggleQRPopup} // Close popup when clicking outside
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative w-full h-full flex justify-center items-center"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
            >
              {/* QR Code (Full Page) */}
              <img
                src="/qr.png"
                alt="QR Code"
                className="w-full h-full object-contain"
              />

              {/* Close Button */}
              <button
                onClick={toggleQRPopup}
                className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <img src={logo} alt="Logo" className="h-40 mb-6" />
      <h1 className="text-4xl font-bold text-center mb-8">
        🏆 Leaderboard 🏆
      </h1>

      {/* Leaderboard List */}
      <ul className="max-w-2xl w-full">
        <AnimatePresence>
          {users.map((user, index) => (
            <motion.li
              key={user.id} // Use Firestore document ID as key
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`mb-4 p-4 rounded-lg shadow-lg flex justify-between items-center transition-transform transform hover:scale-105 cursor-pointer ${
                index === 0
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
                  : index === 1
                  ? "bg-gradient-to-r from-red-500 to-red-700 text-white"
                  : "bg-gradient-to-r from-gray-700 to-gray-900"
              }`}
            >
              <span className="font-semibold text-xl">#{index + 1} - {user.name}</span>
              <span className="text-lg">Score: {user.score}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};

export default Leaderboard;