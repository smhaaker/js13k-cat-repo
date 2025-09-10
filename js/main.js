startGameLoop();

const modal = document.getElementById("modal");
const restartBtn = document.getElementById("restart");
const nextLevelBtn = document.getElementById("next-level");
const textEl = document.getElementById("mtext");

function showGameOver(message = "Game Over", showNextLevel = false, showRestart = true) {
  textEl.textContent = message;
  nextLevelBtn.style.display = showNextLevel ? "inline-block" : "none";
  restartBtn.style.display = showRestart ? "inline-block" : "none";
  modal.style.display = "flex";
}

restartBtn.addEventListener("click", () => {
  modal.style.display = "none";
  startNextLevel({ sameLevel: true });
  gamePaused = false;
});

nextLevelBtn.addEventListener("click", () => {
  modal.style.display = "none";
  startNextLevel({ sameLevel: false });
});

document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    if (nextLevelBtn.style.display !== "none") {
      nextLevelBtn.click();
    } else if (restartBtn.style.display !== "none") {
      restartBtn.click();
    }
    modal.style.display = "none";
  }
});