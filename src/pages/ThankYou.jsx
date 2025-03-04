import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png"; // Add your logo image path

const ThankYou = () => {
  const location = useLocation();
  const { score, timeLeft } = location.state || {}; // Get score and timeLeft from navigation state

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-red-400 to-yellow-500 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-40" />
        </div>
        <h1 className="text-4xl font-extrabold text-red-600 mb-4">Thank You!</h1>
        <p className="text-lg text-gray-700 mb-2">
          {score !== undefined
            ? `You scored ${score} points!`
            : "Thank you for playing the puzzle game!"}
        </p>
        <p className="text-sm text-gray-500">
          Thank you for participating in our puzzle game. We hope you had fun!
        </p>
      </div>
    </div>
  );
};

export default ThankYou;
