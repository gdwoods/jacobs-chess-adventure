// Jacob's Chess Adventure - A fun chess game for learning!

// ===== SOUND EFFECTS SYSTEM =====
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('soundBtn');
    if (soundEnabled) {
        btn.textContent = '🔊 Sound';
        btn.classList.remove('muted');
        playSound('select');
    } else {
        btn.textContent = '🔇 Muted';
        btn.classList.add('muted');
    }
}

function playSound(type) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    
    switch(type) {
        case 'select':
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
            break;
        case 'move':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.15);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            oscillator.start(now);
            oscillator.stop(now + 0.15);
            break;
        case 'capture':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(400, now);
            oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);
            oscillator.frequency.setValueAtTime(600, now + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.2);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            oscillator.start(now);
            oscillator.stop(now + 0.25);
            break;
        case 'check':
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(880, now);
            oscillator.frequency.setValueAtTime(660, now + 0.1);
            oscillator.frequency.setValueAtTime(880, now + 0.2);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            oscillator.start(now);
            oscillator.stop(now + 0.3);
            break;
        case 'checkmate':
            playNote(523, 0, 0.15);
            playNote(659, 0.15, 0.15);
            playNote(784, 0.3, 0.15);
            playNote(1047, 0.45, 0.3);
            return;
        case 'gameOver':
            playNote(392, 0, 0.2);
            playNote(370, 0.2, 0.2);
            playNote(349, 0.4, 0.2);
            playNote(330, 0.6, 0.4);
            return;
        case 'castling':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(400, now);
            oscillator.frequency.exponentialRampToValueAtTime(500, now + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.2);
            oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.3);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
            oscillator.start(now);
            oscillator.stop(now + 0.35);
            break;
        case 'promotion':
            playNote(523, 0, 0.1);
            playNote(659, 0.08, 0.1);
            playNote(784, 0.16, 0.1);
            playNote(1047, 0.24, 0.2);
            return;
        case 'newGame':
            playNote(523, 0, 0.12);
            playNote(659, 0.1, 0.12);
            playNote(784, 0.2, 0.2);
            return;
        case 'undo':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, now);
            oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.2);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
            break;
        case 'hint':
            playNote(784, 0, 0.1);
            playNote(988, 0.1, 0.15);
            return;
        case 'achievement':
            playNote(523, 0, 0.1);
            playNote(659, 0.1, 0.1);
            playNote(784, 0.2, 0.1);
            playNote(1047, 0.3, 0.3);
            return;
    }
}

function playNote(frequency, delay, duration) {
    if (!audioCtx) return;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime + delay;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    oscillator.start(now);
    oscillator.stop(now + duration);
}

// ===== PIECE INFORMATION =====
const PIECE_INFO = {
    '♙': { name: 'Pawn', value: 1, moves: 'Moves forward 1 square, captures diagonally', special: 'Promotion, En Passant, Double move from start' },
    '♟': { name: 'Pawn', value: 1, moves: 'Moves forward 1 square, captures diagonally', special: 'Promotion, En Passant, Double move from start' },
    '♘': { name: 'Knight', value: 3, moves: 'Moves in an L-shape: 2+1 squares', special: 'Can jump over other pieces!' },
    '♞': { name: 'Knight', value: 3, moves: 'Moves in an L-shape: 2+1 squares', special: 'Can jump over other pieces!' },
    '♗': { name: 'Bishop', value: 3, moves: 'Moves diagonally any number of squares', special: 'Stays on same color squares' },
    '♝': { name: 'Bishop', value: 3, moves: 'Moves diagonally any number of squares', special: 'Stays on same color squares' },
    '♖': { name: 'Rook', value: 5, moves: 'Moves horizontally or vertically any distance', special: 'Used in Castling' },
    '♜': { name: 'Rook', value: 5, moves: 'Moves horizontally or vertically any distance', special: 'Used in Castling' },
    '♕': { name: 'Queen', value: 9, moves: 'Moves any direction, any distance', special: 'Most powerful piece!' },
    '♛': { name: 'Queen', value: 9, moves: 'Moves any direction, any distance', special: 'Most powerful piece!' },
    '♔': { name: 'King', value: '∞', moves: 'Moves 1 square in any direction', special: 'Castling, Must be protected!' },
    '♚': { name: 'King', value: '∞', moves: 'Moves 1 square in any direction', special: 'Castling, Must be protected!' }
};

// ===== ACHIEVEMENTS SYSTEM =====
const ACHIEVEMENTS = {
    firstWin: { id: 'firstWin', name: 'First Victory!', desc: 'Win your first game', icon: '🏆', earned: false },
    firstCapture: { id: 'firstCapture', name: 'Got One!', desc: 'Capture your first piece', icon: '⚔️', earned: false },
    fiveCaptures: { id: 'fiveCaptures', name: 'Collector', desc: 'Capture 5 pieces in one game', icon: '🎯', earned: false },
    checkmaster: { id: 'checkmaster', name: 'Check Master', desc: 'Put the enemy in check 3 times', icon: '👑', earned: false },
    castleKing: { id: 'castleKing', name: 'Safe King', desc: 'Castle your king', icon: '🏰', earned: false },
    promoteQueen: { id: 'promoteQueen', name: 'Promotion!', desc: 'Promote a pawn to queen', icon: '✨', earned: false },
    threeWins: { id: 'threeWins', name: 'Hat Trick', desc: 'Win 3 games', icon: '🎩', earned: false },
    tenGames: { id: 'tenGames', name: 'Dedicated', desc: 'Play 10 games', icon: '🌟', earned: false },
    quickWin: { id: 'quickWin', name: 'Speed Demon', desc: 'Win in under 20 moves', icon: '⚡', earned: false }
};

let playerStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    totalCaptures: 0,
    checksGiven: 0
};

let gameStats = {
    capturesThisGame: 0,
    checksThisGame: 0,
    moveCount: 0
};

// ===== PERSONALIZED MESSAGES FOR JACOB =====
const messages = {
    welcome: [
        "Hey Jacob! Ready to play some chess? You're White - click a piece to start!",
        "Welcome back, Jacob! Let's play some chess! You go first!",
        "Jacob's Chess Adventure begins! Show me what you've got!",
        "Hi Jacob! Time for some chess fun! Pick a piece to move!"
    ],
    welcomeTwoPlayer: [
        "Two player mode! White goes first!",
        "Play against your friend! White starts!"
    ],
    goodMove: [
        "Great move, Jacob! You're getting really good at this!",
        "Wow Jacob, that was smart! Keep it up!",
        "Nice thinking, Jacob! I like that move!",
        "Excellent choice, Jacob! You're learning fast!",
        "Jacob, that's exactly what a chess master would do!",
        "Super move, Jacob! You're on fire today!"
    ],
    capture: [
        "Awesome capture, Jacob! You got one of my pieces!",
        "Jacob scores! That piece is yours now!",
        "Ka-pow! Nice capture, Jacob!",
        "You caught my piece, Jacob! Well played!",
        "Gotcha! Great capture, Jacob!"
    ],
    check: [
        "CHECK! Jacob, you're attacking my King! Amazing!",
        "Whoa, CHECK! You're putting pressure on me, Jacob!",
        "CHECK! Watch out for my King, Jacob! Great job!"
    ],
    inCheck: [
        "Uh oh Jacob, your King is in CHECK! You need to protect him!",
        "Jacob, be careful! Your King is being attacked! Move him to safety!",
        "CHECK! Jacob, your King needs help! What will you do?"
    ],
    checkmate: [
        "CHECKMATE! Jacob, you WON! You're a chess champion!",
        "Incredible, Jacob! CHECKMATE! You beat me fair and square!",
        "WOW! CHECKMATE! Jacob, you're officially amazing at chess!"
    ],
    checkmated: [
        "CHECKMATE! Good game, Jacob! Want to try again? I know you can beat me!",
        "Oops, I got you this time, Jacob. But you played great! Let's play again!",
        "Checkmate! Don't worry Jacob, even chess masters lose sometimes. Ready for revenge?"
    ],
    stalemate: [
        "It's a DRAW, Jacob! Neither of us can win. Great defensive play!",
        "Stalemate! The game is tied, Jacob. Well played!"
    ],
    thinking: [
        "Hmm, let me think...",
        "Interesting... let me make my move...",
        "Good one, Jacob! Now it's my turn...",
        "Nice! Let me see what I can do..."
    ],
    hint: [
        "Tip: Try to control the center of the board, Jacob!",
        "Hint: Knights love to jump around! Try using yours!",
        "Remember Jacob: Protect your King, but attack mine!",
        "Tip: Bishops are powerful on long diagonals!",
        "Hint: Your Rooks are strongest on open files!",
        "Remember: Pawns can become Queens if they reach the other side!",
        "Tip: Try to develop your pieces early in the game!",
        "Hint: Look for pieces that aren't protected!",
        "Remember: The Queen is your most powerful piece - use her wisely!"
    ],
    pawnPromotion: [
        "Jacob, your pawn made it! Pick your new piece!",
        "Awesome, Jacob! Your pawn gets a promotion! What do you want?"
    ],
    castling: [
        "Nice castling, Jacob! Your King is safer now!",
        "Smart move! Castling keeps your King protected!"
    ]
};

// ===== PIECE DEFINITIONS =====
const PIECE_VALUES = {
    '♔': 0, '♚': 0,
    '♕': 9, '♛': 9,
    '♖': 5, '♜': 5,
    '♗': 3, '♝': 3,
    '♘': 3, '♞': 3,
    '♙': 1, '♟': 1
};

// ===== GAME STATE =====
let board = [];
let selectedSquare = null;
let currentTurn = 'white';
let moveHistory = [];
let capturedByWhite = [];
let capturedByBlack = [];
let whiteKingMoved = false;
let blackKingMoved = false;
let whiteRooksMoved = { left: false, right: false };
let blackRooksMoved = { left: false, right: false };
let enPassantTarget = null;
let promotionCallback = null;
let gameOver = false;
let gameMode = 'ai'; // 'ai' or 'twoPlayer'
let difficulty = 'easy'; // 'easy', 'medium', 'hard'
let showThreatenedPieces = false;
let animatingPiece = null;

// ===== INITIALIZATION =====
function init() {
    loadStats();
    loadAchievements();
    updateAchievementsBadges();
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('playVsAIBtn').addEventListener('click', () => {
        document.getElementById('difficultySelection').style.display = 'block';
    });
    
    document.getElementById('playVsFriendBtn').addEventListener('click', () => {
        startGame('twoPlayer', 'easy');
    });
    
    document.getElementById('tutorialBtn').addEventListener('click', showTutorial);
    
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            startGame('ai', btn.dataset.difficulty);
        });
    });
    
    document.getElementById('menuBtn').addEventListener('click', showMenu);
    document.getElementById('newGameBtn').addEventListener('click', () => startGame(gameMode, difficulty));
    document.getElementById('undoBtn').addEventListener('click', undoMove);
    document.getElementById('hintBtn').addEventListener('click', giveHint);
    document.getElementById('soundBtn').addEventListener('click', toggleSound);
    document.getElementById('dangerBtn').addEventListener('click', toggleThreatened);
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        hideModal('victoryModal');
        startGame(gameMode, difficulty);
    });
    document.getElementById('closeTutorial').addEventListener('click', () => hideModal('tutorialModal'));
    document.getElementById('startPlayingBtn').addEventListener('click', () => {
        hideModal('tutorialModal');
        document.getElementById('difficultySelection').style.display = 'block';
    });
    document.getElementById('viewAchievementsBtn').addEventListener('click', showAchievementsModal);
    document.getElementById('closeAchievements').addEventListener('click', () => hideModal('achievementsModal'));
    
    // Piece selector in tutorial
    document.querySelectorAll('.piece-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.piece-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showPieceTutorial(btn.dataset.piece);
        });
    });
    
    // Close piece info popup when clicking elsewhere
    document.addEventListener('click', (e) => {
        const popup = document.getElementById('pieceInfoPopup');
        if (!e.target.closest('.piece') && !e.target.closest('.piece-info-popup')) {
            popup.style.display = 'none';
        }
    });
}

function showMenu() {
    document.getElementById('gameContent').style.display = 'none';
    document.getElementById('modeSelection').style.display = 'block';
    document.getElementById('difficultySelection').style.display = 'none';
}

function startGame(mode, diff) {
    gameMode = mode;
    difficulty = diff;
    
    document.getElementById('modeSelection').style.display = 'none';
    document.getElementById('gameContent').style.display = 'block';
    
    // Update UI for game mode
    if (mode === 'twoPlayer') {
        document.getElementById('opponentAvatar').textContent = '🎮';
        document.getElementById('opponentName').textContent = 'Player 2';
        document.getElementById('hintBtn').style.display = 'none';
    } else {
        document.getElementById('opponentAvatar').textContent = '🤖';
        document.getElementById('opponentName').textContent = 'Chess Buddy';
        document.getElementById('hintBtn').style.display = '';
    }
    
    initGame();
}

function initGame() {
    board = [
        ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
    ];
    
    selectedSquare = null;
    currentTurn = 'white';
    moveHistory = [];
    capturedByWhite = [];
    capturedByBlack = [];
    whiteKingMoved = false;
    blackKingMoved = false;
    whiteRooksMoved = { left: false, right: false };
    blackRooksMoved = { left: false, right: false };
    enPassantTarget = null;
    gameOver = false;
    showThreatenedPieces = false;
    document.getElementById('dangerBtn').classList.remove('active');
    
    // Reset game stats
    gameStats = { capturesThisGame: 0, checksThisGame: 0, moveCount: 0 };
    
    // Increment games played
    playerStats.gamesPlayed++;
    saveStats();
    checkAchievement('tenGames');
    
    renderBoard();
    updateStatus();
    const welcomeMsg = gameMode === 'twoPlayer' ? randomFrom(messages.welcomeTwoPlayer) : randomFrom(messages.welcome);
    showMessage(welcomeMsg);
    showTip();
    document.getElementById('movesList').innerHTML = '';
    document.getElementById('capturedByPlayer').innerHTML = '';
    document.getElementById('capturedByOpponent').innerHTML = '';
    hideModal('victoryModal');
    playSound('newGame');
}

// ===== RENDERING =====
function renderBoard() {
    const boardEl = document.getElementById('chessBoard');
    boardEl.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            
            const piece = board[row][col];
            if (piece) {
                const pieceEl = document.createElement('span');
                pieceEl.className = `piece ${isWhitePiece(piece) ? 'white' : 'black'}`;
                pieceEl.textContent = piece;
                pieceEl.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    showPieceInfo(piece, e);
                });
                square.appendChild(pieceEl);
            }
            
            square.addEventListener('click', () => handleSquareClick(row, col));
            boardEl.appendChild(square);
        }
    }
    
    highlightLastMove();
    highlightCheck();
    if (showThreatenedPieces) highlightThreatened();
    updateTurnIndicator();
}

function highlightLastMove() {
    if (moveHistory.length > 0) {
        const lastMove = moveHistory[moveHistory.length - 1];
        const fromSquare = document.querySelector(`[data-row="${lastMove.from.row}"][data-col="${lastMove.from.col}"]`);
        const toSquare = document.querySelector(`[data-row="${lastMove.to.row}"][data-col="${lastMove.to.col}"]`);
        if (fromSquare) fromSquare.classList.add('last-move');
        if (toSquare) toSquare.classList.add('last-move');
    }
}

function highlightCheck() {
    const kingPos = findKing(currentTurn);
    if (kingPos && isInCheck(currentTurn)) {
        const kingSquare = document.querySelector(`[data-row="${kingPos.row}"][data-col="${kingPos.col}"]`);
        if (kingSquare) kingSquare.classList.add('in-check');
    }
}

function highlightThreatened() {
    const playerColor = currentTurn;
    const enemyColor = playerColor === 'white' ? 'black' : 'white';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && isWhitePiece(piece) === (playerColor === 'white')) {
                if (isSquareAttacked(row, col, enemyColor)) {
                    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    if (square) square.classList.add('threatened');
                }
            }
        }
    }
}

function highlightValidMoves(row, col) {
    const moves = getValidMoves(row, col);
    moves.forEach(move => {
        const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
        if (square) {
            if (board[move.row][move.col] || move.enPassant) {
                square.classList.add('capture-move');
            } else {
                square.classList.add('valid-move');
            }
        }
    });
}

function clearHighlights() {
    document.querySelectorAll('.square').forEach(sq => {
        sq.classList.remove('selected', 'valid-move', 'capture-move');
    });
}

function updateTurnIndicator() {
    const playerInfo = document.querySelector('.player-info.player');
    const opponentInfo = document.querySelector('.player-info.opponent');
    
    if (currentTurn === 'white') {
        playerInfo.classList.add('active-turn');
        opponentInfo.classList.remove('active-turn');
    } else {
        playerInfo.classList.remove('active-turn');
        opponentInfo.classList.add('active-turn');
    }
}

// ===== PIECE INFO POPUP =====
function showPieceInfo(piece, event) {
    const info = PIECE_INFO[piece];
    if (!info) return;
    
    const popup = document.getElementById('pieceInfoPopup');
    document.getElementById('popupPiece').textContent = piece;
    document.getElementById('popupName').textContent = info.name;
    document.getElementById('popupValue').textContent = info.value;
    document.getElementById('popupMoves').textContent = info.moves;
    
    popup.style.display = 'block';
    popup.style.left = Math.min(event.clientX + 10, window.innerWidth - 200) + 'px';
    popup.style.top = Math.min(event.clientY + 10, window.innerHeight - 150) + 'px';
}

// ===== ANIMATED PIECE MOVEMENT =====
function animateMove(fromRow, fromCol, toRow, toCol, callback) {
    const boardEl = document.getElementById('chessBoard');
    const fromSquare = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
    const toSquare = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
    const pieceEl = fromSquare.querySelector('.piece');
    
    if (!pieceEl) {
        callback();
        return;
    }
    
    const boardRect = boardEl.getBoundingClientRect();
    const fromRect = fromSquare.getBoundingClientRect();
    const toRect = toSquare.getBoundingClientRect();
    
    const clone = pieceEl.cloneNode(true);
    clone.classList.add('animating');
    clone.style.left = (fromRect.left - boardRect.left) + 'px';
    clone.style.top = (fromRect.top - boardRect.top) + 'px';
    clone.style.width = fromRect.width + 'px';
    clone.style.height = fromRect.height + 'px';
    clone.style.fontSize = getComputedStyle(pieceEl).fontSize;
    clone.style.display = 'flex';
    clone.style.alignItems = 'center';
    clone.style.justifyContent = 'center';
    
    boardEl.appendChild(clone);
    pieceEl.style.visibility = 'hidden';
    
    requestAnimationFrame(() => {
        clone.style.transform = `translate(${toRect.left - fromRect.left}px, ${toRect.top - fromRect.top}px)`;
    });
    
    setTimeout(() => {
        clone.remove();
        callback();
    }, 250);
}

// ===== CLICK HANDLING =====
function handleSquareClick(row, col) {
    if (gameOver) return;
    if (gameMode === 'ai' && currentTurn !== 'white') return;
    
    const piece = board[row][col];
    const isCurrentPlayerPiece = piece && (isWhitePiece(piece) === (currentTurn === 'white'));
    
    if (selectedSquare) {
        const validMoves = getValidMoves(selectedSquare.row, selectedSquare.col);
        const isValidMove = validMoves.some(m => m.row === row && m.col === col);
        
        if (isValidMove) {
            const fromRow = selectedSquare.row;
            const fromCol = selectedSquare.col;
            selectedSquare = null;
            clearHighlights();
            
            animateMove(fromRow, fromCol, row, col, () => {
                makeMove(fromRow, fromCol, row, col);
            });
            return;
        }
    }
    
    clearHighlights();
    
    if (isCurrentPlayerPiece) {
        selectedSquare = { row, col };
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        square.classList.add('selected');
        highlightValidMoves(row, col);
        playSound('select');
    } else {
        selectedSquare = null;
    }
}

// ===== MOVE LOGIC =====
function makeMove(fromRow, fromCol, toRow, toCol, isAI = false) {
    const piece = board[fromRow][fromCol];
    const capturedPiece = board[toRow][toCol];
    const moveData = {
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        piece: piece,
        captured: capturedPiece,
        enPassant: false,
        castling: false,
        promotion: false
    };
    
    // Handle en passant capture
    if ((piece === '♙' || piece === '♟') && enPassantTarget && 
        toRow === enPassantTarget.row && toCol === enPassantTarget.col) {
        const capturedPawnRow = piece === '♙' ? toRow + 1 : toRow - 1;
        moveData.captured = board[capturedPawnRow][toCol];
        moveData.enPassant = true;
        board[capturedPawnRow][toCol] = '';
    }
    
    // Handle castling
    if ((piece === '♔' || piece === '♚') && Math.abs(fromCol - toCol) === 2) {
        moveData.castling = true;
        const isKingside = toCol > fromCol;
        const rookFromCol = isKingside ? 7 : 0;
        const rookToCol = isKingside ? toCol - 1 : toCol + 1;
        board[toRow][rookToCol] = board[toRow][rookFromCol];
        board[toRow][rookFromCol] = '';
        
        if (currentTurn === 'white') {
            checkAchievement('castleKing');
        }
        
        if (!isAI && gameMode === 'ai') {
            showMessage(randomFrom(messages.castling));
            playSound('castling');
        }
    }
    
    // Update castling rights
    if (piece === '♔') whiteKingMoved = true;
    if (piece === '♚') blackKingMoved = true;
    if (piece === '♖') {
        if (fromCol === 0) whiteRooksMoved.left = true;
        if (fromCol === 7) whiteRooksMoved.right = true;
    }
    if (piece === '♜') {
        if (fromCol === 0) blackRooksMoved.left = true;
        if (fromCol === 7) blackRooksMoved.right = true;
    }
    
    // Update en passant target
    enPassantTarget = null;
    if ((piece === '♙' && fromRow === 6 && toRow === 4) ||
        (piece === '♟' && fromRow === 1 && toRow === 3)) {
        enPassantTarget = { row: (fromRow + toRow) / 2, col: toCol };
    }
    
    // Make the move
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = '';
    
    // Handle pawn promotion
    if (piece === '♙' && toRow === 0) {
        moveData.promotion = true;
        handlePromotion(toRow, toCol, 'white', () => {
            finishMove(moveData, isAI);
        });
        return;
    } else if (piece === '♟' && toRow === 7) {
        moveData.promotion = true;
        board[toRow][toCol] = '♛';
        finishMove(moveData, isAI);
        return;
    }
    
    finishMove(moveData, isAI);
}

function finishMove(moveData, isAI) {
    gameStats.moveCount++;
    
    // Track captured pieces
    if (moveData.captured) {
        if (currentTurn === 'white') {
            capturedByWhite.push(moveData.captured);
            gameStats.capturesThisGame++;
            playerStats.totalCaptures++;
            saveStats();
            checkAchievement('firstCapture');
            if (gameStats.capturesThisGame >= 5) checkAchievement('fiveCaptures');
        } else {
            capturedByBlack.push(moveData.captured);
        }
        updateCapturedPieces();
    }
    
    moveHistory.push(moveData);
    addMoveToHistory(moveData);
    
    // Switch turns
    currentTurn = currentTurn === 'white' ? 'black' : 'white';
    
    renderBoard();
    
    // Check for game end
    if (isCheckmate(currentTurn)) {
        gameOver = true;
        const winner = currentTurn === 'black' ? 'white' : 'black';
        
        if (winner === 'white' || gameMode === 'twoPlayer') {
            if (winner === 'white') {
                playerStats.gamesWon++;
                saveStats();
                checkAchievement('firstWin');
                checkAchievement('threeWins');
                if (gameStats.moveCount < 40) checkAchievement('quickWin');
            }
            playSound('checkmate');
            showVictoryModal(randomFrom(messages.checkmate), true);
        } else {
            playSound('gameOver');
            showVictoryModal(randomFrom(messages.checkmated), false);
        }
        return;
    }
    
    if (isStalemate(currentTurn)) {
        gameOver = true;
        playSound('gameOver');
        showVictoryModal(randomFrom(messages.stalemate), null);
        return;
    }
    
    updateStatus();
    
    // Show appropriate message and play sounds
    if (!isAI && gameMode === 'ai') {
        if (moveData.captured) {
            playSound('capture');
            showMessage(randomFrom(messages.capture));
        } else if (isInCheck('black')) {
            playSound('check');
            gameStats.checksThisGame++;
            playerStats.checksGiven++;
            saveStats();
            if (gameStats.checksThisGame >= 3) checkAchievement('checkmaster');
            showMessage(randomFrom(messages.check));
        } else {
            playSound('move');
            showMessage(randomFrom(messages.goodMove));
        }
        
        // AI makes a move after a short delay
        setTimeout(() => {
            if (!gameOver && currentTurn === 'black') {
                showMessage(randomFrom(messages.thinking));
                setTimeout(makeAIMove, 600);
            }
        }, 400);
    } else if (gameMode === 'twoPlayer') {
        if (moveData.captured) {
            playSound('capture');
        } else {
            playSound('move');
        }
        if (isInCheck(currentTurn)) {
            playSound('check');
        }
    } else {
        // After AI move
        if (moveData.captured) {
            playSound('capture');
        } else {
            playSound('move');
        }
        if (isInCheck('white')) {
            playSound('check');
            showMessage(randomFrom(messages.inCheck));
        }
    }
}

function handlePromotion(row, col, color, callback) {
    promotionCallback = callback;
    const modal = document.getElementById('promotionModal');
    const choices = document.getElementById('promotionChoices');
    choices.innerHTML = '';
    
    const pieces = color === 'white' 
        ? ['♕', '♖', '♗', '♘'] 
        : ['♛', '♜', '♝', '♞'];
    
    pieces.forEach(piece => {
        const btn = document.createElement('div');
        btn.className = 'promotion-choice';
        btn.textContent = piece;
        btn.addEventListener('click', () => {
            board[row][col] = piece;
            if (piece === '♕') checkAchievement('promoteQueen');
            playSound('promotion');
            hideModal('promotionModal');
            if (promotionCallback) promotionCallback();
        });
        choices.appendChild(btn);
    });
    
    showMessage(randomFrom(messages.pawnPromotion));
    modal.classList.add('show');
}

// ===== MOVE VALIDATION =====
function getValidMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    
    const moves = getPseudoLegalMoves(row, col);
    
    return moves.filter(move => {
        const testBoard = JSON.parse(JSON.stringify(board));
        testBoard[move.row][move.col] = testBoard[row][col];
        testBoard[row][col] = '';
        
        if (move.enPassant) {
            const capturedPawnRow = isWhitePiece(piece) ? move.row + 1 : move.row - 1;
            testBoard[capturedPawnRow][move.col] = '';
        }
        
        return !isInCheckWithBoard(testBoard, isWhitePiece(piece) ? 'white' : 'black');
    });
}

function getPseudoLegalMoves(row, col) {
    const piece = board[row][col];
    const isWhite = isWhitePiece(piece);
    const moves = [];
    
    switch (piece) {
        case '♙': case '♟':
            const direction = isWhite ? -1 : 1;
            const startRow = isWhite ? 6 : 1;
            
            if (board[row + direction]?.[col] === '') {
                moves.push({ row: row + direction, col });
                if (row === startRow && board[row + 2 * direction]?.[col] === '') {
                    moves.push({ row: row + 2 * direction, col });
                }
            }
            
            [-1, 1].forEach(dc => {
                const newCol = col + dc;
                const newRow = row + direction;
                if (newCol >= 0 && newCol < 8 && newRow >= 0 && newRow < 8) {
                    const target = board[newRow][newCol];
                    if (target && isWhitePiece(target) !== isWhite) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    if (enPassantTarget && newRow === enPassantTarget.row && newCol === enPassantTarget.col) {
                        moves.push({ row: newRow, col: newCol, enPassant: true });
                    }
                }
            });
            break;
            
        case '♘': case '♞':
            const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
            knightMoves.forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const target = board[newRow][newCol];
                    if (!target || isWhitePiece(target) !== isWhite) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            });
            break;
            
        case '♗': case '♝':
            addSlidingMoves(moves, row, col, isWhite, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
            break;
            
        case '♖': case '♜':
            addSlidingMoves(moves, row, col, isWhite, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
            break;
            
        case '♕': case '♛':
            addSlidingMoves(moves, row, col, isWhite, [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);
            break;
            
        case '♔': case '♚':
            const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
            kingMoves.forEach(([dr, dc]) => {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    const target = board[newRow][newCol];
                    if (!target || isWhitePiece(target) !== isWhite) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            });
            
            // Castling
            if (isWhite && !whiteKingMoved && row === 7 && col === 4 && !isInCheck('white')) {
                if (!whiteRooksMoved.right && board[7][5] === '' && board[7][6] === '' && board[7][7] === '♖') {
                    if (!isSquareAttacked(7, 5, 'black') && !isSquareAttacked(7, 6, 'black')) {
                        moves.push({ row: 7, col: 6, castling: 'kingside' });
                    }
                }
                if (!whiteRooksMoved.left && board[7][1] === '' && board[7][2] === '' && board[7][3] === '' && board[7][0] === '♖') {
                    if (!isSquareAttacked(7, 2, 'black') && !isSquareAttacked(7, 3, 'black')) {
                        moves.push({ row: 7, col: 2, castling: 'queenside' });
                    }
                }
            }
            if (!isWhite && !blackKingMoved && row === 0 && col === 4 && !isInCheck('black')) {
                if (!blackRooksMoved.right && board[0][5] === '' && board[0][6] === '' && board[0][7] === '♜') {
                    if (!isSquareAttacked(0, 5, 'white') && !isSquareAttacked(0, 6, 'white')) {
                        moves.push({ row: 0, col: 6, castling: 'kingside' });
                    }
                }
                if (!blackRooksMoved.left && board[0][1] === '' && board[0][2] === '' && board[0][3] === '' && board[0][0] === '♜') {
                    if (!isSquareAttacked(0, 2, 'white') && !isSquareAttacked(0, 3, 'white')) {
                        moves.push({ row: 0, col: 2, castling: 'queenside' });
                    }
                }
            }
            break;
    }
    
    return moves;
}

function addSlidingMoves(moves, row, col, isWhite, directions) {
    directions.forEach(([dr, dc]) => {
        let newRow = row + dr;
        let newCol = col + dc;
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const target = board[newRow][newCol];
            if (!target) {
                moves.push({ row: newRow, col: newCol });
            } else {
                if (isWhitePiece(target) !== isWhite) {
                    moves.push({ row: newRow, col: newCol });
                }
                break;
            }
            newRow += dr;
            newCol += dc;
        }
    });
}

// ===== CHECK DETECTION =====
function findKing(color) {
    const kingPiece = color === 'white' ? '♔' : '♚';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === kingPiece) {
                return { row, col };
            }
        }
    }
    return null;
}

function isInCheck(color) {
    return isInCheckWithBoard(board, color);
}

function isInCheckWithBoard(testBoard, color) {
    const kingPiece = color === 'white' ? '♔' : '♚';
    let kingPos = null;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (testBoard[row][col] === kingPiece) {
                kingPos = { row, col };
                break;
            }
        }
        if (kingPos) break;
    }
    
    if (!kingPos) return false;
    
    const enemyColor = color === 'white' ? 'black' : 'white';
    return isSquareAttackedWithBoard(testBoard, kingPos.row, kingPos.col, enemyColor);
}

function isSquareAttacked(row, col, byColor) {
    return isSquareAttackedWithBoard(board, row, col, byColor);
}

function isSquareAttackedWithBoard(testBoard, row, col, byColor) {
    const pawnDir = byColor === 'white' ? 1 : -1;
    const pawnPiece = byColor === 'white' ? '♙' : '♟';
    for (const dc of [-1, 1]) {
        const pawnRow = row + pawnDir;
        const pawnCol = col + dc;
        if (pawnRow >= 0 && pawnRow < 8 && pawnCol >= 0 && pawnCol < 8) {
            if (testBoard[pawnRow][pawnCol] === pawnPiece) return true;
        }
    }
    
    const knightPiece = byColor === 'white' ? '♘' : '♞';
    const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [dr, dc] of knightMoves) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (testBoard[nr][nc] === knightPiece) return true;
        }
    }
    
    const kingPiece = byColor === 'white' ? '♔' : '♚';
    const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (const [dr, dc] of kingMoves) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (testBoard[nr][nc] === kingPiece) return true;
        }
    }
    
    const bishopPiece = byColor === 'white' ? '♗' : '♝';
    const rookPiece = byColor === 'white' ? '♖' : '♜';
    const queenPiece = byColor === 'white' ? '♕' : '♛';
    
    const diagonals = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagonals) {
        let nr = row + dr;
        let nc = col + dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const piece = testBoard[nr][nc];
            if (piece) {
                if (piece === bishopPiece || piece === queenPiece) return true;
                break;
            }
            nr += dr;
            nc += dc;
        }
    }
    
    const straights = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of straights) {
        let nr = row + dr;
        let nc = col + dc;
        while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const piece = testBoard[nr][nc];
            if (piece) {
                if (piece === rookPiece || piece === queenPiece) return true;
                break;
            }
            nr += dr;
            nc += dc;
        }
    }
    
    return false;
}

function isCheckmate(color) {
    if (!isInCheck(color)) return false;
    return !hasLegalMoves(color);
}

function isStalemate(color) {
    if (isInCheck(color)) return false;
    return !hasLegalMoves(color);
}

function hasLegalMoves(color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && (isWhitePiece(piece) === (color === 'white'))) {
                if (getValidMoves(row, col).length > 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

// ===== AI OPPONENT =====
function makeAIMove() {
    if (gameOver || currentTurn !== 'black') return;
    
    const allMoves = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && !isWhitePiece(piece)) {
                const moves = getValidMoves(row, col);
                moves.forEach(move => {
                    allMoves.push({ from: { row, col }, to: move, piece: piece });
                });
            }
        }
    }
    
    if (allMoves.length === 0) return;
    
    // Difficulty settings
    const mistakeChance = { easy: 0.4, medium: 0.2, hard: 0.05 }[difficulty];
    const searchDepth = { easy: 1, medium: 2, hard: 3 }[difficulty];
    
    let scoredMoves = allMoves.map(move => {
        let score = 0;
        const capturedPiece = board[move.to.row][move.to.col];
        
        if (capturedPiece) {
            score += PIECE_VALUES[capturedPiece] * 10;
        }
        
        const testBoard = JSON.parse(JSON.stringify(board));
        testBoard[move.to.row][move.to.col] = testBoard[move.from.row][move.from.col];
        testBoard[move.from.row][move.from.col] = '';
        if (isInCheckWithBoard(testBoard, 'white')) {
            score += 5;
        }
        
        if (move.to.row >= 3 && move.to.row <= 4 && move.to.col >= 3 && move.to.col <= 4) {
            score += 2;
        }
        
        if (moveHistory.length < 10) {
            if (move.piece === '♞' || move.piece === '♝') {
                score += 3;
            }
        }
        
        score += Math.random() * 3;
        
        return { ...move, score };
    });
    
    scoredMoves.sort((a, b) => b.score - a.score);
    
    let selectedMove;
    if (Math.random() < mistakeChance && allMoves.length > 1) {
        selectedMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    } else {
        const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
        selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
    }
    
    const fromRow = selectedMove.from.row;
    const fromCol = selectedMove.from.col;
    const toRow = selectedMove.to.row;
    const toCol = selectedMove.to.col;
    
    animateMove(fromRow, fromCol, toRow, toCol, () => {
        makeMove(fromRow, fromCol, toRow, toCol, true);
    });
}

// ===== THREATENED PIECES =====
function toggleThreatened() {
    showThreatenedPieces = !showThreatenedPieces;
    const btn = document.getElementById('dangerBtn');
    btn.classList.toggle('active', showThreatenedPieces);
    if (showThreatenedPieces) {
        btn.textContent = '⚠️ Threats: ON';
    } else {
        btn.textContent = '⚠️ Threats: Off';
    }
    renderBoard();
}

// ===== UI HELPERS =====
function showMessage(msg) {
    const messageEl = document.getElementById('gameMessage');
    messageEl.style.animation = 'none';
    messageEl.offsetHeight;
    messageEl.style.animation = 'pulse 2s ease-in-out infinite';
    messageEl.textContent = msg;
}

function updateStatus() {
    const playerStatus = document.getElementById('playerStatus');
    const opponentStatus = document.getElementById('opponentStatus');
    
    if (gameMode === 'twoPlayer') {
        if (currentTurn === 'white') {
            playerStatus.textContent = "White's turn!";
            opponentStatus.textContent = "Waiting...";
        } else {
            playerStatus.textContent = "Waiting...";
            opponentStatus.textContent = "Black's turn!";
        }
    } else {
        if (currentTurn === 'white') {
            playerStatus.textContent = "Your turn!";
            opponentStatus.textContent = "Waiting...";
        } else {
            playerStatus.textContent = "Waiting...";
            opponentStatus.textContent = "Thinking...";
        }
    }
}

function updateCapturedPieces() {
    document.getElementById('capturedByPlayer').textContent = capturedByWhite.join(' ');
    document.getElementById('capturedByOpponent').textContent = capturedByBlack.join(' ');
}

function addMoveToHistory(moveData) {
    const movesList = document.getElementById('movesList');
    const moveNum = Math.ceil(moveHistory.length / 2);
    const isWhiteMove = moveHistory.length % 2 === 1;
    
    const pieceNames = {
        '♔': 'K', '♕': 'Q', '♖': 'R', '♗': 'B', '♘': 'N', '♙': '',
        '♚': 'K', '♛': 'Q', '♜': 'R', '♝': 'B', '♞': 'N', '♟': ''
    };
    
    const colNames = 'abcdefgh';
    const rowNames = '87654321';
    
    let notation = pieceNames[moveData.piece];
    if (moveData.captured) notation += 'x';
    notation += colNames[moveData.to.col] + rowNames[moveData.to.row];
    
    if (moveData.castling) {
        notation = moveData.to.col === 6 ? 'O-O' : 'O-O-O';
    }
    
    const moveItem = document.createElement('span');
    moveItem.className = `move-item ${isWhiteMove ? 'white-move' : 'black-move'}`;
    moveItem.textContent = isWhiteMove ? `${moveNum}. ${notation}` : notation;
    movesList.appendChild(moveItem);
    movesList.scrollTop = movesList.scrollHeight;
}

function showTip() {
    document.getElementById('currentTip').textContent = randomFrom(messages.hint);
}

function showVictoryModal(message, isWin) {
    const modal = document.getElementById('victoryModal');
    const title = document.getElementById('modalTitle');
    const msg = document.getElementById('modalMessage');
    
    if (isWin === true) {
        title.textContent = '🎉 Amazing Job, Jacob! 🎉';
        title.style.color = '#00b894';
    } else if (isWin === false) {
        title.textContent = '🎮 Good Game, Jacob! 🎮';
        title.style.color = '#1e7e34';
    } else {
        title.textContent = "🤝 It's a Draw! 🤝";
        title.style.color = '#fdcb6e';
    }
    
    msg.textContent = message;
    modal.classList.add('show');
    
    if (isWin === true) {
        createConfetti();
    }
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function createConfetti() {
    const confetti = document.getElementById('confetti');
    confetti.innerHTML = '';
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96c93d', '#f9d423', '#ff9f43'];
    
    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}%;
            animation: fall ${1 + Math.random()}s ease-out forwards;
            animation-delay: ${Math.random() * 0.5}s;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        `;
        confetti.appendChild(piece);
    }
    
    if (!document.getElementById('confetti-styles')) {
        const style = document.createElement('style');
        style.id = 'confetti-styles';
        style.textContent = `
            @keyframes fall {
                0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
                100% { transform: translateY(200px) rotate(720deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

function undoMove() {
    if (moveHistory.length < 2 || gameOver) return;
    if (gameMode === 'twoPlayer' && moveHistory.length < 1) return;
    
    const movesToUndo = gameMode === 'ai' ? 2 : 1;
    
    for (let i = 0; i < movesToUndo && moveHistory.length > 0; i++) {
        const lastMove = moveHistory.pop();
        if (!lastMove) break;
        
        board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        board[lastMove.to.row][lastMove.to.col] = lastMove.captured || '';
        
        if (lastMove.enPassant) {
            const capturedPawnRow = isWhitePiece(lastMove.piece) ? lastMove.to.row + 1 : lastMove.to.row - 1;
            board[capturedPawnRow][lastMove.to.col] = isWhitePiece(lastMove.piece) ? '♟' : '♙';
        }
        
        if (lastMove.castling) {
            const isKingside = lastMove.to.col === 6;
            const rookFromCol = isKingside ? 7 : 0;
            const rookToCol = isKingside ? 5 : 3;
            board[lastMove.to.row][rookFromCol] = board[lastMove.to.row][rookToCol];
            board[lastMove.to.row][rookToCol] = '';
        }
        
        if (lastMove.captured) {
            if (isWhitePiece(lastMove.piece)) {
                capturedByWhite.pop();
            } else {
                capturedByBlack.pop();
            }
        }
    }
    
    currentTurn = 'white';
    renderBoard();
    updateStatus();
    updateCapturedPieces();
    
    const movesList = document.getElementById('movesList');
    for (let i = 0; i < movesToUndo; i++) {
        if (movesList.lastChild) movesList.removeChild(movesList.lastChild);
    }
    
    playSound('undo');
    showMessage("Move undone! Try a different move, Jacob!");
}

function giveHint() {
    if (gameOver || currentTurn !== 'white') return;
    
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && isWhitePiece(piece)) {
                const moves = getValidMoves(row, col);
                moves.forEach(move => {
                    let score = Math.random() * 2;
                    const capturedPiece = board[move.row][move.col];
                    if (capturedPiece) {
                        score += PIECE_VALUES[capturedPiece] * 10;
                    }
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = { from: { row, col }, to: move };
                    }
                });
            }
        }
    }
    
    if (bestMove) {
        clearHighlights();
        const fromSquare = document.querySelector(`[data-row="${bestMove.from.row}"][data-col="${bestMove.from.col}"]`);
        const toSquare = document.querySelector(`[data-row="${bestMove.to.row}"][data-col="${bestMove.to.col}"]`);
        
        if (fromSquare) fromSquare.classList.add('highlight-tutorial');
        if (toSquare) toSquare.classList.add('highlight-tutorial');
        
        setTimeout(() => {
            fromSquare?.classList.remove('highlight-tutorial');
            toSquare?.classList.remove('highlight-tutorial');
        }, 3000);
        
        playSound('hint');
        showMessage(randomFrom(messages.hint));
    }
}

// ===== TUTORIAL SYSTEM =====
function showTutorial() {
    document.getElementById('tutorialModal').classList.add('show');
    showPieceTutorial('pawn');
}

function showPieceTutorial(pieceName) {
    const tutorialBoard = document.getElementById('tutorialBoard');
    tutorialBoard.innerHTML = '';
    
    // Create empty board
    const demoBoard = Array(8).fill(null).map(() => Array(8).fill(''));
    
    // Place piece and show moves based on piece type
    let pieceChar, pieceRow, pieceCol, moveSquares = [];
    
    switch(pieceName) {
        case 'pawn':
            pieceChar = '♙'; pieceRow = 4; pieceCol = 3;
            demoBoard[pieceRow][pieceCol] = pieceChar;
            demoBoard[3][2] = '♟'; // Enemy for capture demo
            moveSquares = [{r:3, c:3}, {r:3, c:2, capture:true}];
            document.getElementById('pieceInfoTitle').textContent = 'The Pawn ♙';
            document.getElementById('pieceInfoDesc').textContent = 'Pawns move forward one square, but capture diagonally! From their starting position, they can move two squares.';
            document.getElementById('pieceValue').textContent = '1';
            document.getElementById('pieceSpecial').textContent = 'Promotion, En Passant';
            break;
        case 'knight':
            pieceChar = '♘'; pieceRow = 4; pieceCol = 3;
            demoBoard[pieceRow][pieceCol] = pieceChar;
            moveSquares = [{r:2, c:2}, {r:2, c:4}, {r:3, c:1}, {r:3, c:5}, {r:5, c:1}, {r:5, c:5}, {r:6, c:2}, {r:6, c:4}];
            document.getElementById('pieceInfoTitle').textContent = 'The Knight ♘';
            document.getElementById('pieceInfoDesc').textContent = 'Knights move in an L-shape: 2 squares in one direction, then 1 square perpendicular. They can jump over pieces!';
            document.getElementById('pieceValue').textContent = '3';
            document.getElementById('pieceSpecial').textContent = 'Can jump over pieces';
            break;
        case 'bishop':
            pieceChar = '♗'; pieceRow = 4; pieceCol = 3;
            demoBoard[pieceRow][pieceCol] = pieceChar;
            moveSquares = [{r:3, c:2}, {r:2, c:1}, {r:1, c:0}, {r:3, c:4}, {r:2, c:5}, {r:1, c:6}, {r:0, c:7}, {r:5, c:2}, {r:6, c:1}, {r:7, c:0}, {r:5, c:4}, {r:6, c:5}, {r:7, c:6}];
            document.getElementById('pieceInfoTitle').textContent = 'The Bishop ♗';
            document.getElementById('pieceInfoDesc').textContent = 'Bishops move diagonally any number of squares. Each bishop stays on its starting color for the entire game.';
            document.getElementById('pieceValue').textContent = '3';
            document.getElementById('pieceSpecial').textContent = 'Stays on same color';
            break;
        case 'rook':
            pieceChar = '♖'; pieceRow = 4; pieceCol = 3;
            demoBoard[pieceRow][pieceCol] = pieceChar;
            for(let i = 0; i < 8; i++) { if(i !== pieceCol) moveSquares.push({r: pieceRow, c: i}); }
            for(let i = 0; i < 8; i++) { if(i !== pieceRow) moveSquares.push({r: i, c: pieceCol}); }
            document.getElementById('pieceInfoTitle').textContent = 'The Rook ♖';
            document.getElementById('pieceInfoDesc').textContent = 'Rooks move horizontally or vertically any number of squares. They are very powerful in the endgame!';
            document.getElementById('pieceValue').textContent = '5';
            document.getElementById('pieceSpecial').textContent = 'Used in Castling';
            break;
        case 'queen':
            pieceChar = '♕'; pieceRow = 4; pieceCol = 3;
            demoBoard[pieceRow][pieceCol] = pieceChar;
            for(let i = 0; i < 8; i++) { if(i !== pieceCol) moveSquares.push({r: pieceRow, c: i}); }
            for(let i = 0; i < 8; i++) { if(i !== pieceRow) moveSquares.push({r: i, c: pieceCol}); }
            for(let d = 1; d < 8; d++) {
                if(pieceRow-d >= 0 && pieceCol-d >= 0) moveSquares.push({r: pieceRow-d, c: pieceCol-d});
                if(pieceRow-d >= 0 && pieceCol+d < 8) moveSquares.push({r: pieceRow-d, c: pieceCol+d});
                if(pieceRow+d < 8 && pieceCol-d >= 0) moveSquares.push({r: pieceRow+d, c: pieceCol-d});
                if(pieceRow+d < 8 && pieceCol+d < 8) moveSquares.push({r: pieceRow+d, c: pieceCol+d});
            }
            document.getElementById('pieceInfoTitle').textContent = 'The Queen ♕';
            document.getElementById('pieceInfoDesc').textContent = 'The Queen is the most powerful piece! She can move any number of squares in any direction.';
            document.getElementById('pieceValue').textContent = '9';
            document.getElementById('pieceSpecial').textContent = 'Most powerful piece!';
            break;
        case 'king':
            pieceChar = '♔'; pieceRow = 4; pieceCol = 3;
            demoBoard[pieceRow][pieceCol] = pieceChar;
            moveSquares = [{r:3, c:2}, {r:3, c:3}, {r:3, c:4}, {r:4, c:2}, {r:4, c:4}, {r:5, c:2}, {r:5, c:3}, {r:5, c:4}];
            document.getElementById('pieceInfoTitle').textContent = 'The King ♔';
            document.getElementById('pieceInfoDesc').textContent = 'The King moves one square in any direction. Protect your King - if he\'s checkmated, you lose!';
            document.getElementById('pieceValue').textContent = '∞';
            document.getElementById('pieceSpecial').textContent = 'Castling, Must protect!';
            break;
    }
    
    // Render the tutorial board
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            
            // Check if this is a valid move square
            const isMove = moveSquares.find(m => m.r === row && m.c === col);
            if (isMove) {
                square.classList.add(isMove.capture ? 'capture-move' : 'valid-move');
            }
            
            const piece = demoBoard[row][col];
            if (piece) {
                const pieceEl = document.createElement('span');
                pieceEl.className = `piece ${isWhitePiece(piece) ? 'white' : 'black'}`;
                pieceEl.textContent = piece;
                square.appendChild(pieceEl);
            }
            
            tutorialBoard.appendChild(square);
        }
    }
}

// ===== ACHIEVEMENTS SYSTEM =====
function loadAchievements() {
    const saved = localStorage.getItem('jacobChessAchievements');
    if (saved) {
        const earned = JSON.parse(saved);
        earned.forEach(id => {
            if (ACHIEVEMENTS[id]) ACHIEVEMENTS[id].earned = true;
        });
    }
}

function saveAchievements() {
    const earned = Object.values(ACHIEVEMENTS).filter(a => a.earned).map(a => a.id);
    localStorage.setItem('jacobChessAchievements', JSON.stringify(earned));
}

function loadStats() {
    const saved = localStorage.getItem('jacobChessStats');
    if (saved) {
        playerStats = JSON.parse(saved);
    }
}

function saveStats() {
    localStorage.setItem('jacobChessStats', JSON.stringify(playerStats));
}

function checkAchievement(id) {
    const achievement = ACHIEVEMENTS[id];
    if (!achievement || achievement.earned) return;
    
    let shouldAward = false;
    
    switch(id) {
        case 'firstWin': shouldAward = playerStats.gamesWon >= 1; break;
        case 'firstCapture': shouldAward = playerStats.totalCaptures >= 1; break;
        case 'fiveCaptures': shouldAward = gameStats.capturesThisGame >= 5; break;
        case 'checkmaster': shouldAward = gameStats.checksThisGame >= 3; break;
        case 'castleKing': shouldAward = true; break;
        case 'promoteQueen': shouldAward = true; break;
        case 'threeWins': shouldAward = playerStats.gamesWon >= 3; break;
        case 'tenGames': shouldAward = playerStats.gamesPlayed >= 10; break;
        case 'quickWin': shouldAward = true; break;
    }
    
    if (shouldAward) {
        achievement.earned = true;
        saveAchievements();
        showAchievementNotification(achievement);
        updateAchievementsBadges();
    }
}

function showAchievementNotification(achievement) {
    playSound('achievement');
    
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <span class="notif-icon">${achievement.icon}</span>
        <span class="notif-text">Achievement: ${achievement.name}!</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f9d423, #ff9f43);
        color: white;
        padding: 15px 25px;
        border-radius: 15px;
        font-weight: bold;
        z-index: 3000;
        animation: slideIn 0.5s ease, slideOut 0.5s ease 2.5s forwards;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;
    
    if (!document.getElementById('achievement-anim')) {
        const style = document.createElement('style');
        style.id = 'achievement-anim';
        style.textContent = `
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function updateAchievementsBadges() {
    const badgesMini = document.getElementById('badgesMini');
    badgesMini.innerHTML = '';
    
    Object.values(ACHIEVEMENTS).slice(0, 6).forEach(a => {
        const badge = document.createElement('span');
        badge.className = `badge-mini ${a.earned ? 'earned' : ''}`;
        badge.textContent = a.icon;
        badge.title = a.name;
        badgesMini.appendChild(badge);
    });
}

function showAchievementsModal() {
    const grid = document.getElementById('achievementsGrid');
    grid.innerHTML = '';
    
    Object.values(ACHIEVEMENTS).forEach(a => {
        const card = document.createElement('div');
        card.className = `achievement-card ${a.earned ? 'earned' : ''}`;
        card.innerHTML = `
            <div class="achievement-icon">${a.icon}</div>
            <div class="achievement-name">${a.name}</div>
            <div class="achievement-desc">${a.desc}</div>
        `;
        grid.appendChild(card);
    });
    
    document.getElementById('achievementsModal').classList.add('show');
}

// ===== UTILITY FUNCTIONS =====
function isWhitePiece(piece) {
    return '♔♕♖♗♘♙'.includes(piece);
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Initialize on load
init();
