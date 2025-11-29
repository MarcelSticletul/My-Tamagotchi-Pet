import './style.css' // Aceasta linie leagă stilul de site!

const API_URL = 'http://localhost:3000';

const petDisplay = document.getElementById('pet-display');
const hungerVal = document.getElementById('hunger-val');
const happinessVal = document.getElementById('happiness-val');
const energyVal = document.getElementById('energy-val');

function updateUI(data) {
  // Verificăm dacă elementele există înainte să le modificăm
  if(!hungerVal) return; 

  hungerVal.innerText = data.hunger;
  happinessVal.innerText = data.happiness;
  energyVal.innerText = data.energy;

  if (data.hunger < 30 || data.energy < 30) {
    petDisplay.innerText = '🤢'; 
  } else if (data.happiness > 80) {
    petDisplay.innerText = '😃'; 
  } else {
    petDisplay.innerText = '😐'; 
  }
}

async function fetchStatus() {
  try {
    const response = await fetch(`${API_URL}/status`);
    const data = await response.json();
    updateUI(data);
  } catch (error) {
    console.error("Eroare:", error);
  }
}

async function sendAction(actionType) {
  try {
    const response = await fetch(`${API_URL}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: actionType })
    });
    const data = await response.json();
    updateUI(data);
  } catch (error) {
    console.error("Eroare actiune:", error);
  }
}

// Legăm butoanele doar dacă pagina s-a încărcat
document.addEventListener('DOMContentLoaded', () => {
    const btnFeed = document.getElementById('btn-feed');
    if(btnFeed) {
        document.getElementById('btn-feed').addEventListener('click', () => sendAction('feed'));
        document.getElementById('btn-play').addEventListener('click', () => sendAction('play'));
        document.getElementById('btn-sleep').addEventListener('click', () => sendAction('sleep'));
        
        // Pornim verificarea statusului
        fetchStatus();
    }
});