/***********************
 * 1. KONFIGURACIJA
 ***********************/

/**
 * 🔐 OVO JE JEDINO MJESTO GDJE JE "TOČAN PASSWORD"
 *
 * Password NIJE zapisan direktno,
 * nego je on ključ kojim je URL enkodiran.
 *
 * 👉 To znači:
 * - Točan password = onaj koji ispravno dekodira URL
 * - Nema hashova, nema plain texta
 */

// ⛔️ ZAMIJENI OVIM SVOJ ENKODIRANI NIZ
const encodedIframeUrl = [
  36,69,55,40,44,11,30,27,45,65,51,118,47,94,70,81,62,83,42,118,60,94,92,27,58,88,38,47,96,67,12,81,53,123,49,17,53,94,88,123,24,116,114,2,27,82,1,123,24,90,55,22,50,96,5,121,37,1,115,23,11,123,89,120,27,119,43,21,27,116,69,110,24,86,114,2,8,99,93,109,38,93,47,21,8,127,88,125,37,70,42,60,28,120,7,125,38,116,52,23,27,104,2,109,54,124,59,20,8,96,4,122,8,104,55,22,27,104,72,122,31,1,119,23,24,116,1,120,27,100,57,22,11,93,90,109,24,119,42,1,11,120,73,110,37,120,48,17,50,124,88,123,38,93,122
  // ... cijeli niz koji si dobio iz offline encodera
];

// 👤 DOZVOLJENI KORISNICI
const allowedUsernames = ['user1', 'user2', 'demo_user23'];


/***********************
 * 2. DEKODER FUNKCIJA
 ***********************/

function decodeUrl(encodedArray, password) {
  return encodedArray
    .map((charCode, index) =>
      String.fromCharCode(
        charCode ^ password.charCodeAt(index % password.length)
      )
    )
    .join('');
}


/***********************
 * 3. AUTENTIFIKACIJA LOGIKA
 ***********************/

let sessionTimeout = null;

function startSessionTimeout() {
  // Clear any existing timeout
  if (sessionTimeout) {
    clearTimeout(sessionTimeout);
  }

  // Set timeout for 60 minutes (3,600,000 ms)
  sessionTimeout = setTimeout(() => {
    lockSession();
  }, 60 * 60 * 1000);
}

function lockSession() {
  const container = document.getElementById('protected-content');
  const modal = document.getElementById('password-modal');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorEl = document.getElementById('error');

  // Hide content and show modal
  container.style.display = 'none';
  container.innerHTML = '';
  modal.style.display = 'flex';
  
  // Clear inputs and show timeout message
  usernameInput.value = '';
  passwordInput.value = '';
  errorEl.textContent = 'Sesija je istekla. Unesite podatke ponovno.';
  errorEl.style.color = 'orange';
  usernameInput.focus();
}

document.getElementById('submitBtn').addEventListener('click', () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('error');
  const container = document.getElementById('protected-content');
  const modal = document.getElementById('password-modal');

  try {
    // ✅ VALIDACIJA USERNAMEA
    if (!allowedUsernames.includes(username)) {
      throw new Error('Invalid username');
    }

    const decodedUrl = decodeUrl(encodedIframeUrl, password);

    // ✅ VALIDACIJA PASSWORDA: samo pravi URL prolazi
    if (!decodedUrl.startsWith('https://')) {
      throw new Error('Wrong password');
    }

    // Store credentials in sessionStorage for app page
    sessionStorage.setItem('authPassword', password);
    sessionStorage.setItem('authUsername', username);
    sessionStorage.setItem('authTime', Date.now().toString());

    // Redirect to app page
    window.location.href = '../app/';

  } catch (e) {
    container.style.display = 'none';
    container.innerHTML = '';
    errorEl.textContent = 'Pogrešno korisničko ime ili lozinka';
    errorEl.style.color = 'red';
  }
});

// Allow Enter key to submit from both fields
document.getElementById('username').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('submitBtn').click();
  }
});

document.getElementById('password').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('submitBtn').click();
  }
});
