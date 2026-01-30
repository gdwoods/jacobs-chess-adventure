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
        btn.textContent = '🔊 Sound On';
        btn.classList.remove('muted');
        playSound('select');
    } else {
        btn.textContent = '🔇 Sound Off';
        btn.classList.add('muted');
    }
}

// Sound effect generator using Web Audio API
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
            // Soft click sound
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            oscillator.start(now);
            oscillator.stop(now + 0.1);
            break;
            
        case 'move':
            // Satisfying "thunk" sound
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(300, now);
            oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.15);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            oscillator.start(now);
            oscillator.stop(now + 0.15);
            break;
            
        case 'capture':
            // Exciting capture sound - two tones
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
            // Alarm-like sound
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
            // Victory fanfare - ascending notes
            playNote(523, 0, 0.15);      // C5
            playNote(659, 0.15, 0.15);   // E5
            playNote(784, 0.3, 0.15);    // G5
            playNote(1047, 0.45, 0.3);   // C6
            return; // Don't start the main oscillator
            
        case 'gameOver':
            // Sad trombone - descending
            playNote(392, 0, 0.2);       // G4
            playNote(370, 0.2, 0.2);     // F#4
            playNote(349, 0.4, 0.2);     // F4
            playNote(330, 0.6, 0.4);     // E4
            return;
            
        case 'castling':
            // Special double move sound
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
            // Magic sparkle sound - ascending arpeggio
            playNote(523, 0, 0.1);       // C5
            playNote(659, 0.08, 0.1);    // E5
            playNote(784, 0.16, 0.1);    // G5
            playNote(1047, 0.24, 0.2);   // C6
            return;
            
        case 'newGame':
            // Fresh start jingle
            playNote(523, 0, 0.12);      // C5
            playNote(659, 0.1, 0.12);    // E5
            playNote(784, 0.2, 0.2);     // G5
            return;
            
        case 'undo':
            // Rewind sound
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, now);
            oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.2);
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            oscillator.start(now);
            oscillator.stop(now + 0.2);
            break;
            
        case 'hint':
            // Helpful chime
            playNote(784, 0, 0.1);       // G5
            playNote(988, 0.1, 0.15);    // B5
            return;
            
        case 'error':
            // Gentle "nope" sound
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(200, now);
            oscillator.frequency.exponentialRampToValueAtTime(150, now + 0.15);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            oscillator.start(now);
            oscillator.stop(now + 0.15);
            break;
    }
}

// Helper function to play a single note
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

// ===== PERSONALIZED MESSAGES FOR JACOB =====
const messages = {
    welcome: [
        "Hey Jacob! Ready to play some chess? You're White - click a piece to start!",
        "Welcome back, Jacob! Let's play some chess! You go first!",
        "Jacob's Chess Adventure begins! Show me what you've got!",
        "Hi Jacob! Time for some chess fun! Pick a piece to move!"
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
    opponentMove: [
        "My turn! Let's see...",
        "Okay Jacob, watch this move!",
        "Here comes my move, Jacob!"
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
const PIECES = {
    WHITE_KING: '♔', WHITE_QUEEN: '♕', WHITE_ROOK: '♖',
    WHITE_BISHOP: '♗', WHITE_KNIGHT: '♘', WHITE_PAWN: '♙',
    BLACK_KING: '♚', BLACK_QUEEN: '♛', BLACK_ROOK: '♜',
    BLACK_BISHOP: '♝', BLACK_KNIGHT: '♞', BLACK_PAWN: '♟'
};

const PIECE_VALUES = {
    '♔': 0, '♚': 0,      // Kings (invaluable)
    '♕': 9, '♛': 9,      // Queens
    '♖': 5, '♜': 5,      // Rooks
    '♗': 3, '♝': 3,      // Bishops
    '♘': 3, '♞': 3,      // Knights
    '♙': 1, '♟': 1       // Pawns
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

// ===== INITIALIZE GAME =====
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
    
    renderBoard();
    updateStatus();
    showMessage(randomFrom(messages.welcome));
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
                square.appendChild(pieceEl);
            }
            
            square.addEventListener('click', () => handleSquareClick(row, col));
            boardEl.appendChild(square);
        }
    }
    
    highlightLastMove();
    highlightCheck();
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

function highlightValidMoves(row, col) {
    const moves = getValidMoves(row, col);
    moves.forEach(move => {
        const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
        if (square) {
            if (board[move.row][move.col] || (move.enPassant)) {
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

// ===== CLICK HANDLING =====
function handleSquareClick(row, col) {
    if (gameOver || currentTurn !== 'white') return;
    
    const piece = board[row][col];
    
    // If a piece is already selected
    if (selectedSquare) {
        const validMoves = getValidMoves(selectedSquare.row, selectedSquare.col);
        const isValidMove = validMoves.some(m => m.row === row && m.col === col);
        
        if (isValidMove) {
            makeMove(selectedSquare.row, selectedSquare.col, row, col);
            selectedSquare = null;
            clearHighlights();
            return;
        }
    }
    
    // Select a new piece
    clearHighlights();
    
    if (piece && isWhitePiece(piece)) {
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
        
        if (!isAI) {
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
        board[toRow][toCol] = '♛'; // AI always promotes to queen
        finishMove(moveData, isAI);
        return;
    }
    
    finishMove(moveData, isAI);
}

function finishMove(moveData, isAI) {
    // Track captured pieces
    if (moveData.captured) {
        if (currentTurn === 'white') {
            capturedByWhite.push(moveData.captured);
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
        if (currentTurn === 'black') {
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
    if (!isAI) {
        if (moveData.captured) {
            playSound('capture');
            showMessage(randomFrom(messages.capture));
        } else if (isInCheck('black')) {
            playSound('check');
            showMessage(randomFrom(messages.check));
        } else {
            playSound('move');
            showMessage(randomFrom(messages.goodMove));
        }
        
        // AI makes a move after a short delay
        setTimeout(() => {
            if (!gameOver && currentTurn === 'black') {
                showMessage(randomFrom(messages.thinking));
                setTimeout(makeAIMove, 800);
            }
        }, 500);
    } else {
        // After AI move - play appropriate sound
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
    
    // Filter out moves that leave king in check
    return moves.filter(move => {
        const testBoard = JSON.parse(JSON.stringify(board));
        testBoard[move.row][move.col] = testBoard[row][col];
        testBoard[row][col] = '';
        
        // Handle en passant in test
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
        case '♙': case '♟': // Pawns
            const direction = isWhite ? -1 : 1;
            const startRow = isWhite ? 6 : 1;
            
            // Forward move
            if (board[row + direction]?.[col] === '') {
                moves.push({ row: row + direction, col });
                // Double move from start
                if (row === startRow && board[row + 2 * direction]?.[col] === '') {
                    moves.push({ row: row + 2 * direction, col });
                }
            }
            
            // Captures
            [-1, 1].forEach(dc => {
                const newCol = col + dc;
                const newRow = row + direction;
                if (newCol >= 0 && newCol < 8 && newRow >= 0 && newRow < 8) {
                    const target = board[newRow][newCol];
                    if (target && isWhitePiece(target) !== isWhite) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    // En passant
                    if (enPassantTarget && newRow === enPassantTarget.row && newCol === enPassantTarget.col) {
                        moves.push({ row: newRow, col: newCol, enPassant: true });
                    }
                }
            });
            break;
            
        case '♘': case '♞': // Knights
            const knightMoves = [
                [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                [1, -2], [1, 2], [2, -1], [2, 1]
            ];
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
            
        case '♗': case '♝': // Bishops
            addSlidingMoves(moves, row, col, isWhite, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
            break;
            
        case '♖': case '♜': // Rooks
            addSlidingMoves(moves, row, col, isWhite, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
            break;
            
        case '♕': case '♛': // Queens
            addSlidingMoves(moves, row, col, isWhite, [
                [-1, -1], [-1, 1], [1, -1], [1, 1],
                [-1, 0], [1, 0], [0, -1], [0, 1]
            ]);
            break;
            
        case '♔': case '♚': // Kings
            const kingMoves = [
                [-1, -1], [-1, 0], [-1, 1], [0, -1],
                [0, 1], [1, -1], [1, 0], [1, 1]
            ];
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
                // Kingside
                if (!whiteRooksMoved.right && board[7][5] === '' && board[7][6] === '' && board[7][7] === '♖') {
                    if (!isSquareAttacked(7, 5, 'black') && !isSquareAttacked(7, 6, 'black')) {
                        moves.push({ row: 7, col: 6, castling: 'kingside' });
                    }
                }
                // Queenside
                if (!whiteRooksMoved.left && board[7][1] === '' && board[7][2] === '' && board[7][3] === '' && board[7][0] === '♖') {
                    if (!isSquareAttacked(7, 2, 'black') && !isSquareAttacked(7, 3, 'black')) {
                        moves.push({ row: 7, col: 2, castling: 'queenside' });
                    }
                }
            }
            if (!isWhite && !blackKingMoved && row === 0 && col === 4 && !isInCheck('black')) {
                // Kingside
                if (!blackRooksMoved.right && board[0][5] === '' && board[0][6] === '' && board[0][7] === '♜') {
                    if (!isSquareAttacked(0, 5, 'white') && !isSquareAttacked(0, 6, 'white')) {
                        moves.push({ row: 0, col: 6, castling: 'kingside' });
                    }
                }
                // Queenside
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
    const isEnemy = byColor === 'white' ? isWhitePiece : (p) => p && !isWhitePiece(p);
    
    // Check for pawn attacks
    const pawnDir = byColor === 'white' ? 1 : -1;
    const pawnPiece = byColor === 'white' ? '♙' : '♟';
    [-1, 1].forEach(dc => {
        const pawnRow = row + pawnDir;
        const pawnCol = col + dc;
        if (pawnRow >= 0 && pawnRow < 8 && pawnCol >= 0 && pawnCol < 8) {
            if (testBoard[pawnRow][pawnCol] === pawnPiece) return true;
        }
    });
    
    // Check for knight attacks
    const knightPiece = byColor === 'white' ? '♘' : '♞';
    const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of knightMoves) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (testBoard[nr][nc] === knightPiece) return true;
        }
    }
    
    // Check for king attacks
    const kingPiece = byColor === 'white' ? '♔' : '♚';
    const kingMoves = [
        [-1, -1], [-1, 0], [-1, 1], [0, -1],
        [0, 1], [1, -1], [1, 0], [1, 1]
    ];
    for (const [dr, dc] of kingMoves) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            if (testBoard[nr][nc] === kingPiece) return true;
        }
    }
    
    // Check for sliding piece attacks (bishop, rook, queen)
    const bishopPiece = byColor === 'white' ? '♗' : '♝';
    const rookPiece = byColor === 'white' ? '♖' : '♜';
    const queenPiece = byColor === 'white' ? '♕' : '♛';
    
    // Diagonal attacks (bishop, queen)
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
    
    // Straight attacks (rook, queen)
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
    
    // Get all possible moves for black
    const allMoves = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && !isWhitePiece(piece)) {
                const moves = getValidMoves(row, col);
                moves.forEach(move => {
                    allMoves.push({
                        from: { row, col },
                        to: move,
                        piece: piece
                    });
                });
            }
        }
    }
    
    if (allMoves.length === 0) return;
    
    // Simple AI: prioritize captures, checks, then random moves
    // But make occasional "mistakes" to be easier for a beginner
    let scoredMoves = allMoves.map(move => {
        let score = 0;
        const capturedPiece = board[move.to.row][move.to.col];
        
        // Capture value
        if (capturedPiece) {
            score += PIECE_VALUES[capturedPiece] * 10;
        }
        
        // Check if move gives check
        const testBoard = JSON.parse(JSON.stringify(board));
        testBoard[move.to.row][move.to.col] = testBoard[move.from.row][move.from.col];
        testBoard[move.from.row][move.from.col] = '';
        if (isInCheckWithBoard(testBoard, 'white')) {
            score += 5;
        }
        
        // Center control bonus
        if (move.to.row >= 3 && move.to.row <= 4 && move.to.col >= 3 && move.to.col <= 4) {
            score += 2;
        }
        
        // Piece development bonus (early game)
        if (moveHistory.length < 10) {
            if (move.piece === '♞' || move.piece === '♝') {
                score += 3;
            }
        }
        
        // Random factor to make AI less predictable and easier
        score += Math.random() * 5;
        
        return { ...move, score };
    });
    
    // Sort by score
    scoredMoves.sort((a, b) => b.score - a.score);
    
    // 30% chance to make a "mistake" and pick a random move instead
    let selectedMove;
    if (Math.random() < 0.3 && allMoves.length > 1) {
        selectedMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    } else {
        // Pick from top 3 moves randomly
        const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
        selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
    }
    
    makeMove(selectedMove.from.row, selectedMove.from.col, 
             selectedMove.to.row, selectedMove.to.col, true);
}

// ===== UI HELPERS =====
function showMessage(msg) {
    const messageEl = document.getElementById('gameMessage');
    messageEl.style.animation = 'none';
    messageEl.offsetHeight; // Trigger reflow
    messageEl.style.animation = 'pulse 2s ease-in-out infinite';
    messageEl.textContent = msg;
}

function updateStatus() {
    const playerStatus = document.getElementById('playerStatus');
    const opponentStatus = document.getElementById('opponentStatus');
    
    if (currentTurn === 'white') {
        playerStatus.textContent = "Your turn!";
        opponentStatus.textContent = "Waiting...";
    } else {
        playerStatus.textContent = "Waiting...";
        opponentStatus.textContent = "Thinking...";
    }
}

function updateCapturedPieces() {
    const capturedByPlayerEl = document.getElementById('capturedByPlayer');
    const capturedByOpponentEl = document.getElementById('capturedByOpponent');
    
    capturedByPlayerEl.textContent = capturedByWhite.join(' ');
    capturedByOpponentEl.textContent = capturedByBlack.join(' ');
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
    const tipEl = document.getElementById('currentTip');
    tipEl.textContent = randomFrom(messages.hint);
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
    
    // Trigger celebration animation
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
    
    // Add confetti animation if not exists
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
    
    // Undo AI move and player move
    for (let i = 0; i < 2; i++) {
        const lastMove = moveHistory.pop();
        if (!lastMove) break;
        
        // Restore piece positions
        board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        board[lastMove.to.row][lastMove.to.col] = lastMove.captured || '';
        
        // Handle en passant undo
        if (lastMove.enPassant) {
            const capturedPawnRow = isWhitePiece(lastMove.piece) ? lastMove.to.row + 1 : lastMove.to.row - 1;
            board[capturedPawnRow][lastMove.to.col] = isWhitePiece(lastMove.piece) ? '♟' : '♙';
        }
        
        // Handle castling undo
        if (lastMove.castling) {
            const isKingside = lastMove.to.col === 6;
            const rookFromCol = isKingside ? 7 : 0;
            const rookToCol = isKingside ? 5 : 3;
            const rookRow = lastMove.to.row;
            board[rookRow][rookFromCol] = board[rookRow][rookToCol];
            board[rookRow][rookToCol] = '';
        }
        
        // Restore captured pieces
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
    
    // Update moves list
    const movesList = document.getElementById('movesList');
    if (movesList.lastChild) movesList.removeChild(movesList.lastChild);
    if (movesList.lastChild) movesList.removeChild(movesList.lastChild);
    
    playSound('undo');
    showMessage("Move undone! Try a different move, Jacob!");
}

function giveHint() {
    if (gameOver || currentTurn !== 'white') return;
    
    // Find a good move for the player
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && isWhitePiece(piece)) {
                const moves = getValidMoves(row, col);
                moves.forEach(move => {
                    let score = 0;
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

// ===== UTILITY FUNCTIONS =====
function isWhitePiece(piece) {
    return '♔♕♖♗♘♙'.includes(piece);
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// ===== EVENT LISTENERS =====
document.getElementById('newGameBtn').addEventListener('click', initGame);
document.getElementById('undoBtn').addEventListener('click', undoMove);
document.getElementById('hintBtn').addEventListener('click', giveHint);
document.getElementById('soundBtn').addEventListener('click', toggleSound);
document.getElementById('playAgainBtn').addEventListener('click', () => {
    hideModal('victoryModal');
    initGame();
});

// Initialize the game on load
initGame();
