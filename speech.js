// speech.js - Speech feedback for Jacob's Chess Adventure

class ChessSpeech {
  constructor() {
    this.enabled = true;
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.loadVoice();
  }

  loadVoice() {
    const setVoice = () => {
      const voices = this.synth.getVoices();
      
      // Try to find the best kid-friendly voice
      this.voice = voices.find(v => v.name.includes('Samantha')) ||
                   voices.find(v => v.name.includes('Google US English')) ||
                   voices.find(v => v.name.includes('Microsoft Zira')) ||
                   voices.find(v => v.lang.startsWith('en-US')) ||
                   voices.find(v => v.lang.startsWith('en')) ||
                   voices[0];
      
      console.log('Selected voice:', this.voice?.name);
    };

    if (this.synth.getVoices().length > 0) {
      setVoice();
    } else {
      this.synth.addEventListener('voiceschanged', setVoice);
    }
  }

  speak(text, options = {}) {
    if (!this.enabled || !text) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Kid-friendly settings
    utterance.rate = options.rate || 0.95;
    utterance.pitch = options.pitch || 1.1;
    utterance.volume = options.volume || 1;
    
    if (this.voice) {
      utterance.voice = this.voice;
    }

    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }

    this.synth.speak(utterance);
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.synth.cancel();
    }
    return this.enabled;
  }

  stop() {
    this.synth.cancel();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.synth.cancel();
    }
  }
}

// Create singleton instance
const chessSpeech = new ChessSpeech();

// Helper functions for common chess announcements
function speakWelcome() {
  chessSpeech.speak("Hey Jacob! Ready to play some chess? You're white. Click a piece to start!");
}

function speakEncouragement() {
  const messages = [
    "Great move, Jacob!",
    "Nice thinking!",
    "Awesome job, champ!",
    "You're doing great!",
    "Smart move!",
    "Way to go!",
    "Excellent choice!",
    "Keep it up, Jacob!",
    "You're getting really good at this!",
    "Brilliant move!"
  ];
  
  const message = messages[Math.floor(Math.random() * messages.length)];
  chessSpeech.speak(message);
}

function speakCapture() {
  const messages = [
    "Amazing capture, Jacob!",
    "Great capture! You got their piece!",
    "Nice capture!",
    "Boom! Piece captured!",
    "Excellent! You captured their piece!",
    "Way to go! That's a capture!",
    "Outstanding capture, Jacob!"
  ];
  
  const message = messages[Math.floor(Math.random() * messages.length)];
  chessSpeech.speak(message);
}

function speakCheck(isJacobInCheck = true) {
  if (isJacobInCheck) {
    chessSpeech.speak("Check! Protect your king, Jacob!");
  } else {
    chessSpeech.speak("Nice! You put them in check!");
  }
}

function speakCheckmate(jacobWon = true) {
  if (jacobWon) {
    chessSpeech.speak("Checkmate! You won, Jacob! Amazing job!", {
      rate: 0.85,
      pitch: 1.2
    });
  } else {
    chessSpeech.speak("Checkmate. Good try, Jacob! Want to play again?");
  }
}

function speakPromotion() {
  chessSpeech.speak("Awesome! Your pawn made it to the end! Choose what piece you want!");
}

function speakInvalidMove() {
  const messages = [
    "Oops, that move isn't allowed. Try another one!",
    "That piece can't move there. Pick a different spot!",
    "Not quite! Try moving somewhere else."
  ];
  
  const message = messages[Math.floor(Math.random() * messages.length)];
  chessSpeech.speak(message);
}

function speakComputerMove(piece, to) {
  const pieceNames = {
    '♔': 'King', '♕': 'Queen', '♖': 'Rook', '♗': 'Bishop', '♘': 'Knight', '♙': 'Pawn',
    '♚': 'King', '♛': 'Queen', '♜': 'Rook', '♝': 'Bishop', '♞': 'Knight', '♟': 'Pawn'
  };
  
  const pieceName = pieceNames[piece] || 'Piece';
  chessSpeech.speak(`Chess Buddy moved ${pieceName} to ${to}`);
}

function speakTurn(isJacobTurn = true) {
  if (isJacobTurn) {
    chessSpeech.speak("Your turn, Jacob!");
  } else {
    chessSpeech.speak("Chess Buddy is thinking...");
  }
}

function speakNewGame() {
  chessSpeech.speak("New game! Let's go, Jacob!");
}

function speakStalemate() {
  chessSpeech.speak("It's a draw! Neither side can win. Good game, Jacob!");
}

function speakCastling() {
  chessSpeech.speak("Nice castling! Your king is safer now!");
}

function speakAchievement(name) {
  chessSpeech.speak(`Achievement unlocked! ${name}!`, {
    rate: 0.9,
    pitch: 1.2
  });
}
