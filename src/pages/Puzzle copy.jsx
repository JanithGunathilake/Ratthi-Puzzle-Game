import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2"; // Import SweetAlert2

const Puzzle = () => {
  const [timeLeft, setTimeLeft] = useState(180); // 2 minutes timer
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [puzzlePieces, setPuzzlePieces] = useState([]);
  const [shuffledPieces, setShuffledPieces] = useState([]);
  const [score, setScore] = useState(0);
  const [emptyIndex, setEmptyIndex] = useState(8); // Index of the empty box (Box 9)
  const [gameOver, setGameOver] = useState(false); // Track game-over state
  const navigate = useNavigate();
  const location = useLocation();
  const mobile = location.state?.mobile; // Get mobile number from navigation state

  const puzzleImage = "/photo.jpg"; // The image to split into pieces

  // Split the image into pieces (3x3 grid)
  const splitImage = () => {
    const pieces = [];
    const rows = 3;
    const cols = 3;
    const pieceWidth = 100;
    const pieceHeight = 100;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        pieces.push({
          id: i * cols + j,
          x: j * pieceWidth,
          y: i * pieceHeight,
          correctPosition: { x: j, y: i }, // Correct position in the grid
        });
      }
    }
    return pieces;
  };

  // Shuffle pieces randomly, leaving Box 9 (index 8) empty
// Shuffle pieces randomly, ensuring the puzzle is solvable
const shufflePieces = (pieces) => {
  let shuffled = [...pieces];
  shuffled[8] = null; // Set Box 9 as empty

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 2; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Count the number of inversions
  const countInversions = (arr) => {
    let inversions = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] && arr[j] && arr[i].id > arr[j].id) {
          inversions++;
        }
      }
    }
    return inversions;
  };

  let inversions = countInversions(shuffled);

  // If the number of inversions is odd, swap two non-empty tiles to make it even
  if (inversions % 2 !== 0) {
    // Find the first two non-empty tiles and swap them
    let index1 = -1, index2 = -1;
    for (let i = 0; i < shuffled.length; i++) {
      if (shuffled[i] !== null) {
        if (index1 === -1) {
          index1 = i;
        } else {
          index2 = i;
          break;
        }
      }
    }
    [shuffled[index1], shuffled[index2]] = [shuffled[index2], shuffled[index1]];
  }

  return shuffled;
};

  // Check if the puzzle is solved
  const checkPuzzleSolved = () => {
    // Ensure the empty box is at index 8
    if (shuffledPieces[8] !== null) {
      return false;
    }

    // Check all other pieces (indices 0-7)
    for (let i = 0; i < shuffledPieces.length - 1; i++) {
      if (shuffledPieces[i] === null) return false; // No other empty boxes allowed

      const expectedX = i % 3; // Column index
      const expectedY = Math.floor(i / 3); // Row index

      // Compare the piece's correct position with the expected position
      if (
        shuffledPieces[i].correctPosition.x !== expectedX ||
        shuffledPieces[i].correctPosition.y !== expectedY
      ) {
        return false;
      }
    }
    return true; // Puzzle is solved
  };

  // Handle piece click
  const handlePieceClick = (index) => {
    if (gameOver) return; // Disable interaction if the game is over

    const newShuffledPieces = [...shuffledPieces];

    // Check if the clicked piece is adjacent to the empty box
    const isAdjacent =
      Math.abs(index - emptyIndex) === 1 || // Left or right
      Math.abs(index - emptyIndex) === 3; // Top or bottom

    if (isAdjacent) {
      // Swap the clicked piece with the empty box
      newShuffledPieces[emptyIndex] = newShuffledPieces[index];
      newShuffledPieces[index] = null;
      setShuffledPieces(newShuffledPieces);
      setEmptyIndex(index);
    }
  };

  // Start the puzzle game by splitting the image and shuffling the pieces
  useEffect(() => {
    const pieces = splitImage();
    setPuzzlePieces(pieces);
    setShuffledPieces(shufflePieces(pieces, 3));
  }, []);

  // Check if the puzzle is solved whenever shuffledPieces changes
  useEffect(() => {
    if (checkPuzzleSolved()) {
      setPuzzleSolved(true);
      const score = timeLeft * 10 + 100; // Calculate score based on time left
      setScore(score);
      setGameOver(true); // End the game when the puzzle is solved

      // Show success popup
      Swal.fire({
        title: "Congratulations!",
        text: `You solved the puzzle with ${timeLeft} seconds left!`,
        icon: "success",
        confirmButtonColor: '#c20006',
        confirmButtonText: "OK",
      }).then(() => {
        handlePuzzleSubmit(score); // Submit score
      });
    }
  }, [shuffledPieces]); // Run this effect whenever shuffledPieces changes

  // Timer countdown to limit the time to solve the puzzle
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 0) {
          // Notify when 10 seconds are left
          if (prev === 15) {
            Swal.fire({
              title: "Hurry Up!",
              text: "Only 15 seconds left!",
              icon: "warning",
              iconColor: '#c20006',
              timer: 1000, // Auto-close after 2 seconds
              showConfirmButton: false,
            });
          }

          return prev - 1;
        } else {
          clearInterval(timer);
          setGameOver(true); // Trigger game-over when time runs out

          // Calculate score based on correctly placed pieces
          const score = calculatePartialScore();
          setScore(score);

          // Show game-over popup
          Swal.fire({
            title: "Game Over!",
            text: `You scored ${score} points!`,
            icon: "error",
            iconColor: '#c20006',
            confirmButtonColor: '#c20006',
            confirmButtonText: "OK",
          }).then(() => {
            handlePuzzleSubmit(score); // Submit partial score
          });

          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, timeLeft]); // Add timeLeft as a dependency

  // Calculate the score based on correctly placed pieces
  const calculatePartialScore = () => {
    let correctCount = 0;
    for (let i = 0; i < puzzlePieces.length; i++) {
      if (shuffledPieces[i] === null) continue; // Skip the empty box

      // Expected position for the current index
      const expectedX = i % 3; // Column index
      const expectedY = Math.floor(i / 3); // Row index

      // Check if the piece is in the correct position
      if (
        shuffledPieces[i] &&
        shuffledPieces[i].correctPosition.x === expectedX &&
        shuffledPieces[i].correctPosition.y === expectedY
      ) {
        correctCount++;
      }
    }
    // Calculate percentage of correctly placed pieces
    const percentage = (correctCount / 8) * 100; // 8 pieces (excluding the empty box)
    return Math.round(percentage); // Round to the nearest integer
  };

  // Handle puzzle submission after completion
  const handlePuzzleSubmit = async (score) => {
    try {
      await updateDoc(doc(db, "users", mobile), {
        time: 120 - timeLeft,
        score,
      });

      // Redirect to Thank You page
      navigate("/thank-you", { state: { score, timeLeft } });
    } catch (error) {
      console.error("Error updating user data:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to submit your score. Please try again.",
        icon: "error",
        iconColor: '#c20006',
        confirmButtonColor: '#c20006',
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 relative">
      <h1 className="text-2xl font-bold mb-4">Puzzle Page</h1>
      <p className="text-lg mb-2">Time Left: {timeLeft} seconds</p>

      {/* Puzzle Grid */}
      <div className="grid grid-cols-3 gap-1 w-80 h-80 mb-6">
        {Array(9)
          .fill(null)
          .map((_, index) => (
            <div
              key={index}
              className="w-24 h-24 border border-gray-300 bg-gray-200 flex items-center justify-center"
              onClick={() => handlePieceClick(index)}
            >
              {shuffledPieces[index] && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${puzzleImage})`,
                    backgroundPosition: `-${shuffledPieces[index].x}px -${shuffledPieces[index].y}px`,
                  }}
                ></div>
              )}
              {/* Hide the empty box when the puzzle is solved */}
              {puzzleSolved && index === 8 && (
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${puzzleImage})`,
                    backgroundPosition: `-${puzzlePieces[8].x}px -${puzzlePieces[8].y}px`,
                  }}
                ></div>
              )}
            </div>
          ))}
      </div>

      {/* Small Reference Image in Bottom-Right Corner */}
      <div className="absolute bottom-4 right-4">
        <img
          src={puzzleImage}
          alt="Puzzle Reference"
          className="w-24 h-24 border border-gray-300 rounded-lg shadow-md"
        />
        <p className="text-center mt-1 text-sm text-gray-600">Reference</p>
      </div>
    </div>
  );
};

export default Puzzle;