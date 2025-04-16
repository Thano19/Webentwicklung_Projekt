let sekunden = 0;
let timerLaeuft = null;
let spieler = "X";

function nameCheck() {
    const name = document.getElementById("nameInput").value.trim();
    if (name.length !== 0) {
        ingame("X");
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

function ingame(spieler) {
    const felder = document.querySelectorAll(".Feld");
    felder.forEach((feld) => {
        if (!feld.classList.contains("listener-hinzugefuegt")) {
            feld.addEventListener("click", () => {
                if (feld.textContent !== "") 
                    return;
                feld.textContent = spieler;
                feld.classList.add("deaktiviert");
            })
            feld.classList.add("listener-hinzugefuegt");
        }
    })
}
