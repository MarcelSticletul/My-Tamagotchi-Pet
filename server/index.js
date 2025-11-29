const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const DB_FILE = 'tamagotchi_data.json';

// Citim datele
function readData() {
    try {
        const data = fs.readFileSync(DB_FILE);
        return JSON.parse(data);
    } catch (error) {
        return { hunger: 100, happiness: 100, energy: 100 };
    }
}

// Salvăm datele
function saveData(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data));
}

// --- LOGICA DE TIMP (NOU) ---
// La fiecare 10 secunde (10000 ms), animalul suferă puțin
setInterval(() => {
    let data = readData();
    
    // Scade fericirea și crește foamea automat
    // Math.max/min asigură că nu trecem de 100 sau sub 0
    data.hunger = Math.min(100, data.hunger + 5);      // I se face foame
    data.happiness = Math.max(0, data.happiness - 5);  // Devine trist
    data.energy = Math.max(0, data.energy - 2);        // Obosește ușor
    
    saveData(data);
    console.log("⏳ Timpul trece... Animalul a flămânzit puțin.");
}, 10000); 
// -----------------------------

app.get('/status', (req, res) => {
    const data = readData();
    res.json(data);
});

app.post('/action', (req, res) => {
    const { action } = req.body; 
    let data = readData();

    if (action === 'feed') {
        data.hunger = Math.max(0, data.hunger - 20); // Scade foamea
        data.energy -= 2;
    } else if (action === 'play') {
        data.happiness = Math.min(100, data.happiness + 20);
        data.energy -= 10;
        data.hunger += 10;
    } else if (action === 'sleep') {
        data.energy = Math.min(100, data.energy + 40);
        data.hunger += 10;
    }
    
    saveData(data);
    res.json(data);
});

app.listen(PORT, () => {
    console.log(`Serverul Tamagotchi rulează pe http://localhost:${PORT}`);
});