// speech.js - Speech feedback for Jacob's Chess Adventure
// Using ElevenLabs for natural-sounding voice

class ChessSpeech {
  constructor() {
    this.enabled = true;
    this.apiKey = 'sk_e65862fb46e3c95ea3aed082aa3e5e0b68466ac087819660';
    // Bella voice - friendly and warm
    this.voiceId = 'EXAVITQu4vr4xnSDxMaL';
    this.audioCache = new Map();
    this.currentAudio = null;
    this.isPlaying = false;
    this.queue = [];
    
    // Fallback to Web Speech API
    this.synth = window.speechSynthesis;
    this.fallbackVoice = null;
    this.loadFallbackVoice();
  }

  loadFallbackVoice() {
    const setVoice = () => {
      const voices = this.synth.getVoices();
      this.fallbackVoice = voices.find(v => v.name.includes('Samantha')) ||
                           voices.find(v => v.lang.startsWith('en-US')) ||
                           voices[0];
    };
    if (this.synth.getVoices().length > 0) {
      setVoice();
    } else {
      this.synth.addEventListener('voiceschanged', setVoice);
    }
  }

  async speak(text, options = {}) {
    if (!this.enabled || !text) return;

    // Stop any current speech
    this.stop();

    try {
      // Check cache first
      const cacheKey = text.toLowerCase().trim();
      let audioBlob = this.audioCache.get(cacheKey);
      
      if (!audioBlob) {
        // Call ElevenLabs API
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        });

        if (!response.ok) {
          throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        audioBlob = await response.blob();
        // Cache for reuse (limit cache size)
        if (this.audioCache.size > 50) {
          const firstKey = this.audioCache.keys().next().value;
          this.audioCache.delete(firstKey);
        }
        this.audioCache.set(cacheKey, audioBlob);
      }

      // Play the audio
      const audioUrl = URL.createObjectURL(audioBlob);
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = options.volume || 1;
      
      this.currentAudio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        this.isPlaying = false;
        if (options.onEnd) options.onEnd();
      };
      
      this.currentAudio.onerror = () => {
        this.fallbackSpeak(text, options);
      };

      this.isPlaying = true;
      await this.currentAudio.play();
      
    } catch (error) {
      console.warn('ElevenLabs failed, using fallback:', error.message);
      this.fallbackSpeak(text, options);
    }
  }

  fallbackSpeak(text, options = {}) {
    // Use Web Speech API as fallback
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.95;
    utterance.pitch = options.pitch || 1.1;
    if (this.fallbackVoice) utterance.voice = this.fallbackVoice;
    if (options.onEnd) utterance.onend = options.onEnd;
    this.synth.speak(utterance);
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) this.stop();
    return this.enabled;
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.synth.cancel();
    this.isPlaying = false;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stop();
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
