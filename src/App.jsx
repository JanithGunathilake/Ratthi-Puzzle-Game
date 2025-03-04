// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Puzzle from "./pages/Puzzle";
import Leaderboard from "./pages/Leaderboard";
import ThankYou from "./pages/ThankYou"; // Import the ThankYou component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/puzzle" element={<Puzzle />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/thank-you" element={<ThankYou />} /> {/* Add ThankYou route */}
      </Routes>
    </Router>
  );
}

export default App;