startGameLoop();

function showGameOver(message = "Game Over", showNextLevel = false, showRestart = true) {
    const modal = document.getElementById("modal");
    
    const textEl = document.getElementById("mtext");
    const nextBtn = document.getElementById("next-level");
    const restartBtn = document.getElementById("restart");
  
    if (textEl) textEl.textContent = message;
  
    if (nextBtn) nextBtn.style.display = showNextLevel ? "inline-block" : "none";
    if (restartBtn) restartBtn.style.display = showRestart ? "inline-block" : "none";
  
    modal.style.display = "flex";
  }

document.getElementById("restart").addEventListener("click", () => {
  document.getElementById("modal").style.display = "none";
  startNextLevel({ sameLevel: true });
  gamePaused = false;
});

document.getElementById("next-level").addEventListener("click", () => {
    document.getElementById("modal").style.display = "none";
    startNextLevel({ sameLevel: false });
  });