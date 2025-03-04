import { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import getDoc to check existing users
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2 for alerts
import logo from "../assets/Ratthi.png"; // Add your logo image path

const Register = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState(""); // State to handle validation errors
  const [loading, setLoading] = useState(false); // State to handle loading state
  const navigate = useNavigate();

  // Validate Sri Lankan mobile numbers
  const validateMobileNumber = (number) => {
    // Sri Lankan mobile numbers start with 07 and have 10 digits
    const regex = /^07\d{8}$/;
    return regex.test(number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate mobile number
    if (!validateMobileNumber(mobile)) {
      setError("Please enter a valid Sri Lankan mobile number (e.g., 0712345678).");
      return;
    }

    setLoading(true); // Set loading to true when form is submitted

    try {
      // Check if the user is already registered
      const userDoc = await getDoc(doc(db, "users", mobile));
      if (userDoc.exists()) {
        setError("This mobile number is already registered.");
        setLoading(false); // Reset loading state
        return;
      }

      // Save user details in Firestore
      await setDoc(doc(db, "users", mobile), {
        name,
        mobile,
        time: null, // Initialize time as null
      });

      // Show success message
      Swal.fire({
        title: "Success!",
        text: "Registration successful!",
        icon: "success",
        iconColor: '#c20006',
        confirmButtonColor: '#c20006',
        confirmButtonText: "OK",
      }).then(() => {
        // Redirect to the puzzle page
        navigate("/puzzle", { state: { mobile } });
      });
    } catch (error) {
      console.error("Error saving user data:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to register. Please try again.",
        icon: "error",
        iconColor: '#c20006',
        confirmButtonColor: '#c20006',
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-400 to-yellow-500 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-40" />
        </div>

        {/* Display error message if any */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-100"
            required
          />
          <input
            type="tel"
            placeholder="Mobile Number (e.g., 0712345678)"
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value);
              setError(""); // Clear error when user types
            }}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-100"
            required
          />
          <button
            type="submit"
            disabled={loading} // Disable button when loading
            className="w-full bg-red-700 text-white py-3 rounded-lg hover:bg-red-800 transition duration-300 font-semibold text-lg flex items-center justify-center"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Register"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;