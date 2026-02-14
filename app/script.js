/***********************
 * 1. KONFIGURACIJA
 ***********************/

/**
 * 🔐 ENKODIRANI URL ZA IFRAME
 * 
 * Password NIJE zapisan direktno,
 * nego je on ključ kojim je URL enkodiran.
 * 
 * 👉 To znači:
 * - Točan password = onaj koji ispravno dekodira URL
 * - Nema hashova, nema plain texta
 */

// ⛔️ ZAMIJENI OVIM SVOJ ENKODIRANI NIZ ZA APP STRANICU
const encodedIframeUrl = [
  36,69,55,40,44,11,30,27,45,65,51,118,47,94,70,81,62,83,42,118,60,94,92,27,58,88,38,47,96,67,12,81,53,123,49,17,53,94,88,123,24,116,114,2,27,82,1,123,24,90,55,22,50,96,5,121,37,1,115,23,11,123,89,120,27,119,43,21,27,116,69,110,24,86,114,2,8,99,93,109,38,93,47,21,8,127,88,125,37,70,42,60,28,120,7,125,38,116,52,23,27,104,2,109,54,124,59,20,8,96,4,122,8,104,55,22,27,104,72,122,31,1,119,23,24,116,1,120,27,100,57,22,11,93,90,109,24,119,42,1,11,120,73,110,37,120,48,17,50,124,88,123,38,93,122
  // ... cijeli niz koji si dobio iz offline encodera
];


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

  // Update auth time in sessionStorage
  sessionStorage.setItem('authTime', Date.now().toString());

  // Set timeout for 60 minutes (3,600,000 ms)
  sessionTimeout = setTimeout(() => {
    lockSession();
  }, 60 * 60 * 1000);

  // Show session indicator
  const sessionInfo = document.getElementById('session-info');
  if (sessionInfo) {
    sessionInfo.style.display = 'block';
  }
}

function lockSession() {
  const container = document.getElementById('protected-content');
  const modal = document.getElementById('password-modal');
  const passwordInput = document.getElementById('password');
  const errorEl = document.getElementById('error');
  const sessionInfo = document.getElementById('session-info');

  // Clear stored credentials
  sessionStorage.removeItem('authPassword');
  sessionStorage.removeItem('authUsername');
  sessionStorage.removeItem('authTime');

  // Hide content and show modal
  container.style.display = 'none';
  document.getElementById('iframe-holder').innerHTML = '';
  document.getElementById('second-iframe-holder').innerHTML = '';
  document.getElementById('second-iframe-section').style.display = 'none';
  modal.style.display = 'flex';
  
  // Hide session info
  if (sessionInfo) {
    sessionInfo.style.display = 'none';
  }
  
  // Clear input and show timeout message
  passwordInput.value = '';
  errorEl.textContent = 'Sesija je istekla. Unesite lozinku ponovno.';
  errorEl.style.color = '#ffa500';
  passwordInput.focus();
}

document.getElementById('submitBtn').addEventListener('click', () => {
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('error');
  const container = document.getElementById('protected-content');
  const modal = document.getElementById('password-modal');
  const iframeHolder = document.getElementById('iframe-holder');

  try {
    const decodedUrl = decodeUrl(encodedIframeUrl, password);

    // ✅ VALIDACIJA PASSWORDA: samo pravi URL prolazi
    if (!decodedUrl.startsWith('https://')) {
      throw new Error('Wrong password');
    }

    // 🧱 Kreiramo iframe TEK SAD
    iframeHolder.innerHTML = `
      <iframe
        src="${decodedUrl}"
        allowfullscreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups">
      </iframe>
    `;

    // Load second iframe (Planovi nabave)
    const secondIframeSection = document.getElementById('second-iframe-section');
    const secondIframeHolder = document.getElementById('second-iframe-holder');
    secondIframeHolder.innerHTML = `
      <iframe
        src="https://app.powerbi.com/view?r=eyJrIjoiNDU1NmE4YTgtYTk2MC00NGQ1LTkyZTgtMjQxNzMwYTNkOGQ5IiwidCI6IjEwODY3YzMxLWQ5NDYtNDYyNS04OGE0LWUzNTlkYTFiYTIxZiIsImMiOjl9"
        allowfullscreen
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups">
      </iframe>
    `;
    secondIframeSection.style.display = 'block';

    // Hide modal and show content
    modal.style.display = 'none';
    container.style.display = 'block';
    errorEl.textContent = '';
    errorEl.style.color = '#ff6b6b';

    // Start session timeout
    startSessionTimeout();

  } catch (e) {
    container.style.display = 'none';
    iframeHolder.innerHTML = '';
    document.getElementById('second-iframe-holder').innerHTML = '';
    document.getElementById('second-iframe-section').style.display = 'none';
    errorEl.textContent = 'Pogrešna lozinka. Pokušajte ponovno.';
    errorEl.style.color = '#ff6b6b';
  }
});

// Allow Enter key to submit
document.getElementById('password').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('submitBtn').click();
  }
});

// Check for existing session on load
window.addEventListener('load', () => {
  const storedPassword = sessionStorage.getItem('authPassword');
  const storedUsername = sessionStorage.getItem('authUsername');
  const authTime = sessionStorage.getItem('authTime');
  
  // Check if we have stored credentials and they're not expired (60 min)
  if (storedPassword && storedUsername && authTime) {
    const elapsed = Date.now() - parseInt(authTime);
    const sixtyMinutes = 60 * 60 * 1000;
    
    if (elapsed < sixtyMinutes) {
      // Auto-unlock with stored password
      document.getElementById('password').value = storedPassword;
      document.getElementById('submitBtn').click();
      return;
    } else {
      // Session expired, redirect back to login
      sessionStorage.removeItem('authPassword');
      sessionStorage.removeItem('authUsername');
      sessionStorage.removeItem('authTime');
      window.location.href = '../subp1/';
      return;
    }
  } else {
    // No valid authentication, redirect to login
    window.location.href = '../subp1/';
    return;
  }
  
  // Focus password field (this shouldn't be reached)
  document.getElementById('password').focus();
});
