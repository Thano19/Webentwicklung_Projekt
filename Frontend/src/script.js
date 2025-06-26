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

        if (!feld.classList.contains("listener-hinzugefuegt")) {
            feld.addEventListener("click", async () => {
                if (feld.textContent !== "") 
                    return;

                feld.textContent = "X";
                feld.classList.add("deaktiviert");

                if (Spielstand("X")) {
                    zugHistorie.push({ spielerFeld: feld, gegnerFeld: null });
                    spielBeenden("X");
                    return;
                }

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

function spielBeenden(sieger) {
    clearInterval(timerLaeuft); // Timer anhalten
    alert(`Spiel beendet! ${sieger} gewinnt!`);

    if (sieger === "X") {
        const name = document.getElementById("nameInput").value.trim();
        zurRanglisteHinzufuegen(name, sekunden);
    }

    for (let i = 0; i < 9; i++) {
        document.getElementById(`Feld${i}`).classList.add("deaktiviert");
    }
}

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

function zurRanglisteHinzufuegen(name, sekunden) {
    ranglisteEintraege.push({ name, sekunden });
    ranglisteEintraege.sort((a, b) => a.sekunden - b.sekunden);
    localStorage.setItem("rangliste", JSON.stringify(ranglisteEintraege));
    ranglisteAnzeigen();
}

function ranglisteAnzeigen() {
    const gespeicherteRangliste = localStorage.getItem("rangliste");
    if (gespeicherteRangliste) {
        ranglisteEintraege = JSON.parse(gespeicherteRangliste);
    }

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

function neustart() {
    for (let i = 0; i < 9; i++) {
        const feld = document.getElementById(`Feld${i}`);
        feld.textContent = "";
        feld.classList.remove("deaktiviert");
    }

    sekunden = 0;
    zugHistorie = [];
    updateZeitAnzeige();
    clearInterval(timerLaeuft);
    timerLaeuft = null;

    document.getElementById("nameInput").value = "";
    document.getElementById("nameInput").disabled = false;
    document.getElementById("startBtn").textContent = "START";
}

// Beim Laden der Seite die gespeicherte Rangliste anzeigen
document.addEventListener("DOMContentLoaded", () => {
    ranglisteAnzeigen();
});

async function requestTextWithGET(url) {
  const response = await fetch(url);
  console.log('Response:', response); // vollständiges Response-Objekt
  const text = await response.text();
  console.log('Response-Text:', text); // Text aus dem Response-Body
}

requestTextWithGET('http://127.0.0.1:3001/');
console.log('Zwischenzeitlich weiterarbeiten...');

// API Base URL
const API_BASE_URL = 'http://localhost:3001/api';

// Funktion: Rangliste von der Datenbank laden
async function ranglisteVonDatenbankLaden() {
    try {
        const response = await fetch(`${API_BASE_URL}/rangliste`);
        if (!response.ok) throw new Error('Fehler beim Laden der Rangliste');
        
        const eintraege = await response.json();
        ranglisteEintraege = eintraege;
        ranglisteAnzeigen();
    } catch (error) {
        console.error('Fehler beim Laden der Rangliste:', error);
        // Fallback zu localStorage
        ranglisteAnzeigen();
    }
}

// Funktion: Eintrag in die Datenbank speichern
async function inDatenbankSpeichern(name, sekunden) {
    try {
        const response = await fetch(`${API_BASE_URL}/rangliste`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, sekunden })
        });
        
        if (!response.ok) throw new Error('Fehler beim Speichern');
        
        const neuerEintrag = await response.json();
        console.log('✅ Erfolgreich gespeichert:', neuerEintrag);
        
        // Rangliste neu laden
        await ranglisteVonDatenbankLaden();
        
    } catch (error) {
        console.error('Fehler beim Speichern:', error);
        // Fallback zu localStorage
        zurRanglisteHinzufuegen(name, sekunden);
    }
}

// Angepasste Funktion für Spielende
function spielBeenden(sieger) {
    clearInterval(timerLaeuft);
    alert(`Spiel beendet! ${sieger} gewinnt!`);

    if (sieger === "X") {
        const name = document.getElementById("nameInput").value.trim();
        // In Datenbank speichern statt localStorage
        inDatenbankSpeichern(name, sekunden);
    }

    for (let i = 0; i < 9; i++) {
        document.getElementById(`Feld${i}`).classList.add("deaktiviert");
    }
}

// Beim Laden der Seite Rangliste von Datenbank laden
document.addEventListener("DOMContentLoaded", () => {
    ranglisteVonDatenbankLaden();
});