let sekunden = 0;               // Spielzeit
let timerLaeuft = null;         // Referenz auf das Timer-Interval
let zugHistorie = [];           // Spielzugspeicherung
let ranglisteEintraege = [];    // Ranglistenspeicherung

function nameCheck() {
    const startButton = document.getElementById("startBtn");
    const nameInput = document.getElementById("nameInput");
    const name = nameInput.value.trim();

    if (startButton.textContent === "NEUSTART") {
        neustart();
        return;
    }
    if (name.length === 0) 
        return;
    starteTimer();
    Spielbeginn();
    startButton.textContent = "NEUSTART";
    nameInput.disabled = true;
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
    const timeString = `${minuten}:${secs < 10 ? "0" : ""}${secs}`;
    document.getElementById("Zeitanzeige").innerText = timeString;
}

function Spielbeginn() {
    for (let i = 0; i < 9; i++) {
        const feld = document.getElementById(`Feld${i}`);

        // Nur wenn noch kein Listener gesetzt wurde
        if (!feld.classList.contains("listener-hinzugefuegt")) {
            feld.addEventListener("click", async () => {
                if (feld.textContent !== "") 
                    return; // Klick ignorieren, wenn Feld schon belegt
                // Spielerzug (X)
                feld.textContent = "X";
                feld.classList.add("deaktiviert");

                if (Spielstand("X")) {
                    zugHistorie.push({ spielerFeld: feld, gegnerFeld: null }); //(ChatGPT)
                    spielBeenden("X");
                    return;
                }

                // Gegnerzug mit kleiner Verzögerung (ChatGPT)
                await new Promise((resolve) => setTimeout(resolve, 300));
                const gegnerFeld = Gegnerzug();

                zugHistorie.push({ spielerFeld: feld, gegnerFeld });

                if (gegnerFeld && Spielstand("O")) {
                    spielBeenden("O");
                }
            });
            feld.classList.add("listener-hinzugefuegt");
        }
    }
}

// Führt einen zufälligen Gegnerzug aus (O)
function Gegnerzug() {
    const freieFelder = [];
    for (let i = 0; i < 9; i++) {
        const feld = document.getElementById(`Feld${i}`);
        if (feld.textContent === "") {
            freieFelder.push(feld);
        }
    }

    if (freieFelder.length === 0) return null;

    const zufallsFeld = freieFelder[Math.floor(Math.random() * freieFelder.length)];
    zufallsFeld.textContent = "O";
    zufallsFeld.style.color = "blue";
    zufallsFeld.classList.add("deaktiviert");

    return zufallsFeld;
}

// Prüft, ob der angegebene Spieler gewonnen hat
function Spielstand(spieler) {
    const kombinationen = [
        ["Feld0", "Feld1", "Feld2"],
        ["Feld3", "Feld4", "Feld5"],
        ["Feld6", "Feld7", "Feld8"],
        ["Feld0", "Feld3", "Feld6"],
        ["Feld1", "Feld4", "Feld7"],
        ["Feld2", "Feld5", "Feld8"],
        ["Feld0", "Feld4", "Feld8"],
        ["Feld2", "Feld4", "Feld6"]
    ];

    return kombinationen.some(kombi => kombi.every(feldId => document.getElementById(feldId).textContent === spieler));
}

// Beendet das Spiel, zeigt Alert und fügt ggf. zur Rangliste hinzu
function spielBeenden(sieger) {
    clearInterval(timerLaeuft); // Timer anhalten
    alert(`Spiel beendet! ${sieger} gewinnt!`);

    // Nur wenn Spieler (X) gewinnt, zur Rangliste hinzufügen
    if (sieger === "X") {
        const name = document.getElementById("nameInput").value.trim();
        zurRanglisteHinzufuegen(name, sekunden);
    }

    // Alle Felder deaktivieren
    for (let i = 0; i < 9; i++) {
        document.getElementById(`Feld${i}`).classList.add("deaktiviert");
    }
}

// Macht den letzten Spielzug rückgängig (Spieler und Gegner)
function letzterZugZuruecknehmen() {
    if (zugHistorie.length === 0) return;

    const letzterZug = zugHistorie.pop();

    if (letzterZug.gegnerFeld) {
        letzterZug.gegnerFeld.textContent = "";
        letzterZug.gegnerFeld.classList.remove("deaktiviert");
        letzterZug.gegnerFeld.style.color = "";
    }

    if (letzterZug.spielerFeld) {
        letzterZug.spielerFeld.textContent = "";
        letzterZug.spielerFeld.classList.remove("deaktiviert");
    }
}

// ChatGPT
function zurRanglisteHinzufuegen(name, sekunden) {
    ranglisteEintraege.push({ name, sekunden });

    // Sortieren: Schnellste Zeit oben
    ranglisteEintraege.sort((a, b) => a.sekunden - b.sekunden);

    // Rangliste im HTML aktualisieren
    const liste = document.getElementById("ranglisteListe");
    liste.innerHTML = "";

    for (const eintrag of ranglisteEintraege) {
        const minuten = Math.floor(eintrag.sekunden / 60);
        const sek = eintrag.sekunden % 60;
        const zeitString = `${minuten}:${sek < 10 ? "0" : ""}${sek}`;
        const li = document.createElement("li");
        li.textContent = `${eintrag.name} – ${zeitString}`;
        liste.appendChild(li);
    }
}

// Setzt das Spiel komplett zurück für eine neue Runde
function neustart() {
    // Spielfeld leeren und aktivieren
    for (let i = 0; i < 9; i++) {
        const feld = document.getElementById(`Feld${i}`);
        feld.textContent = "";
        feld.classList.remove("deaktiviert");
    }

    // Spielstatus zurücksetzen
    sekunden = 0;
    zugHistorie = [];
    updateZeitAnzeige();
    clearInterval(timerLaeuft);
    timerLaeuft = null;

    // Eingabefeld und Button zurücksetzen
    document.getElementById("nameInput").value = "";
    document.getElementById("nameInput").disabled = false;
    document.getElementById("startBtn").textContent = "START";
}
