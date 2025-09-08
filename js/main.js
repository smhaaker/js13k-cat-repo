startGameLoop();


// UI handling 
function showGameOver(message = "Game Over", showNextLevel = false, showRestart = true) {
    const modal = document.getElementById("game-over-modal");
    const textEl = document.getElementById("modal-text");
    const nextBtn = document.getElementById("next-level");
    const restartBtn = document.getElementById("restart");
  
    if (textEl) textEl.textContent = message;
  
    if (nextBtn) nextBtn.style.display = showNextLevel ? "inline-block" : "none";
    if (restartBtn) restartBtn.style.display = showRestart ? "inline-block" : "none";
  
    modal.style.display = "flex";
  }

document.getElementById("restart").addEventListener("click", () => {
  document.getElementById("game-over-modal").style.display = "none";
  startNextLevel({ sameLevel: true });
});

document.getElementById("next-level").addEventListener("click", () => {
    document.getElementById("game-over-modal").style.display = "none";
    startNextLevel({ sameLevel: false });
  });