# Pure JavaScript Tetris

A classic Tetris game built entirely with pure JavaScript, HTML, and CSS.

## Description

This is a faithful implementation of the iconic Tetris arcade game, created without any external libraries or frameworks. Stack falling tetromino pieces, clear complete rows, and keep the board alive as the game speeds up with each level!

## Features

- **Classic Tetris Gameplay** — All 7 tetromino pieces (I, J, L, O, S, T, Z) with authentic colors
- **Difficulty Progression** — Game speed increases as you advance through levels
- **Score Tracking** — Keep track of your score, lines cleared, and current level
- **Smooth Animations** — Responsive controls with smooth piece movement and rotation
- **Pause Functionality** — Pause and resume the game at any time
- **Responsive Design** — Plays great in any browser

## Game Instructions

### Objective
Stack the falling pieces to create complete horizontal lines. When a line is complete, it clears and you earn points. Don't let the pieces reach the top of the board!

### How to Play

1. **Start the Game** — Click the "Restart Game" button to begin
2. **Move Pieces** — Use **arrow keys** (←/→) to move pieces left and right
3. **Rotate** — Press the **up arrow** (↑) to rotate pieces
4. **Speed Drop** — Hold the **down arrow** (↓) to make pieces fall faster
5. **Hard Drop** — Press **Space** to instantly drop a piece to the bottom
6. **Pause Game** — Press **P** to pause/unpause the game

### Scoring

- **1 Line Clear** — 100 points
- **2 Lines Clear** — 300 points
- **3 Lines Clear** — 500 points
- **4 Lines Clear** — 800 points

The game speeds up every 10 lines cleared, increasing the difficulty and challenge!

### Controls Reference

| Key | Action |
|-----|--------|
| ← → | Move piece left/right |
| ↑ | Rotate piece |
| ↓ | Soft drop (faster fall) |
| Space | Hard drop (instant fall) |
| P | Pause/Resume |
| Restart Button | New game |

## How to Run

1. Open `index.html` in your web browser
2. The game will start automatically
3. Click "Restart Game" to begin a new game at any time

## Technology

- **HTML5** — Canvas API for game rendering
- **Pure JavaScript** — No dependencies, vanilla JS implementation
- **CSS3** — Modern styling with responsive layout

## Game Mechanics

- The board is 10 columns wide and 20 rows tall
- Pieces spawn at the top of the board
- Each completed line is cleared automatically
- The game ends when pieces reach the top of the board
- Level increases every 10 lines cleared
- Game speed increases by reducing the drop delay as you level up

## Tips for High Scores

- **Plan Ahead** — Think about where pieces will land, not just where they are now
- **Build Strategically** — Create gaps on the sides for I-pieces (which are hardest to place)
- **Clear Multiple Lines** — Clearing 4 lines at once (a Tetris!) gives bonus points
- **Use Hard Drop** — Once you know where a piece should go, use space bar to drop it instantly and focus on the next piece

Enjoy the game and challenge yourself to beat your high score!
