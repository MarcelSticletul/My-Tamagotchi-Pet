const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const DB_FILE = 'tamagotchi_data.json';

// --- BAZA DE DATE (Structura Nouă) ---
function readData() {
    try {
        const data = fs.readFileSync(DB_FILE);
        const parsed = JSON.parse(data);
        // Siguranță: Dacă fișierul e vechi (doar o listă), îl resetăm
        if (Array.isArray(parsed)) {
            return { users: [], pets: [] };
        }
        return parsed;
    } catch (error) {
        return { users: [], pets: [] }; // Structura goală de start
    }
}

function saveData(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- GAME LOOP ---
setInterval(() => {
    let db = readData();
    let changed = false;

    db.pets.forEach(pet => {
        if (pet.food > 0 && pet.water > 0) pet.age += 0.1;

        if (Math.random() > 0.5) pet.food = Math.max(0, pet.food - 1);
        if (Math.random() > 0.5) pet.water = Math.max(0, pet.water - 1);

        if (pet.food < 3) {
            pet.energy = Math.max(0, pet.energy - 1);
        } else {
            pet.energy = Math.min(10, pet.energy + 0.5);
        }
        changed = true;
    });

    if (changed) saveData(db);
}, 3000);

// --- 🔐 AUTENTIFICARE (NOU) ---

// 1. SIGN UP (Înregistrare cu verificare duplicate)
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const db = readData();

    // Verificăm dacă există deja
    const existingUser = db.users.find(u => u.username === username);
    if (existingUser) {
        // Trimitem eroare 409 (Conflict) și mesajul
        return res.status(409).json({ error: `Numele '${username}' este deja luat! Încearcă '${username}1'.` });
    }

    // Creăm userul
    db.users.push({ username, password });
    saveData(db);
    res.json({ success: true });
});

// 2. LOGIN (Verificare parolă)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const db = readData();

    const user = db.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: "Nume sau parolă greșită!" });
    }
});

// --- ANIMALE ---

app.get('/pets/:owner', (req, res) => {
    const owner = req.params.owner;
    const db = readData();
    const myPets = db.pets.filter(p => p.owner === owner);
    res.json(myPets);
});

app.post('/pets', (req, res) => {
    const { owner, name } = req.body;
    const db = readData();

    const newPet = {
        id: uuidv4(),
        owner: owner,
        name: name || "Animaluț",
        age: 0, food: 10, water: 10, energy: 10
    };

    db.pets.push(newPet);
    saveData(db);
    res.json(newPet);
});

app.post('/pets/:id/action', (req, res) => {
    const { id } = req.params;
    const { action } = req.body;
    let db = readData();
    let pet = db.pets.find(p => p.id === id);

    if (pet) {
        if (action === 'feed') pet.food = Math.min(10, pet.food + 2);
        else if (action === 'water') pet.water = Math.min(10, pet.water + 2);
        else if (action === 'sleep') pet.energy = Math.min(10, pet.energy + 5);
        else if (action === 'speed') {
            pet.age += 1;
            pet.food = Math.max(0, pet.food - 2);
            pet.water = Math.max(0, pet.water - 2);
            pet.energy = Math.max(0, pet.energy - 2);
        }
        saveData(db);
        res.json(pet);
    } else {
        res.status(404).send("Pet not found");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});