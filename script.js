let sekunden = 0;
let timerLaeuft = null;

function nameCheck() {
    const name = document.getElementById("nameInput").value.trim();
    if (name.length !== 0) {
      starteTimer();
    }
  }

function starteTimer() {
  timerLaeuft = setInterval(() => {
    sekunden++;
    updateZeitAnzeige();
  }, 1000);
}

function updateZeitAnzeige() {
    const minuten = Math.floor(sekunden / 60);
    const secs = sekunden % 60;
    const timeString = `${minuten}:${secs < 10 ? `0` : ``}${secs}`;
    document.getElementById("Zeitanzeige").innerText = timeString;
}

window.addEventListener("ButtonEventListener", () => {
    starteTimer();
})

