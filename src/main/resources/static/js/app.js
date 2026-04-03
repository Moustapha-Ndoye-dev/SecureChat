'use strict';

// =====================================================
// TOAST NOTIFICATION SYSTEM
// =====================================================
function showToast(message, type = 'info', title = '') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: `<svg viewBox="0 0 24 24" fill="currentColor" width="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
        error:   `<svg viewBox="0 0 24 24" fill="currentColor" width="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`,
        warning: `<svg viewBox="0 0 24 24" fill="currentColor" width="16"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
        info:    `<svg viewBox="0 0 24 24" fill="currentColor" width="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
    };
    const defaultTitles = { success: 'Succès', error: 'Erreur', warning: 'Attention', info: 'Info' };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-body">
            <div class="toast-title">${title || defaultTitles[type]}</div>
            <div class="toast-msg">${message}</div>
        </div>
        <button class="toast-close" aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
    `;

    const dismiss = () => {
        toast.classList.add('out');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    };
    toast.querySelector('.toast-close').addEventListener('click', dismiss);
    container.appendChild(toast);

    const delay = type === 'error' ? 5000 : 3500;
    setTimeout(dismiss, delay);
}

// =====================================================
// CONSTANTES
// =====================================================
const MSG = { CHAT: 'CHAT', NEG_REQUEST: 'NEG_REQUEST', NEG_ACCEPT: 'NEG_ACCEPT', NEG_REFUSE: 'NEG_REFUSE', NEG_MISMATCH: 'NEG_MISMATCH' };
const AVATAR_COLORS = ['#e05c73','#c2594e','#d4802a','#d4ac29','#6cba6c','#3a9e6e','#3aa0c2','#5b7ae0','#8b5be0','#c25bb5'];
const AVAILABLE_CRYPTO_PROFILES = ['RSA_AES_GCM', 'ECDH_AES_GCM', 'ECDH_AES_GCM_SIGNED'];
const PROFILE_LABELS = {
    RSA_AES_GCM: 'RSA',
    ECDH_AES_GCM: 'ECDH',
    ECDH_AES_GCM_SIGNED: 'ECDH signe'
};
const NEGOTIATED_PROFILE_PREFERENCE = ['ECDH_AES_GCM_SIGNED', 'ECDH_AES_GCM', 'RSA_AES_GCM'];
const CRYPTO_CONSOLE_LOG_KEY = 'securechat_crypto_console_log';
let cryptoJournalSeq = 0;
const CONFIG_SUBTITLE_ALGORITHMS = 'Choisissez de 1 à 3 profils réels de chiffrement';
const CONFIG_SUBTITLE_JOURNAL = 'Journal des opérations de chiffrement (affichage local uniquement).';
const CONFIG_TAB_STORAGE_KEY = 'securechat_config_subtab';

function switchConfigTab(tab) {
    const algo = document.getElementById('config-tab-algorithms');
    const jour = document.getElementById('config-tab-journal');
    const btnA = document.getElementById('tabConfigAlgorithms');
    const btnJ = document.getElementById('tabConfigJournal');
    if (!algo || !jour) return;
    const isJournal = tab === 'journal';
    algo.classList.toggle('hidden', isJournal);
    jour.classList.toggle('hidden', !isJournal);
    if (btnA) btnA.classList.toggle('active', !isJournal);
    if (btnJ) btnJ.classList.toggle('active', isJournal);
    const sub = document.getElementById('configSubtitle');
    if (sub) sub.textContent = isJournal ? CONFIG_SUBTITLE_JOURNAL : CONFIG_SUBTITLE_ALGORITHMS;
    try {
        sessionStorage.setItem(CONFIG_TAB_STORAGE_KEY, isJournal ? 'journal' : 'algorithms');
    } catch (_) { /* navigation privée */ }
}

function restoreConfigTabPreference() {
    let tab = 'algorithms';
    try {
        if (sessionStorage.getItem(CONFIG_TAB_STORAGE_KEY) === 'journal') {
            tab = 'journal';
        }
    } catch (_) {}
    switchConfigTab(tab);
}

/** Journalisation : visible uniquement depuis Paramètres, pas à la première config / restauration clés. */
function setConfigJournalUiAvailable(available) {
    const tabs = document.querySelector('.config-settings-tabs');
    if (!tabs) return;
    if (available) {
        tabs.classList.remove('hidden');
    } else {
        tabs.classList.add('hidden');
        switchConfigTab('algorithms');
    }
}

function isCryptoConsoleDebugEnabled() {
    return localStorage.getItem(CRYPTO_CONSOLE_LOG_KEY) === '1';
}

function setCryptoConsoleDebugEnabled(on) {
    if (on) localStorage.setItem(CRYPTO_CONSOLE_LOG_KEY, '1');
    else localStorage.removeItem(CRYPTO_CONSOLE_LOG_KEY);
}

function cryptoTerminalNowTs() {
    return new Date().toLocaleTimeString('fr-FR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function updateCryptoTerminalLed() {
    const led = document.getElementById('cryptoTerminalLed');
    if (led) led.classList.toggle('is-on', isCryptoConsoleDebugEnabled());
}

function appendCryptoTerminalLine(text, variant) {
    const body = document.getElementById('cryptoTerminalBody');
    if (!body) return;
    const line = document.createElement('div');
    line.className = 'crypto-terminal-line' + (variant ? ' ' + variant : '');
    const ts = document.createElement('span');
    ts.className = 'crypto-terminal-ts';
    ts.textContent = '[' + cryptoTerminalNowTs() + ']';
    const val = document.createElement('span');
    val.className = 'crypto-terminal-value';
    val.textContent = text;
    line.appendChild(ts);
    line.appendChild(document.createTextNode(' '));
    line.appendChild(val);
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
}

function appendCryptoTerminalKV(label, value, valueMono) {
    const body = document.getElementById('cryptoTerminalBody');
    if (!body) return;
    const line = document.createElement('div');
    line.className = 'crypto-terminal-line';
    const ts = document.createElement('span');
    ts.className = 'crypto-terminal-ts';
    ts.textContent = '[' + cryptoTerminalNowTs() + ']';
    const lb = document.createElement('span');
    lb.className = 'crypto-terminal-label';
    lb.textContent = label;
    const val = document.createElement('span');
    val.className = 'crypto-terminal-value' + (valueMono ? ' crypto-terminal-mono' : '');
    val.textContent = value;
    line.appendChild(ts);
    line.appendChild(document.createTextNode(' '));
    line.appendChild(lb);
    line.appendChild(document.createTextNode(' '));
    line.appendChild(val);
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
}

function appendCryptoTerminalBlockTitle(title) {
    const body = document.getElementById('cryptoTerminalBody');
    if (!body) return;
    const t = document.createElement('div');
    t.className = 'crypto-terminal-block-title';
    t.textContent = title;
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
}

function appendCryptoTerminalStep(title) {
    const body = document.getElementById('cryptoTerminalBody');
    if (!body) return;
    const t = document.createElement('div');
    t.className = 'crypto-terminal-step';
    t.textContent = title;
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
}

function appendCryptoTerminalPre(text) {
    const body = document.getElementById('cryptoTerminalBody');
    if (!body) return;
    const pre = document.createElement('pre');
    pre.className = 'crypto-terminal-pre';
    pre.textContent = text;
    body.appendChild(pre);
    body.scrollTop = body.scrollHeight;
}

function appendCryptoTerminalSep() {
    const body = document.getElementById('cryptoTerminalBody');
    if (!body) return;
    const d = document.createElement('div');
    d.className = 'crypto-terminal-sep';
    d.textContent = '────────────────────────────────────────';
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
}

function seedCryptoTerminalWelcome() {
    appendCryptoTerminalLine('session prête — activez « Journal actif » pour tracer les envois chiffrés', 'dim');
}

function clearCryptoTerminal() {
    const body = document.getElementById('cryptoTerminalBody');
    if (!body) return;
    body.innerHTML = '';
    appendCryptoTerminalLine('buffer effacé', 'dim');
    appendCryptoTerminalSep();
}

function initCryptoTerminalIfEmpty() {
    const body = document.getElementById('cryptoTerminalBody');
    if (body && body.childElementCount === 0) {
        seedCryptoTerminalWelcome();
    }
}

function syncCryptoDebugCheckbox() {
    const cb = document.getElementById('cryptoConsoleLogCb');
    if (cb) cb.checked = isCryptoConsoleDebugEnabled();
    updateCryptoTerminalLed();
}

function attachCryptoDebugCheckboxListener() {
    const cb = document.getElementById('cryptoConsoleLogCb');
    if (!cb || cb.dataset.bound === '1') return;
    cb.dataset.bound = '1';
    cb.addEventListener('change', () => {
        setCryptoConsoleDebugEnabled(cb.checked);
        updateCryptoTerminalLed();
        if (cb.checked) {
            console.warn('[SecureChat] Journal crypto activé : ne pas utiliser sur un poste partagé.');
            appendCryptoTerminalLine('journal ACTIF — prochains envois tracés ci-dessous', 'warn');
            appendCryptoTerminalSep();
        } else {
            appendCryptoTerminalLine('journal désactivé', 'dim');
        }
    });
}

function initCryptoDebugOption() {
    syncCryptoDebugCheckbox();
    attachCryptoDebugCheckboxListener();
    initCryptoTerminalIfEmpty();
    const clearBtn = document.getElementById('cryptoTerminalClearBtn');
    if (clearBtn && clearBtn.dataset.bound !== '1') {
        clearBtn.dataset.bound = '1';
        clearBtn.addEventListener('click', () => clearCryptoTerminal());
    }
}

function avatarColor(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = Math.trunc(h * 31 + (name.codePointAt(i) || 0));
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name) { return name ? name.substring(0,1).toUpperCase() : '?'; }
function nowHHMM() { return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
function profileLabel(profile) { return PROFILE_LABELS[profile] || profile; }

/** Comparaison insensible à la casse / espaces (principal Spring vs localStorage). */
function sameUser(a, b) {
    if (a == null || b == null) return false;
    return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

/** Aligne l’identifiant reçu sur le nom canonique du répertoire (évite doublons de fil). */
function resolveCanonicalUsername(id) {
    if (id == null || id === '') return id;
    const found = allUsers.find(u => sameUser(u.username, id));
    return found ? found.username : String(id).trim();
}

function resolveSharedKeyForThread(thread) {
    if (thread == null || thread === '') return undefined;
    if (sharedKeys[thread]) return sharedKeys[thread];
    const k = Object.keys(sharedKeys).find(key => sameUser(key, thread));
    return k ? sharedKeys[k] : undefined;
}

function discussionSessionsStorageKey() {
    return username ? 'securechat_sessions_' + username : '';
}

function loadDiscussionSessions() {
    const storageKey = discussionSessionsStorageKey();
    if (!storageKey) {
        discussionSessions = {};
        return;
    }
    discussionSessions = safeJsonParse(localStorage.getItem(storageKey), {}) || {};
    if (username && discussionSessions[username]) {
        delete discussionSessions[username];
        persistDiscussionSessions();
    }
}

function persistDiscussionSessions() {
    const storageKey = discussionSessionsStorageKey();
    if (!storageKey) {
        return;
    }
    localStorage.setItem(storageKey, JSON.stringify(discussionSessions));
}

function getDiscussionSession(contact) {
    return discussionSessions[contact] || null;
}

function setDiscussionSession(contact, sessionPatch) {
    if (!contact || sameUser(contact, username)) {
        return;
    }
    const existingSession = discussionSessions[contact];
    discussionSessions[contact] = existingSession ? { ...existingSession, ...sessionPatch } : { ...sessionPatch };
    persistDiscussionSessions();
}

function clearDiscussionSession(contact) {
    if (!contact) {
        return;
    }
    delete discussionSessions[contact];
    persistDiscussionSessions();
}

function choosePreferredNegotiatedProfile(profiles = []) {
    return NEGOTIATED_PROFILE_PREFERENCE.find(profile => profiles.includes(profile)) || null;
}

// =====================================================
// ÉTAT GLOBAL
// =====================================================
let stompClient = null;
let username = null;
let jwtToken = null;
let myPrivateKey = null;
let myPublicKeyJwk = null;
let myRsaPrivateKey = null;
let myRsaPublicKey = null;
let mySigningPrivateKey = null;
let mySigningPublicKey = null;
let mySupportedProtocols = [];
let activeRecipient = null;
let userMessages = {};
/** Ordre stable des messages locaux avant id serveur (écho ignoré). */
let localMessageSeq = 0;
let sharedKeys = {};
let allUsers = [];
let discussionSessions = {};
let pendingNegRequester = null;
let pendingNegotiationQueue = [];
let pendingNegotiationContacts = new Set();
let isFirstTime = false;
let loginCryptoOnboardingRequired = false;

// =====================================================
// INIT
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    jwtToken = localStorage.getItem('securechat_token');
    username  = localStorage.getItem('securechat_user');
    if (jwtToken && username) {
        loadDiscussionSessions();
        loadKeysFromStorage().then(() => fetchMyProfile());
    } else {
        showPage('auth');
    }
});

// =====================================================
// NAVIGATION
// =====================================================
function showPage(page) {
    document.getElementById('auth-page').classList.toggle('hidden', page !== 'auth');
    document.getElementById('config-page').classList.toggle('hidden', page !== 'config');
    document.getElementById('chat-page').classList.toggle('hidden', page !== 'chat');
}

function showChatView(show) {
    document.getElementById('chatView').classList.toggle('hidden', !show);
    document.getElementById('welcomeView').classList.toggle('hidden', show);
}

// =====================================================
// CRYPTO : ECDH P-256 + AES-256-GCM
// =====================================================
async function generateECDHKeyPair() {
    console.log("[TRACE] Génération de la paire de clés cryptographiques locales...");
    return crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits']);
}

async function generateRSAKeyPair() {
    return crypto.subtle.generateKey({
        name: 'RSA-OAEP',
        modulusLength: 3072,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
    }, true, ['encrypt', 'decrypt']);
}

async function generateSigningKeyPair() {
    return crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
}

async function exportPublicKeyJwk(pubKey) {
    const jwk = await crypto.subtle.exportKey('jwk', pubKey);
    return JSON.stringify(jwk);
}

async function exportPrivateKeyJwk(privKey) {
    const jwk = await crypto.subtle.exportKey('jwk', privKey);
    return JSON.stringify(jwk);
}

async function exportRsaPublicKeyJwk(pubKey) {
    const jwk = await crypto.subtle.exportKey('jwk', pubKey);
    return JSON.stringify(jwk);
}

async function exportRsaPrivateKeyJwk(privKey) {
    const jwk = await crypto.subtle.exportKey('jwk', privKey);
    return JSON.stringify(jwk);
}

async function importPublicKeyJwk(jwkStr) {
    const jwk = JSON.parse(jwkStr);
    return crypto.subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
}

async function importPrivateKeyJwk(jwkStr) {
    const jwk = JSON.parse(jwkStr);
    return crypto.subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveKey', 'deriveBits']);
}

async function importRsaPrivateKeyJwk(jwkStr) {
    const jwk = JSON.parse(jwkStr);
    return crypto.subtle.importKey('jwk', jwk, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']);
}

async function importRsaPublicKeyJwk(jwkStr) {
    const jwk = JSON.parse(jwkStr);
    return crypto.subtle.importKey('jwk', jwk, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
}

async function importSigningPrivateKeyJwk(jwkStr) {
    const jwk = JSON.parse(jwkStr);
    return crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
}

async function importSigningPublicKeyJwk(jwkStr) {
    const jwk = JSON.parse(jwkStr);
    return crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
}

async function deriveSharedAESKey(myPrivKey, theirPubKey) {
    return crypto.subtle.deriveKey(
        { name: 'ECDH', public: theirPubKey },
        myPrivKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

async function encryptAESGCM(text, aesKey) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const cipherBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, encoded);
    const toB64 = buf => btoa(String.fromCodePoint(...new Uint8Array(buf)));
    return { cipherText: toB64(cipherBuf), iv: toB64(iv.buffer) };
}

async function decryptAESGCM(cipherTextB64, ivB64, aesKey) {
    try {
        const fromB64 = b64 => Uint8Array.from(atob(b64), c => c.codePointAt(0) || 0);
        const iv = fromB64(ivB64);
        const ct = fromB64(cipherTextB64);
        const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ct);
        return new TextDecoder().decode(plain);
    } catch (e) {
        console.warn('Déchiffrement échoué:', e);
        return '[🔒 message chiffré - clé manquante]';
    }
}

function bytesToBase64(bytes) {
    return btoa(String.fromCodePoint(...new Uint8Array(bytes)));
}

function base64ToBytes(b64) {
    return Uint8Array.from(atob(b64), c => c.codePointAt(0) || 0);
}

async function sha256HexFromBytes(uint8) {
    const buf = await crypto.subtle.digest('SHA-256', uint8);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexPreviewBytes(uint8, maxBytes = 20) {
    if (!uint8 || uint8.length === 0) return '(vide)';
    const n = Math.min(maxBytes, uint8.length);
    const parts = [];
    for (let i = 0; i < n; i++) {
        parts.push(uint8[i].toString(16).padStart(2, '0'));
    }
    const suffix = uint8.length > maxBytes ? ' … +' + (uint8.length - maxBytes) + ' o' : '';
    return parts.join(' ') + suffix;
}

function truncateTerminalString(s, maxChars) {
    if (s == null) return '';
    if (s.length <= maxChars) return s;
    return s.slice(0, maxChars) + '\n… +' + (s.length - maxChars) + ' car.';
}

function safeBase64ToBytes(b64) {
    try {
        return base64ToBytes(b64);
    } catch {
        return null;
    }
}

function safeJsonParse(value, fallback = null) {
    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn('JSON invalide:', error);
        return fallback;
    }
}

async function exportAesKeyRaw(aesKey) {
    return new Uint8Array(await crypto.subtle.exportKey('raw', aesKey));
}

const FORBIDDEN_CLEAR_WIRE_KEYS = ['plainText', 'clearText', 'messageClair', 'decryptedBody', 'bodyClear'];

/** Journal + preuves vérifiables (empreintes, tailles, JSON réseau, round-trip). */
async function logCryptoSendPipeline(opts) {
    const {
        profile,
        recipient,
        plainText,
        cipherText,
        iv,
        aesKey,
        wrappedKey,
        senderWrappedKey,
        signature,
        wireMessage
    } = opts;

    cryptoJournalSeq += 1;
    const seq = cryptoJournalSeq;

    let aesHex = null;
    let roundtrip = null;
    let plainBytes;
    let ctBytes;
    let ivBytes;
    let plainHash = '';
    let ctHash = '';
    let wireHash = '';
    let wireJson = '';

    try {
        plainBytes = new TextEncoder().encode(plainText);
        ctBytes = safeBase64ToBytes(cipherText);
        ivBytes = safeBase64ToBytes(iv);
        if (!ctBytes || !ivBytes) {
            throw new Error('Décodage base64 du ciphertext ou de l’IV impossible');
        }

        plainHash = await sha256HexFromBytes(plainBytes);
        ctHash = await sha256HexFromBytes(ctBytes);

        if (wireMessage) {
            wireJson = JSON.stringify(wireMessage);
            wireHash = await sha256HexFromBytes(new TextEncoder().encode(wireJson));
        }

        if (aesKey) {
            const raw = await exportAesKeyRaw(aesKey);
            aesHex = [...raw].map(b => b.toString(16).padStart(2, '0')).join('');
        }
        if (aesKey && cipherText && iv) {
            roundtrip = await decryptAESGCM(cipherText, iv, aesKey);
        }
    } catch (err) {
        console.error('[SecureChat] Journal crypto — erreur:', err);
        appendCryptoTerminalBlockTitle('preuve E2E #' + seq);
        appendCryptoTerminalLine(String(err && err.message ? err.message : err), 'err');
        appendCryptoTerminalSep();
        return;
    }

    console.group('%c[SecureChat — preuve E2E] envoi #' + seq, 'color:#b45309;font-weight:bold');
    console.log('Profil / destinataire:', profile, recipient);
    console.log('SHA-256 UTF-8 (clair):', plainHash);
    console.log('SHA-256 (ciphertext binaire):', ctHash);
    console.log('Identique ?', plainHash === ctHash, '(doit être false)');
    if (wireJson) {
        console.log('SHA-256 (JSON STOMP):', wireHash);
        console.log('JSON:', wireJson);
    }
    console.log('Round-trip === clair:', roundtrip === plainText);
    console.groupEnd();

    appendCryptoTerminalBlockTitle('preuve E2E — envoi #' + seq);
    appendCryptoTerminalLine('Chiffrement Web Crypto (navigateur). Le backend ne reçoit que le JSON « transport ».', 'dim');

    appendCryptoTerminalStep('A — Texte saisi (jamais champ JSON du message)');
    appendCryptoTerminalKV('profil', String(profile), false);
    appendCryptoTerminalKV('destinataire', String(recipient), false);
    appendCryptoTerminalKV('clair', plainText, false);
    appendCryptoTerminalKV('octets_UTF-8', String(plainBytes.length), false);
    appendCryptoTerminalKV('SHA-256 UTF-8', plainHash, true);
    appendCryptoTerminalLine('→ Absent du paquet STOMP : seules des formes chiffrées/base64 sont expédiées.', 'dim');

    appendCryptoTerminalStep('B — AES-256-GCM (ciphertext + tag intégrité)');
    appendCryptoTerminalKV('IV octets', String(ivBytes.length) + ' (96 bits, nonce GCM)', false);
    appendCryptoTerminalKV('ciphertext octets', String(ctBytes.length) + ' (données + tag 128 bits en fin)', false);
    appendCryptoTerminalLine('aperçu binaire (hex) : ' + hexPreviewBytes(ctBytes, 28), 'dim');
    appendCryptoTerminalKV('SHA-256 binaire ciphertext', ctHash, true);
    appendCryptoTerminalKV('iv_b64', iv, true);
    appendCryptoTerminalKV('ciphertext_b64', cipherText, true);
    if (plainHash === ctHash) {
        appendCryptoTerminalLine('Anomalie : empreinte clair = empreinte cipher (ne devrait pas arriver).', 'err');
    } else {
        appendCryptoTerminalLine('Preuve : H(SHA-256) du clair ≠ H du ciphertext → le flux réseau n’est pas le texte brut.', 'ok');
    }

    if (profile === 'RSA_AES_GCM') {
        appendCryptoTerminalLine('RSA : clé AES éphémère uniquement dans wrappedKey (RSA-OAEP), pas en clair sur le fil.', 'dim');
    } else {
        appendCryptoTerminalLine('ECDH : clé AES dérivée en local ; le serveur ne voit que cipherText + iv (+ signature si profil signé).', 'dim');
    }

    appendCryptoTerminalStep('C — Clé de session AES (preuve locale)');
    if (aesHex != null) {
        appendCryptoTerminalKV('aes256_raw_hex', aesHex, true);
    } else {
        appendCryptoTerminalLine('Export AES indisponible (clé non extractible).', 'warn');
    }
    if (wrappedKey) appendCryptoTerminalKV('rsa_wrap_destinataire_b64', wrappedKey, true);
    if (senderWrappedKey) appendCryptoTerminalKV('rsa_wrap_expediteur_b64', senderWrappedKey, true);
    if (signature) appendCryptoTerminalKV('ecdsa_signature_b64', signature, true);

    appendCryptoTerminalStep('D — Corps exact envoyé au serveur (STOMP /app/chat)');
    if (wireMessage && wireJson) {
        for (const k of FORBIDDEN_CLEAR_WIRE_KEYS) {
            if (Object.hasOwn(wireMessage, k)) {
                appendCryptoTerminalLine('ERREUR : clé interdite dans le paquet : ' + k, 'err');
            }
        }
        const keys = Object.keys(wireMessage).sort((a, b) => a.localeCompare(b)).join(', ');
        appendCryptoTerminalKV('cles_JSON', keys, false);
        if (wireMessage.cipherText !== cipherText || wireMessage.iv !== iv) {
            appendCryptoTerminalLine('Incohérence : objet wire ≠ variables chiffrées locales.', 'err');
        } else {
            appendCryptoTerminalLine('Cohérence : cipherText/iv du JSON = valeurs issues du chiffrement.', 'ok');
        }
        appendCryptoTerminalKV('octets_JSON_UTF-8', String(new TextEncoder().encode(wireJson).length), false);
        appendCryptoTerminalKV('SHA-256 JSON', wireHash, true);
        appendCryptoTerminalPre(truncateTerminalString(wireJson, 640));
        appendCryptoTerminalLine('Ce JSON est ce qui transite ; il ne contient pas le message utilisateur en lisible.', 'ok');
    } else {
        appendCryptoTerminalLine('Paquet réseau non fourni au journal (anomalie).', 'warn');
    }

    appendCryptoTerminalStep('E — Déchiffrement inverse (même machine, contrôle)');
    if (roundtrip != null) {
        appendCryptoTerminalKV('resultat_decrypt', roundtrip, false);
        if (roundtrip === plainText) {
            appendCryptoTerminalLine('Round-trip OK : decrypt(AES, iv, cipher) === texte saisi.', 'ok');
        } else {
            appendCryptoTerminalLine('Round-trip : échec ou texte substitué (ex. clé absente côté API decrypt).', 'err');
        }
    }

    appendCryptoTerminalSep();
}

async function importAesKeyRaw(rawKey) {
    return crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
}

async function wrapAesKeyForRsa(aesKey, rsaPublicKey) {
    const rawKey = await exportAesKeyRaw(aesKey);
    const wrapped = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, rsaPublicKey, rawKey);
    return bytesToBase64(wrapped);
}

async function unwrapAesKeyFromRsa(wrappedKeyB64, rsaPrivateKey) {
    const rawKey = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, rsaPrivateKey, base64ToBytes(wrappedKeyB64));
    return importAesKeyRaw(rawKey);
}

function buildSignaturePayload(msg) {
    return JSON.stringify({
        senderId: msg.senderId || '',
        recipientId: msg.recipientId || '',
        cipherText: msg.cipherText || '',
        iv: msg.iv || '',
        wrappedKey: msg.wrappedKey || '',
        senderWrappedKey: msg.senderWrappedKey || '',
        algorithmProfile: msg.algorithmProfile || '',
        type: msg.type || ''
    });
}

async function signMessagePayload(messagePayload, signingPrivateKey) {
    const data = new TextEncoder().encode(buildSignaturePayload(messagePayload));
    const signature = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, signingPrivateKey, data);
    return bytesToBase64(signature);
}

async function verifyMessageSignature(messagePayload, signatureB64, signingPublicKey) {
    const data = new TextEncoder().encode(buildSignaturePayload(messagePayload));
    return crypto.subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' },
        signingPublicKey,
        base64ToBytes(signatureB64),
        data
    );
}

async function loadKeysFromStorage() {
    const privJwk = localStorage.getItem('securechat_privkey_' + username);
    const pubJwk  = localStorage.getItem('securechat_pubkey_'  + username);
    const rsaPrivJwk = localStorage.getItem('securechat_rsa_privkey_' + username);
    const rsaPubJwk = localStorage.getItem('securechat_rsa_pubkey_' + username);
    const signPrivJwk = localStorage.getItem('securechat_sign_privkey_' + username);
    const signPubJwk = localStorage.getItem('securechat_sign_pubkey_' + username);
    if (privJwk && pubJwk) {
        try {
            myPrivateKey  = await importPrivateKeyJwk(privJwk);
            myPublicKeyJwk = pubJwk;
        } catch (e) {
            console.warn('Clés corrompues, régénération requise', e);
            return false;
        }
    }
    if (rsaPrivJwk && rsaPubJwk) {
        try {
            myRsaPrivateKey = await importRsaPrivateKeyJwk(rsaPrivJwk);
            myRsaPublicKey = rsaPubJwk;
        } catch (e) {
            console.warn('Clés RSA corrompues, régénération requise', e);
        }
    }
    if (signPrivJwk && signPubJwk) {
        try {
            mySigningPrivateKey = await importSigningPrivateKeyJwk(signPrivJwk);
            mySigningPublicKey = signPubJwk;
        } catch (e) {
            console.warn('Clés de signature corrompues, régénération requise', e);
        }
    }
    await loadSharedKeysFromStorage();
    return !!(myPrivateKey || myRsaPrivateKey);
}

async function saveSharedKeyToStorage(contact, aesKey) {
    try {
        const rawBits = await crypto.subtle.exportKey('raw', aesKey);
        const b64 = btoa(String.fromCodePoint(...new Uint8Array(rawBits)));
        localStorage.setItem('securechat_shared_' + username + '_' + contact, b64);
        console.log('[TRACE] Clé partagée sauvegardée pour ' + contact);
    } catch (e) {
        console.warn('[TRACE] Impossible de sauvegarder la clé partagée:', e);
    }
}

async function loadSharedKeysFromStorage() {
    const prefix = 'securechat_shared_' + username + '_';
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(prefix)) {
            const contact = key.substring(prefix.length);
            const b64 = localStorage.getItem(key);
            try {
                const rawBuf = Uint8Array.from(atob(b64), c => c.codePointAt(0) || 0);
                const aesKey = await crypto.subtle.importKey('raw', rawBuf, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
                sharedKeys[contact] = aesKey;
                console.log('[TRACE] Clé partagée restaurée pour ' + contact);
            } catch (e) {
                console.warn('[TRACE] Clé corrompue pour ' + contact, e);
            }
        }
    }
}

function removeSharedKeyFromStorage(contact) {
    localStorage.removeItem('securechat_shared_' + username + '_' + contact);
}

function getSelectedProfiles() {
    return [...document.querySelectorAll('input[name="myProtocol"]:checked')].map(cb => cb.value);
}

function hasLocalKeysForProfile(profile) {
    if (profile === 'RSA_AES_GCM') return !!myRsaPrivateKey;
    if (profile === 'ECDH_AES_GCM' || profile === 'ECDH_AES_GCM_SIGNED') return !!myPrivateKey;
    return false;
}

function hasAnyRequiredLocalKey(profiles) {
    return (profiles || []).some(hasLocalKeysForProfile);
}

function parseProtocols(protocols) {
    return (protocols || '')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);
}

function loadProfileCheckboxes(selectedProfiles = []) {
    document.querySelectorAll('input[name="myProtocol"]').forEach(cb => {
        cb.checked = selectedProfiles.includes(cb.value);
        cb.disabled = false;
        cb.closest('.proto-item').classList.toggle('installed', selectedProfiles.includes(cb.value));
    });
}

function getNegotiableProfiles(protocols) {
    return (protocols || []).filter(profile => profile === 'ECDH_AES_GCM' || profile === 'ECDH_AES_GCM_SIGNED');
}

function getContactUser(contact) {
    return allUsers.find(u => u.username === contact) || null;
}

function getContactKeyBundle(contactUser) {
    return safeJsonParse(contactUser?.keyBundle, {}) || {};
}

function mergeProfiles(existingProfiles, additionalProfiles = []) {
    const merged = new Set([...(existingProfiles || []), ...(additionalProfiles || [])]);
    return AVAILABLE_CRYPTO_PROFILES.filter(profile => merged.has(profile));
}

function hasPublishedKeyMaterial(profile, keyBundle, remotePublicKeyJwk = '') {
    if (profile === 'RSA_AES_GCM') {
        return !!keyBundle?.RSA_AES_GCM?.publicKey;
    }
    if (profile === 'ECDH_AES_GCM') {
        return !!remotePublicKeyJwk || !!keyBundle?.ECDH_AES_GCM?.publicKey || !!keyBundle?.ECDH_AES_GCM_SIGNED?.publicKey;
    }
    if (profile === 'ECDH_AES_GCM_SIGNED') {
        return (!!remotePublicKeyJwk || !!keyBundle?.ECDH_AES_GCM_SIGNED?.publicKey)
            && !!keyBundle?.ECDH_AES_GCM_SIGNED?.signingPublicKey;
    }
    return false;
}

function hasLocalMaterialForProfile(profile) {
    if (profile === 'RSA_AES_GCM') {
        return !!myRsaPrivateKey && !!myRsaPublicKey;
    }
    if (profile === 'ECDH_AES_GCM') {
        return !!myPrivateKey && !!myPublicKeyJwk;
    }
    if (profile === 'ECDH_AES_GCM_SIGNED') {
        return !!myPrivateKey && !!myPublicKeyJwk && !!mySigningPrivateKey && !!mySigningPublicKey;
    }
    return false;
}

function getLocallyReadyProfiles() {
    return AVAILABLE_CRYPTO_PROFILES.filter(profile => mySupportedProtocols.includes(profile) && hasLocalMaterialForProfile(profile));
}

function getMutuallyReadyProfiles(contactUser, remoteAdvertisedProfiles = [], remotePublicKeyJwk = '') {
    const keyBundle = getContactKeyBundle(contactUser);
    const remoteSupported = remoteAdvertisedProfiles.length ? remoteAdvertisedProfiles : parseProtocols(contactUser?.protocols);
    return AVAILABLE_CRYPTO_PROFILES.filter(profile =>
        mySupportedProtocols.includes(profile)
        && remoteSupported.includes(profile)
        && hasLocalMaterialForProfile(profile)
        && hasPublishedKeyMaterial(profile, keyBundle, remotePublicKeyJwk)
    );
}

async function refreshUsersDirectory() {
    const response = await fetchAuth('/api/users');
    const users = await response.json();
    allUsers = users;
    return users;
}

async function ensureContactLoaded(contact, forceRefresh = false) {
    let user = getContactUser(contact);
    if (user && !forceRefresh) {
        return user;
    }
    const users = await refreshUsersDirectory();
    return users.find(entry => entry.username === contact) || null;
}

async function ensureLocalCryptoMaterials(selectedProfiles) {
    const keyBundle = {};

    if (selectedProfiles.includes('ECDH_AES_GCM') || selectedProfiles.includes('ECDH_AES_GCM_SIGNED')) {
        if (!myPrivateKey || !myPublicKeyJwk) {
            const kp = await generateECDHKeyPair();
            myPrivateKey = kp.privateKey;
            myPublicKeyJwk = await exportPublicKeyJwk(kp.publicKey);
            localStorage.setItem('securechat_privkey_' + username, await exportPrivateKeyJwk(myPrivateKey));
            localStorage.setItem('securechat_pubkey_' + username, myPublicKeyJwk);
        }

        keyBundle.ECDH_AES_GCM = { publicKey: myPublicKeyJwk };
    }

    if (selectedProfiles.includes('ECDH_AES_GCM_SIGNED')) {
        if (!mySigningPrivateKey || !mySigningPublicKey) {
            const signingPair = await generateSigningKeyPair();
            mySigningPrivateKey = signingPair.privateKey;
            mySigningPublicKey = JSON.stringify(await crypto.subtle.exportKey('jwk', signingPair.publicKey));
            localStorage.setItem('securechat_sign_privkey_' + username, JSON.stringify(await crypto.subtle.exportKey('jwk', signingPair.privateKey)));
            localStorage.setItem('securechat_sign_pubkey_' + username, mySigningPublicKey);
        }

        keyBundle.ECDH_AES_GCM_SIGNED = {
            publicKey: myPublicKeyJwk,
            signingPublicKey: mySigningPublicKey
        };
    }

    if (selectedProfiles.includes('RSA_AES_GCM')) {
        if (!myRsaPrivateKey || !myRsaPublicKey) {
            const rsaKeyPair = await generateRSAKeyPair();
            myRsaPrivateKey = rsaKeyPair.privateKey;
            myRsaPublicKey = await exportRsaPublicKeyJwk(rsaKeyPair.publicKey);
            localStorage.setItem('securechat_rsa_privkey_' + username, await exportRsaPrivateKeyJwk(myRsaPrivateKey));
            localStorage.setItem('securechat_rsa_pubkey_' + username, myRsaPublicKey);
        }

        keyBundle.RSA_AES_GCM = { publicKey: myRsaPublicKey };
    }

    return keyBundle;
}

async function syncCryptoProfiles(selectedProfiles) {
    const normalizedProfiles = AVAILABLE_CRYPTO_PROFILES.filter(profile => (selectedProfiles || []).includes(profile));
    const keyBundle = await ensureLocalCryptoMaterials(normalizedProfiles);
    const response = await fetchAuth('/api/users/crypto/onboarding', {
        method: 'POST',
        body: JSON.stringify({
            selectedProfiles: normalizedProfiles,
            keyBundle,
            cryptoVersion: 'v1'
        })
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Impossible de mettre a jour les profils cryptographiques.');
    }

    mySupportedProtocols = normalizedProfiles;
    loginCryptoOnboardingRequired = false;
}

function buildNegAcceptPayload(acceptedProfiles, selectedProfile, publicKey) {
    return JSON.stringify({
        acceptedProfiles,
        selectedProfile,
        publicKey: publicKey || ''
    });
}

function parseNegAcceptPayload(payload) {
    const parsed = safeJsonParse(payload, null);
    if (parsed && typeof parsed === 'object') {
        return {
            acceptedProfiles: Array.isArray(parsed.acceptedProfiles) ? parsed.acceptedProfiles.filter(Boolean) : [],
            selectedProfile: parsed.selectedProfile || '',
            publicKey: parsed.publicKey || ''
        };
    }

    const parts = (payload || '').split('|');
    return {
        acceptedProfiles: (parts[0] || '').split(',').filter(Boolean),
        selectedProfile: '',
        publicKey: parts.slice(1).join('|')
    };
}

function getSigningPublicKeyForMessage(msg, thread) {
    if (sameUser(msg.senderId, username)) {
        return mySigningPublicKey;
    }

    const contactUser = getContactUser(thread);
    const keyBundle = getContactKeyBundle(contactUser);
    return keyBundle?.ECDH_AES_GCM_SIGNED?.signingPublicKey || null;
}

// =====================================================
// PROFIL & SESSION
// =====================================================
function fetchMyProfile() {
    fetch('/api/users/me', { headers: authHeaders() })
        .then(r => {
            if (r.status === 401 || r.status === 403) { handleLogout(); throw new Error('session'); }
            return r.json();
        })
        .then(user => {
            if (user.username) {
                username = user.username;
                localStorage.setItem('securechat_user', username);
            }
            mySupportedProtocols = parseProtocols(user.protocols);
            const onboardingDone = !!user.cryptoOnboardingCompleted;
            const hasLocalKeys = hasAnyRequiredLocalKey(mySupportedProtocols);

            if (onboardingDone && hasLocalKeys && !loginCryptoOnboardingRequired) {
                enterChat();
            } else {
                showPage('config');
                setConfigJournalUiAvailable(false);
                resetKeygenStatusPanel();
                document.getElementById('generateKeysBtn').textContent = 'Générer mes clés & Entrer';
                document.getElementById('closeConfigBtn').classList.add('hidden');
                const configTitle = document.getElementById('configTitle');
                loadProfileCheckboxes(mySupportedProtocols);
                syncCryptoDebugCheckbox();
                if (!onboardingDone || loginCryptoOnboardingRequired || isFirstTime) {
                    configTitle.textContent = "Initialisation de la sécurité";
                    showToast('Choisissez entre 1 et 3 profils et générez vos clés pour commencer.', 'info');
                } else {
                    configTitle.textContent = "Restauration de Sécurité";
                    showToast('Vos profils existent déjà, mais les clés locales sont manquantes sur cet appareil.', 'warning');
                }
            }
        })
        .catch(e => { if (e.message !== 'session') handleLogout(); });
}

function enterChat() {
    showPage('chat');
    document.getElementById('currentUserDisplay').textContent = username;
    const l = document.getElementById('myAvatarLetter');
    const a = document.getElementById('myAvatar');
    l.textContent = initials(username);
    a.style.background = avatarColor(username);
    connectWebSocket();
    loadActiveChats();
    loadPendingNegotiations();
}

function authHeaders() {
    return { 'Authorization': 'Bearer ' + jwtToken, 'Content-Type': 'application/json' };
}

function fetchAuth(url, opts = {}) {
    opts.headers = { ...opts.headers, ...authHeaders() };
    return fetch(url, opts).then(r => {
        if (r.status === 401 || r.status === 403) { handleLogout(); throw new Error('session'); }
        return r;
    });
}

function resetPendingConversationState() {
    document.getElementById('message').disabled = true;
    document.getElementById('sendBtn').disabled = true;
}

function cancelPendingNegotiation(contact, message, title = 'Negociation interrompue') {
    hideNegOverlay();
    document.getElementById('incomingRequestModal').classList.add('hidden');
    resetPendingConversationState();
    showChatView(false);
    if (!contact || sameUser(activeRecipient, contact)) {
        activeRecipient = null;
    }
    showToast(message, 'warning', title);
}

// =====================================================
// AUTH : LOGIN / REGISTER
// =====================================================
function switchTab(mode) {
    document.getElementById('loginForm').classList.toggle('hidden', mode !== 'login');
    document.getElementById('registerForm').classList.toggle('hidden', mode !== 'register');
    document.getElementById('tabLogin').classList.toggle('active', mode === 'login');
    document.getElementById('tabRegister').classList.toggle('active', mode === 'register');
    setAuthError('login', '');
    setAuthError('register', '');
}

function setAuthError(form, msg, ok = false) {
    const el = document.getElementById(form + 'Error');
    el.textContent = msg;
    el.className = 'auth-error' + (ok ? ' success' : '') + (msg ? '' : ' hidden');
}

function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('loginUsername').value.trim();
    const p = document.getElementById('loginPassword').value;
    if (!u || !p) { setAuthError('login', 'Remplissez tous les champs.'); return; }
    fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) })
        .then(r => r.ok ? r.json() : Promise.reject(new Error('Identifiants invalides')))
        .then(data => {
            jwtToken = data.token; username = data.username;
            loginCryptoOnboardingRequired = !!data.cryptoOnboardingRequired;
            localStorage.setItem('securechat_token', jwtToken);
            localStorage.setItem('securechat_user',  username);
            mySupportedProtocols = data.cryptoProfilesConfigured || [];
            myPrivateKey = null;
            myPublicKeyJwk = null;
            myRsaPrivateKey = null;
            myRsaPublicKey = null;
            mySigningPrivateKey = null;
            mySigningPublicKey = null;
            loadKeysFromStorage().then(() => fetchMyProfile());
        })
        .catch(() => setAuthError('login', 'Identifiants invalides.'));
}

function handleRegister(e) {
    e.preventDefault();
    const u  = document.getElementById('regUsername').value.trim();
    const p  = document.getElementById('regPassword').value;
    const cp = document.getElementById('regConfirmPassword').value;
    if (!u || !p || !cp) { setAuthError('register', 'Remplissez tous les champs.'); return; }
    if (p !== cp) { setAuthError('register', 'Mots de passe différents.'); return; }
    if (p.length < 4) { setAuthError('register', 'Mot de passe trop court (min 4 car.).'); return; }

    const btn = document.getElementById('registerBtn');
    btn.disabled = true;
    fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p, confirmPassword: cp, publicKey: null })
    }).then(r => {
        if (r.ok) { 
            setAuthError('register', '✅ Compte créé ! Connectez-vous pour installer vos certificats.', true); 
            isFirstTime = true;
            setTimeout(() => switchTab('login'), 2000); 
        }
        else r.text().then(t => setAuthError('register', t || 'Erreur inscription.'));
    }).catch(() => setAuthError('register', 'Serveur inaccessible.'))
      .finally(() => { btn.disabled = false; });
}

function handleLogout() {
    localStorage.removeItem('securechat_token');
    localStorage.removeItem('securechat_user');
    jwtToken = null; username = null; myPrivateKey = null; myPublicKeyJwk = null;
    myRsaPrivateKey = null; myRsaPublicKey = null; mySigningPrivateKey = null; mySigningPublicKey = null;
    mySupportedProtocols = []; activeRecipient = null; userMessages = {}; sharedKeys = {}; discussionSessions = {};
    localMessageSeq = 0;
    loginCryptoOnboardingRequired = false;
    if (stompClient?.connected) stompClient.disconnect();
    stompClient = null;
    showPage('auth');
}

// =====================================================
// GÉNÉRATION DES CLÉS (CONFIG PAGE)
// =====================================================
/** Contenu au repos du panneau de progression (masqué tant qu on n a pas cliqué sur Générer / Enregistrer). */
const KEYGEN_STATUS_IDLE_HTML = `
                <div class="kg-step" id="kg1"><div class="kg-dot"></div><span>Génération des clés locales...</span></div>
                <div class="kg-step" id="kg2"><div class="kg-dot"></div><span>Stockage sécurisé (LocalStorage)...</span></div>
                <div class="kg-step" id="kg3"><div class="kg-dot"></div><span>Publication de la clé publique...</span></div>
                <div class="kg-step" id="kg4"><div class="kg-dot"></div><span>Finalisation du profil...</span></div>
            `;

function resetKeygenStatusPanel() {
    const box = document.getElementById('keygenStatus');
    if (!box) return;
    box.classList.add('hidden');
    box.innerHTML = KEYGEN_STATUS_IDLE_HTML;
    const btn = document.getElementById('generateKeysBtn');
    if (btn) btn.disabled = false;
}

function closeConfig() {
    document.getElementById('closeConfigBtn').classList.add('hidden');
    resetKeygenStatusPanel();
    showPage('chat');
}

async function startCryptoGeneration() {
    mySupportedProtocols = getSelectedProfiles();
    if (mySupportedProtocols.length < 1 || mySupportedProtocols.length > 3) {
        showToast('Choisissez entre 1 et 3 profils cryptographiques.', 'warning');
        return;
    }

    const btn = document.getElementById('generateKeysBtn');
    btn.disabled = true;
    const box = document.getElementById('keygenStatus');
    box.classList.remove('hidden');
    box.innerHTML = `
        <div class="keygen-spinner"></div>
        <div class="modal-status-msg">Initialisation des clés réelles...</div>
        <div class="modal-text-hint">Génération locale des clés puis publication des clés publiques</div>
    `;

    try {
        await syncCryptoProfiles(mySupportedProtocols);

        await new Promise(r => setTimeout(r, 500));
        document.getElementById('closeConfigBtn').classList.add('hidden');

        showToast('Profils cryptographiques installés avec succès.', 'success', 'Sécurité initialisée');

        resetKeygenStatusPanel();

        if (stompClient?.connected) {
            showPage('chat');
        } else {
            enterChat();
        }

    } catch (err) {
        console.error('Erreur génération clé:', err);
        showToast('Erreur lors de la génération des clés. Réessayez.', 'error');
        resetKeygenStatusPanel();
    }
}

// =====================================================
// WEBSOCKET
// =====================================================
function connectWebSocket() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;
    stompClient.connect({ Authorization: 'Bearer ' + jwtToken }, onWsConnected, onWsError);
}

function onWsConnected() {
    console.log('[TRACE] WS connecté au serveur central en tant que ' + username);
    stompClient.subscribe('/topic/user-' + username, onMessageReceived);
}

function onWsError(err) {
    console.error('[TRACE] WebSocket erreur de connexion:', err);
    setTimeout(connectWebSocket, 3000);
}

// =====================================================
// RÉCEPTION MESSAGES
// =====================================================
function onMessageReceived(payload) {
    let msg;
    try { msg = JSON.parse(payload.body); } catch (e) { console.warn('Payload WS invalide', e); return; }
    console.log("[TRACE] Réception d'un signal réseau: [" + msg.type + "] venant de " + msg.senderId);
    switch (msg.type) {
        case MSG.CHAT:         handleIncomingChat(msg); break;
        case MSG.NEG_REQUEST:  enqueueNegotiationRequest(msg); break;
        case MSG.NEG_ACCEPT:   handleNegAccept(msg);    break;
        case MSG.NEG_REFUSE:   handleNegRefuse(msg);    break;
        case MSG.NEG_MISMATCH: handleNegMismatch(msg);  break;
    }
}

function enqueueNegotiationRequest(msg) {
    if (!msg || sameUser(msg.senderId, username)) {
        return;
    }
    const peer = resolveCanonicalUsername(msg.senderId);
    if (!peer || sameUser(peer, username)) {
        return;
    }
    pendingNegotiationContacts.add(peer);
    setDiscussionSession(peer, {
        status: 'pending',
        pendingRequestId: msg.id || null,
        preview: 'Demande de discussion en attente'
    });
    pendingNegotiationQueue = pendingNegotiationQueue.filter(item => !sameUser(item.senderId, peer));
    pendingNegotiationQueue.push(msg);
    processPendingNegotiationQueue();
}

function processPendingNegotiationQueue() {
    const modal = document.getElementById('incomingRequestModal');
    if (!modal.classList.contains('hidden')) {
        return;
    }
    const next = pendingNegotiationQueue.shift();
    if (!next) {
        return;
    }
    handleNegRequest(next).catch(error => {
        console.error('Erreur traitement demande de negociation:', error);
        processPendingNegotiationQueue();
    });
}

function loadPendingNegotiations() {
    fetchAuth('/api/messages/pending-negotiations')
        .then(r => r.json())
        .then(data => {
            const requests = Array.isArray(data) ? data.slice().reverse() : [];
            requests.forEach(enqueueNegotiationRequest);
        })
        .catch(e => { if (e.message !== 'session') console.error(e); });
}

function clearPendingNegotiationState(contact, replacementPreview = '') {
    pendingNegotiationContacts.delete(contact);
    if (replacementPreview) {
        updateConvPreview(contact, replacementPreview);
    }
}

/** Profil négocié réel (session active après finalize / historique CHAT) — pas d’activation « à blanc » sur simple annuaire. */
function getNegotiatedProfileForContact(contact) {
    const session = getDiscussionSession(contact);
    if (session?.status === 'active' && session.negotiatedProfile) {
        return session.negotiatedProfile;
    }
    return null;
}

function canSendEncryptedToContact(contact) {
    if (!contact) return false;
    const profile = getNegotiatedProfileForContact(contact);
    if (!profile) return false;
    const contactUser = getContactUser(contact);
    if (profile === 'RSA_AES_GCM') {
        const kb = getContactKeyBundle(contactUser);
        return !!(kb?.RSA_AES_GCM?.publicKey && myRsaPrivateKey && myRsaPublicKey);
    }
    return !!resolveSharedKeyForThread(contact);
}

function updateMessagingUiForContact(contact) {
    const msgEl = document.getElementById('message');
    const sendBtn = document.getElementById('sendBtn');
    if (!msgEl || !sendBtn) return;
    const ok = canSendEncryptedToContact(contact);
    msgEl.disabled = !ok;
    sendBtn.disabled = !ok;
    msgEl.placeholder = ok ? 'Tapez un message chiffré' : 'Tunnel sécurisé ou clés requis — terminez la négociation.';
}

async function decryptRsaTransportMessage(msg) {
    const wrappedKey = sameUser(msg.senderId, username) ? msg.senderWrappedKey : msg.wrappedKey;
    if (!wrappedKey || !myRsaPrivateKey) {
        return '[🔒 message chiffré - clé manquante]';
    }

    try {
        const aesKey = await unwrapAesKeyFromRsa(wrappedKey, myRsaPrivateKey);
        return await decryptAESGCM(msg.cipherText, msg.iv, aesKey);
    } catch (error) {
        console.warn('Déchiffrement RSA impossible:', error);
        return '[🔒 message chiffré - clé manquante]';
    }
}

async function verifySignedPlainText(msg, thread, plainText) {
    const signingPublicKeyJwk = getSigningPublicKeyForMessage(msg, thread);
    if (!msg.signature || !signingPublicKeyJwk) {
        return '[signature invalide] ' + plainText;
    }

    try {
        const signingPublicKey = await importSigningPublicKeyJwk(signingPublicKeyJwk);
        const isValid = await verifyMessageSignature(msg, msg.signature, signingPublicKey);
        return isValid ? plainText : '[signature invalide] ' + plainText;
    } catch (error) {
        console.warn('Vérification de signature impossible:', error);
        return '[signature invalide] ' + plainText;
    }
}

async function decryptTransportMessage(msg, thread) {
    if (!msg?.iv) {
        return msg?.cipherText || '';
    }

    if (msg.algorithmProfile === 'RSA_AES_GCM') {
        return decryptRsaTransportMessage(msg);
    }

    const aesKey = resolveSharedKeyForThread(thread);
    if (!aesKey) {
        return '[🔒 message chiffré - clé manquante]';
    }
    const plainText = await decryptAESGCM(msg.cipherText, msg.iv, aesKey);

    if (msg.algorithmProfile === 'ECDH_AES_GCM_SIGNED') {
        return verifySignedPlainText(msg, thread, plainText);
    }

    return plainText;
}

// =====================================================
// CHAT : ENVOI & RÉCEPTION
// =====================================================
function resolveMessageSortMs(m) {
    if (m.timestamp != null) {
        if (Array.isArray(m.timestamp)) {
            const a = m.timestamp;
            const y = a[0], mo = a[1], d = a[2], h = a[3] ?? 0, mi = a[4] ?? 0, s = a[5] ?? 0, nano = a[6] ?? 0;
            if (y != null && mo != null && d != null) {
                return new Date(y, mo - 1, d, h, mi, s, Math.floor(nano / 1e6)).getTime();
            }
        }
        const s = typeof m.timestamp === 'string' ? m.timestamp : String(m.timestamp);
        const t = Date.parse(s);
        if (!Number.isNaN(t)) return t;
    }
    if (m._sortTime != null) return Number(m._sortTime);
    return 0;
}

function compareMessagesChronological(a, b) {
    const ta = resolveMessageSortMs(a);
    const tb = resolveMessageSortMs(b);
    if (ta !== tb) return ta - tb;
    const ida = a.id != null ? Number(a.id) : -1;
    const idb = b.id != null ? Number(b.id) : -1;
    if (ida >= 0 && idb >= 0 && ida !== idb) return ida - idb;
    if (ida >= 0 && idb < 0) return -1;
    if (ida < 0 && idb >= 0) return 1;
    return (a._localSeq || 0) - (b._localSeq || 0);
}

function sortThreadMessagesInPlace(thread) {
    const arr = userMessages[thread];
    if (!arr || arr.length < 2) return;
    arr.sort(compareMessagesChronological);
}

async function sendMessage(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('message');
    const text = input.value.trim();
    if (!text || !stompClient?.connected || !activeRecipient) return;

    if (!canSendEncryptedToContact(activeRecipient)) {
        showToast('Impossible d envoyer : négociation non terminée ou clés E2E manquantes.', 'warning');
        return;
    }

    const contactUser = getContactUser(activeRecipient);
    const selectedProfile = getNegotiatedProfileForContact(activeRecipient);

    let cipherText = '';
    let iv = '';
    let wrappedKey = '';
    let senderWrappedKey = '';
    let signature = '';
    let aesKeyForDebug = null;

    if (selectedProfile === 'RSA_AES_GCM') {
        const keyBundle = getContactKeyBundle(contactUser);
        const recipientPublicKeyJwk = keyBundle?.RSA_AES_GCM?.publicKey;
        if (!recipientPublicKeyJwk || !myRsaPublicKey || !myRsaPrivateKey) {
            showToast('Profil RSA incomplet sur un des terminaux.', 'warning');
            return;
        }

        const recipientPublicKey = await importRsaPublicKeyJwk(recipientPublicKeyJwk);
        const senderPublicKey = await importRsaPublicKeyJwk(myRsaPublicKey);
        const aesKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
        aesKeyForDebug = aesKey;
        const enc = await encryptAESGCM(text, aesKey);
        cipherText = enc.cipherText;
        iv = enc.iv;
        wrappedKey = await wrapAesKeyForRsa(aesKey, recipientPublicKey);
        senderWrappedKey = await wrapAesKeyForRsa(aesKey, senderPublicKey);
    } else {
        const aesKey = resolveSharedKeyForThread(activeRecipient);
        if (!aesKey) {
            showToast('Aucune clé ECDH active avec ce contact. Relance la négociation.', 'warning');
            return;
        }
        aesKeyForDebug = aesKey;
        const enc = await encryptAESGCM(text, aesKey);
        cipherText = enc.cipherText;
        iv = enc.iv;
        if (selectedProfile === 'ECDH_AES_GCM_SIGNED') {
            if (!mySigningPrivateKey) {
                showToast('Clé de signature absente sur cet appareil.', 'warning');
                return;
            }
            signature = await signMessagePayload({
                senderId: username,
                recipientId: activeRecipient,
                cipherText,
                iv,
                wrappedKey: '',
                senderWrappedKey: '',
                algorithmProfile: selectedProfile,
                type: MSG.CHAT
            }, mySigningPrivateKey);
        }
    }

    const msg = {
        senderId: username,
        recipientId: activeRecipient,
        cipherText,
        iv,
        wrappedKey,
        senderWrappedKey,
        algorithmProfile: selectedProfile,
        signature,
        type: MSG.CHAT
    };

    if (isCryptoConsoleDebugEnabled()) {
        await logCryptoSendPipeline({
            profile: selectedProfile,
            recipient: activeRecipient,
            plainText: text,
            cipherText,
            iv,
            aesKey: aesKeyForDebug,
            wrappedKey,
            senderWrappedKey,
            signature,
            wireMessage: msg
        });
    }

    stompClient.send('/app/chat', {}, JSON.stringify(msg));

    const localMsg = {
        senderId: username,
        recipientId: activeRecipient,
        cipherText: text,
        iv: '',
        wrappedKey,
        senderWrappedKey,
        algorithmProfile: selectedProfile,
        signature,
        type: MSG.CHAT,
        _timestamp: nowHHMM(),
        _plain: true,
        _localSeq: ++localMessageSeq,
        _sortTime: Date.now()
    };
    storeAndDisplay(localMsg, activeRecipient);

    input.value = '';
    autoResize(input);
}

async function handleIncomingChat(msg) {
    if (!msg) return;
    // Écho serveur de nos propres CHAT : déjà affiché dans sendMessage (même si casse différente du principal).
    if (sameUser(msg.senderId, username)) {
        return;
    }
    const thread = resolveCanonicalUsername(msg.senderId);
    const plain = await decryptTransportMessage(msg, thread);
    const displayMsg = {
        ...msg,
        cipherText: plain,
        _timestamp: formatTimestamp(msg.timestamp) || nowHHMM(),
        _plain: plain !== '[🔒 message chiffré - clé manquante]',
        _localSeq: msg.id == null ? ++localMessageSeq : 0
    };

    storeAndDisplay(displayMsg, thread);
    if (!sameUser(thread, activeRecipient)) {
        updateConvPreview(thread, plain);
    }
}

function storeAndDisplay(msg, thread) {
    if (!thread || sameUser(thread, username)) return;
    if (!userMessages[thread]) userMessages[thread] = [];
    userMessages[thread].push(msg);
    sortThreadMessagesInPlace(thread);
    if (sameUser(activeRecipient, thread)) {
        const area = doc('messageArea');
        area.innerHTML = '';
        userMessages[thread].forEach(renderMessage);
        area.scrollTop = area.scrollHeight;
    } else {
        updateConvPreview(thread, msg.cipherText);
    }
    updateConvListOrder();
}

// =====================================================
// NÉGOCIATION E2E
// =====================================================
function sendNeg(type, recipient, payload = '', pubKey = '') {
    if (!stompClient?.connected) return;
    console.log("[TRACE] Émission Négociation (" + type + ") vers " + recipient);
    stompClient.send('/app/chat', {}, JSON.stringify({
        senderId: username, recipientId: recipient,
        cipherText: payload,
        iv: pubKey,
        type
    }));
}

async function handleNegRequest(msg) {
    if (!msg || sameUser(msg.senderId, username)) return;
    const peer = resolveCanonicalUsername(msg.senderId);
    if (!peer || sameUser(peer, username)) return;
    pendingNegRequester = peer;
    let senderUser = await ensureContactLoaded(peer, true).catch(() => null);
    const remoteProtos = (msg.cipherText || '').split(',').filter(Boolean);
    const remotePublicKeyJwk = msg.iv || '';
    const common = getMutuallyReadyProfiles(senderUser, remoteProtos, remotePublicKeyJwk);
    const hasCommon = common.length > 0;
    const selectedNegotiationProfiles = new Set();

    const infoEl = document.getElementById('requestInfo');
    infoEl.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'modal-text-header';
    header.textContent = '🛡️ ' + peer + ' souhaite vous envoyer des messages sécurisés.';
    infoEl.appendChild(header);

    if (hasCommon) {
        const ok = document.createElement('div');
        ok.className = 'proto-card common';
        ok.innerHTML = `
            <div class="proto-icon-box">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </div>
            <div class="proto-info">
                <div style="font-weight:600;color:var(--wa-green);font-size:13px;">Compatibilité confirmée</div>
                <div style="margin-top:4px;color:var(--text-secondary);font-size:11px;">Au moins un algorithme est déjà commun entre vos deux profils.</div>
            </div>
        `;
        infoEl.appendChild(ok);

        const hint = document.createElement('div');
        hint.className = 'modal-text-hint';
        hint.textContent = 'Vos clés existent déjà. Cette étape sert uniquement à négocier la nouvelle discussion.';
        infoEl.appendChild(hint);
    } else {
        const warn = document.createElement('div');
        warn.className = 'proto-card';
        warn.style.borderColor = '#f59e0b';
        warn.innerHTML = `
            <div class="proto-icon-box" style="background:rgba(245,158,11,0.2);color:#f59e0b">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
            </div>
            <div class="proto-info">
                <div style="font-weight:600;color:#f59e0b;font-size:13px;">Mise à jour requise</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;">Aucun algorithme commun n'est disponible pour cette discussion.</div>
            </div>
        `;
        infoEl.appendChild(warn);

        const selector = document.createElement('div');
        selector.className = 'modal-proto-selector';
        remoteProtos.forEach(profile => {
            const label = document.createElement('label');
            label.className = 'proto-item-mini';
            label.innerHTML = `<input type="checkbox" name="negotiationProfile" value="${profile}"><span>${profileLabel(profile)}</span>`;
            const checkbox = label.querySelector('input[name="negotiationProfile"]');
            if (checkbox) {
                checkbox.checked = true;
                selectedNegotiationProfiles.add(profile);
                checkbox.addEventListener('change', event => {
                    if (event.target.checked) {
                        selectedNegotiationProfiles.add(profile);
                        return;
                    }
                    selectedNegotiationProfiles.delete(profile);
                });
            }
            selector.appendChild(label);
        });
        infoEl.appendChild(selector);

        const hint = document.createElement('div');
        hint.className = 'modal-text-hint';
        hint.textContent = 'Choisissez un ou plusieurs profils du demandeur a adopter pour cette discussion.';
        infoEl.appendChild(hint);
    }

    document.getElementById('incomingRequestModal').classList.remove('hidden');
    playBell();
    document.getElementById('acceptRequestBtn').textContent = hasCommon ? 'Accepter la discussion' : 'Mettre a jour & accepter';

    document.getElementById('acceptRequestBtn').onclick = async () => {
        document.getElementById('acceptRequestBtn').disabled = true;
        let selectedProfiles = [];
        if (!hasCommon) {
            if (selectedNegotiationProfiles.size) {
                selectedProfiles = [...selectedNegotiationProfiles];
            } else {
                selectedProfiles = [...document.querySelectorAll('#requestInfo input[name="negotiationProfile"]:checked')].map(cb => cb.value);
            }
        }

        if (!hasCommon && !selectedProfiles.length) {
            document.getElementById('acceptRequestBtn').disabled = false;
            showToast('Choisissez au moins un profil a adopter.', 'warning');
            return;
        }

        const infoArea = document.getElementById('requestInfo');
        infoArea.innerHTML = '';
        const animBox = document.createElement('div');
        animBox.className = 'modal-anim-box';
        animBox.innerHTML = '<div class="keygen-spinner"></div><div class="modal-status-msg">Négociation de la discussion...</div><div class="modal-text-hint">Verification des profils et preparation des cles</div>';
        infoArea.appendChild(animBox);

        let acceptedProfiles = [...common];

        if (!hasCommon) {
            const mergedProfiles = mergeProfiles(mySupportedProtocols, selectedProfiles);
            try {
                await syncCryptoProfiles(mergedProfiles);
                senderUser = await ensureContactLoaded(peer, true).catch(() => senderUser);
                acceptedProfiles = getMutuallyReadyProfiles(senderUser, remoteProtos, remotePublicKeyJwk);
            } catch (error) {
                document.getElementById('acceptRequestBtn').disabled = false;
                document.getElementById('incomingRequestModal').classList.add('hidden');
                showToast(error.message || 'Mise a jour des profils impossible.', 'error');
                pendingNegotiationQueue.unshift(msg);
                setTimeout(() => processPendingNegotiationQueue(), 300);
                return;
            }
        }

        const ecdhCommon = getNegotiableProfiles(acceptedProfiles);
        const hasEncryptedChannel = acceptedProfiles.length > 0;
        const selectedProfile = choosePreferredNegotiatedProfile(acceptedProfiles);
        if (!hasEncryptedChannel) {
            document.getElementById('incomingRequestModal').classList.add('hidden');
            document.getElementById('acceptRequestBtn').disabled = false;
            document.getElementById('acceptRequestBtn').textContent = 'Accepter la discussion';
            sendNeg(MSG.NEG_MISMATCH, peer);
            showToast('Aucune discussion n a ete creee: les cles necessaires ne sont pas toutes disponibles.', 'warning');
            processPendingNegotiationQueue();
            return;
        }
        if (!selectedProfile) {
            document.getElementById('incomingRequestModal').classList.add('hidden');
            document.getElementById('acceptRequestBtn').disabled = false;
            document.getElementById('acceptRequestBtn').textContent = 'Accepter la discussion';
            sendNeg(MSG.NEG_MISMATCH, peer);
            showToast('Aucune discussion n a ete creee: aucun profil final n a pu etre retenu.', 'warning');
            processPendingNegotiationQueue();
            return;
        }

        await new Promise(r => setTimeout(r, 800));

        animBox.innerHTML = '<div style="font-size:32px;">🛡️</div><div style="margin-top:8px;color:var(--wa-green);font-weight:600;">Discussion négociée avec succès.</div>';

        let sharedKey = null;
        if (remotePublicKeyJwk && ecdhCommon.length > 0 && myPrivateKey) {
            try {
                const theirPub = await importPublicKeyJwk(remotePublicKeyJwk);
                sharedKey = await deriveSharedAESKey(myPrivateKey, theirPub);
                sharedKeys[peer] = sharedKey;
                await saveSharedKeyToStorage(peer, sharedKey);
            } catch (e) { console.error('Echec sécurisation:', e); }
        }

        if (ecdhCommon.length > 0 && !sharedKey && !acceptedProfiles.includes('RSA_AES_GCM')) {
            document.getElementById('incomingRequestModal').classList.add('hidden');
            document.getElementById('acceptRequestBtn').disabled = false;
            document.getElementById('acceptRequestBtn').textContent = 'Accepter la discussion';
            sendNeg(MSG.NEG_MISMATCH, peer);
            showToast('Aucune discussion n a ete creee: la cle partagee ECDH n a pas pu etre generee.', 'warning');
            processPendingNegotiationQueue();
            return;
        }

        await new Promise(r => setTimeout(r, 600));
        document.getElementById('incomingRequestModal').classList.add('hidden');
        document.getElementById('acceptRequestBtn').disabled = false;
        document.getElementById('acceptRequestBtn').textContent = 'Accepter la discussion';

        setDiscussionSession(peer, {
            status: 'active',
            negotiatedProfile: selectedProfile,
            preview: '🔒 Chiffrement E2E actif'
        });
        sendNeg(MSG.NEG_ACCEPT, peer, buildNegAcceptPayload(acceptedProfiles, selectedProfile, myPublicKeyJwk || ''));
        finalizeChat(peer, hasEncryptedChannel, selectedProfile);
    };

    document.getElementById('refuseRequestBtn').onclick = () => {
        document.getElementById('incomingRequestModal').classList.add('hidden');
        document.getElementById('acceptRequestBtn').textContent = 'Accepter la discussion';
        sendNeg(MSG.NEG_REFUSE, peer);
        processPendingNegotiationQueue();
    };
}

async function handleNegAccept(msg) {
    const peer = resolveCanonicalUsername(msg.senderId);
    // Echo du serveur (notre propre NEG_ACCEPT) : expéditeur = nous.
    if (!msg || sameUser(peer, username)) {
        return;
    }
    const contactUser = await ensureContactLoaded(peer, true).catch(() => null);
    if (!contactUser) {
        cancelPendingNegotiation(peer, 'Profil distant introuvable. La discussion n a pas ete creee.');
        return;
    }
    const acceptPayload = parseNegAcceptPayload(msg.cipherText || '');
    const remoteProtos = acceptPayload.acceptedProfiles;
    const remotePublicKeyJwk = acceptPayload.publicKey;
    const refreshedContactUser = await ensureContactLoaded(peer, true).catch(() => contactUser);
    const acceptedProfiles = getMutuallyReadyProfiles(refreshedContactUser, remoteProtos, remotePublicKeyJwk);
    const ecdhCommon = getNegotiableProfiles(acceptedProfiles);
    const selectedProfile = acceptPayload.selectedProfile && acceptedProfiles.includes(acceptPayload.selectedProfile)
        ? acceptPayload.selectedProfile
        : choosePreferredNegotiatedProfile(acceptedProfiles);
    let sharedKey = null;

    if (remotePublicKeyJwk && myPrivateKey && ecdhCommon.length > 0) {
        try {
            const theirPub = await importPublicKeyJwk(remotePublicKeyJwk);
            sharedKey = await deriveSharedAESKey(myPrivateKey, theirPub);
            sharedKeys[peer] = sharedKey;
            await saveSharedKeyToStorage(peer, sharedKey);
        } catch (e) { console.error('Erreur dérivation:', e); }
    }

    if (!acceptedProfiles.length) {
        cancelPendingNegotiation(peer, 'Aucune discussion n a ete creee: aucun profil reellement pret des deux cotes.');
        return;
    }
    if (!selectedProfile) {
        cancelPendingNegotiation(peer, 'Aucune discussion n a ete creee: aucun profil final negocie.');
        return;
    }

    if (ecdhCommon.length > 0 && !sharedKey && !acceptedProfiles.includes('RSA_AES_GCM')) {
        cancelPendingNegotiation(peer, 'Aucune discussion n a ete creee: la generation de la cle partagee a echoue.');
        return;
    }

    const statusText = ecdhCommon.length > 0
        ? '🚀 Connexion hautement sécurisée établie.'
        : '🔐 Discussion sécurisée prête avec les profils acceptés.';
    document.getElementById('negotiationStatus').textContent = statusText;

    setDiscussionSession(peer, {
        status: 'active',
        negotiatedProfile: selectedProfile,
        preview: '🔒 Chiffrement E2E actif'
    });
    setTimeout(() => finalizeChat(peer, true, selectedProfile), 800);
}

function handleNegRefuse(msg) {
    const peer = resolveCanonicalUsername(msg.senderId);
    if (!msg || sameUser(peer, username)) {
        return;
    }
    clearPendingNegotiationState(peer, 'Discussion refusee');
    cancelPendingNegotiation(peer, peer + ' a refuse la discussion.', 'Discussion refusee');
    processPendingNegotiationQueue();
}

function handleNegMismatch(msg) {
    const peer = resolveCanonicalUsername(msg.senderId);
    if (!msg || sameUser(peer, username)) {
        return;
    }
    clearPendingNegotiationState(peer, 'Negociation impossible');
    cancelPendingNegotiation(peer, 'Aucune discussion n a ete creee avec ' + peer + ': cles ou protocoles incompatibles.', 'Negociation echouee');
    processPendingNegotiationQueue();
}

function finalizeChat(contact, encrypted, negotiatedProfile = '') {
    if (sameUser(contact, username)) {
        return;
    }
    if (!encrypted) {
        cancelPendingNegotiation(contact, 'Aucune discussion n a ete creee faute de canal chiffre actif.');
        return;
    }
    hideNegOverlay();
    clearPendingNegotiationState(contact, '🔒 Chiffrement E2E actif');
    setDiscussionSession(contact, {
        status: 'active',
        negotiatedProfile: negotiatedProfile || getDiscussionSession(contact)?.negotiatedProfile || '',
        preview: '🔒 Chiffrement E2E actif'
    });
    openConversation(contact);
    console.log("[TRACE] Finalisation du tunnel avec " + contact + ". E2E: " + encrypted);
    const status = '🔒 Chiffrement E2E actif';
    displaySystemMsg(status);
    addOrUpdateConvItem(contact, status, true);

    showToast('Tunnel sécurisé établi avec ' + contact, 'success', 'E2E actif');

    processPendingNegotiationQueue();
}

// =====================================================
// OUVRIR UNE CONVERSATION
// =====================================================
function openConversation(contact) {
    activeRecipient = contact;
    showChatView(true);

    doc('chatContactName').textContent = contact;
    const av = doc('chatAvatar');
    doc('chatAvatarLetter').textContent = initials(contact);
    av.style.background = avatarColor(contact);

    document.querySelectorAll('.conv-item').forEach(el => el.classList.toggle('active', sameUser(el.dataset.contact, contact)));

    const area = doc('messageArea');
    area.innerHTML = '';
    (userMessages[contact] || []).forEach(renderMessage);
    area.scrollTop = area.scrollHeight;
    updateMessagingUiForContact(contact);
}

function loadHistory(contact) {
    fetchAuth('/api/messages/history?withUser=' + encodeURIComponent(contact))
        .then(r => r.json())
        .then(async data => {
            const msgs = [];
            for (const m of data) {
                if (m.type !== MSG.CHAT) {
                    continue;
                }
                const plain = await decryptTransportMessage(m, contact);
                msgs.push({ ...m, cipherText: plain, _timestamp: formatTimestamp(m.timestamp), _plain: plain !== '[🔒 message chiffré - clé manquante]', _localSeq: m.id != null ? Number(m.id) : 0 });
            }
            msgs.sort(compareMessagesChronological);
            userMessages[contact] = msgs;
            const latestMessage = msgs.length ? msgs[msgs.length - 1] : null;
            if (latestMessage?.algorithmProfile) {
                setDiscussionSession(contact, {
                    status: 'active',
                    negotiatedProfile: latestMessage.algorithmProfile,
                    preview: latestMessage.cipherText || '🔒 Chiffrement E2E actif'
                });
            }
            if (sameUser(activeRecipient, contact)) {
                const area = doc('messageArea');
                area.innerHTML = '';
                msgs.forEach(renderMessage);
                area.scrollTop = area.scrollHeight;
                updateMessagingUiForContact(contact);
            }
        }).catch(e => { if (e.message !== 'session') console.error(e); });
}

function formatTimestamp(ts) {
    if (!ts) return nowHHMM();
    try { return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
}

// =====================================================
// LISTE DE CONVERSATIONS (SIDEBAR)
// =====================================================
function loadActiveChats() {
    fetchAuth('/api/messages/active-chats')
        .then(r => r.json())
        .then(contacts => {
            const list = document.getElementById('conversationsList');
            list.innerHTML = '';
            const raw = Array.isArray(contacts) ? contacts : [];
            const filtered = raw.filter(c => c && !sameUser(String(c).trim(), username));
            if (filtered.length) {
                filtered.forEach(c => addOrUpdateConvItem(c, 'Discussion chiffrée', false));
            } else {
                list.innerHTML = document.getElementById('emptyConv')?.outerHTML || '<div class="empty-conv"><p>Aucune conversation</p></div>';
            }
            removeSelfConversationSidebarEntries();
        }).catch(e => { if (e.message !== 'session') console.error(e); });
}

/** Supprime toute entrée sidebar « discussion avec soi » (casse / données anciennes). */
function removeSelfConversationSidebarEntries() {
    if (!username) return;
    document.querySelectorAll('.conv-item').forEach(el => {
        if (sameUser(el.dataset.contact, username)) {
            el.remove();
        }
    });
}

function addOrUpdateConvItem(contact, preview, isActive) {
    if (!contact || sameUser(contact, username)) {
        return;
    }
    const list = document.getElementById('conversationsList');
    const empty = list.querySelector('.empty-conv');
    if (empty) empty.remove();

    let item = list.querySelector('[data-contact="' + contact + '"]');
    if (item) {
        const prev = item.querySelector('.conv-preview span');
        if (prev) prev.textContent = preview;
    } else {
        item = document.createElement('div');
        item.className = 'conv-item';
        item.dataset.contact = contact;

        const av = document.createElement('div');
        av.className = 'conv-avatar';
        av.textContent = initials(contact);
        av.style.background = avatarColor(contact);

        const info = document.createElement('div');
        info.className = 'conv-info';
        const name = document.createElement('span');
        name.className = 'conv-name';
        name.textContent = contact;
        const prev = document.createElement('div');
        prev.className = 'conv-preview';
        prev.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="12"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/></svg><span>' + escHtml(preview) + '</span>';
        info.appendChild(name);
        info.appendChild(prev);

        const meta = document.createElement('div');
        meta.className = 'conv-meta';
        const time = document.createElement('span');
        time.className = 'conv-time';
        time.textContent = nowHHMM();
        meta.appendChild(time);

        const kebab = document.createElement('div');
        kebab.className = 'conv-actions';
        kebab.innerHTML = `
            <button class="kebab-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>
            <div class="dropdown-menu">
                <div class="dropdown-item danger" onclick="event.stopPropagation(); confirmDelete('${contact}')">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/></svg>
                    Supprimer
                </div>
            </div>
        `;
        const btn = kebab.querySelector('.kebab-btn');
        const menu = kebab.querySelector('.dropdown-menu');
        btn.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.dropdown-menu').forEach(m => m !== menu && m.classList.remove('show'));
            menu.classList.toggle('show');
        };

        item.appendChild(av);
        item.appendChild(info);
        item.appendChild(meta);
        item.appendChild(kebab);

        item.addEventListener('click', (e) => {
            if (menu.classList.contains('show')) { menu.classList.remove('show'); return; }
            openConversation(contact);
            loadHistory(contact);
        });

        list.prepend(item);
    }

    if (isActive) {
        document.querySelectorAll('.conv-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
    }
}

document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
});

function updateConvPreview(contact, text) {
    const item = document.querySelector('[data-contact="' + contact + '"]');
    if (item) {
        const prev = item.querySelector('.conv-preview span');
        if (prev && !pendingNegotiationContacts.has(contact)) prev.textContent = text;
        const time = item.querySelector('.conv-time');
        if (time) time.textContent = nowHHMM();
    } else {
        addOrUpdateConvItem(contact, text, false);
    }
}

function updateConvListOrder() {
    // L'ordre est déjà géré par prepend lors des mises à jour.
}

// =====================================================
// AFFICHAGE DES MESSAGES
// =====================================================
function renderMessage(msg) {
    const area = doc('messageArea');
    const isSent = sameUser(msg.senderId, username);
    const row = document.createElement('div');
    row.className = 'msg-row ' + (isSent ? 'sent' : 'recv');

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';

    if (!isSent && msg.senderId) {
        const snd = document.createElement('span');
        snd.className = 'msg-sender';
        snd.textContent = msg.senderId;
        snd.style.color = avatarColor(msg.senderId);
        bubble.appendChild(snd);
    }

    const text = document.createElement('div');
    text.className = 'msg-text';
    text.textContent = msg.cipherText || '';
    bubble.appendChild(text);

    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    const time = document.createElement('span');
    time.className = 'msg-time';
    time.textContent = msg._timestamp || nowHHMM();
    const lock = document.createElement('span');
    lock.className = 'msg-lock';
    lock.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="10"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/></svg>';
    meta.appendChild(time);
    meta.appendChild(lock);
    bubble.appendChild(meta);

    row.appendChild(bubble);
    area.appendChild(row);
    area.scrollTop = area.scrollHeight;
}

function displaySystemMsg(text) {
    const area = doc('messageArea');
    const div = document.createElement('div');
    div.className = 'msg-system';
    div.textContent = text;
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
}

// =====================================================
// SUPPRESSION DE CONVERSATION
// =====================================================
function confirmDelete(contact) {
    document.getElementById('deleteConfirmText').textContent =
        'Supprimer toute la conversation avec ' + contact + ' ?';
    document.getElementById('deleteConfirmModal').classList.remove('hidden');
    document.getElementById('confirmDeleteBtn').onclick = () => deleteConversation(contact);
    document.getElementById('cancelDeleteBtn').onclick  = () => document.getElementById('deleteConfirmModal').classList.add('hidden');
}

function deleteConversation(contact) {
    fetchAuth('/api/messages/conversation/' + encodeURIComponent(contact), { method: 'DELETE' })
        .then(() => {
            document.getElementById('deleteConfirmModal').classList.add('hidden');
            delete userMessages[contact];
            clearDiscussionSession(contact);
            pendingNegotiationContacts.delete(contact);
            pendingNegotiationQueue = pendingNegotiationQueue.filter(item => !sameUser(item.senderId, contact));
            delete sharedKeys[contact];
            removeSharedKeyFromStorage(contact);
            const item = document.querySelector('[data-contact="' + contact + '"]');
            if (item) item.remove();
            if (sameUser(activeRecipient, contact)) {
                activeRecipient = null;
                showChatView(false);
            }
            if (!document.querySelector('.conv-item')) {
                document.getElementById('conversationsList').innerHTML =
                    '<div class="empty-conv"><svg viewBox="0 0 24 24" fill="currentColor" width="38"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><p>Aucune conversation</p><small>Cliquez sur <strong>+</strong> pour démarrer</small></div>';
            }
            showToast('Conversation supprimée.', 'success');
        }).catch(e => { if (e.message !== 'session') showToast('Erreur lors de la suppression.', 'error'); });
}

// =====================================================
// DÉMARRAGE CONVERSATION & NÉGOCIATION
// =====================================================
function hasPendingNegotiationWith(contact) {
    return [...pendingNegotiationContacts].some(c => sameUser(c, contact));
}

function startPrivateChat(contact) {
    document.getElementById('contactsModal').classList.add('hidden');

    if (hasPendingNegotiationWith(contact)) {
        showToast(
            contact + ' vous a deja envoye une demande de discussion. Repondez via la fenetre de negociation (ou attendez qu elle se rouvre).',
            'warning',
            'Demande en attente'
        );
        return;
    }

    const session = getDiscussionSession(contact);
    if (session?.status === 'pending') {
        showToast(
            'Une negociation est deja en cours avec ' + contact + '. Attendez sa reponse avant d\'en relancer une nouvelle.',
            'warning',
            'Negociation en cours'
        );
        return;
    }
    if (session?.status === 'active' && canSendEncryptedToContact(contact)) {
        showToast(
            'Vous avez deja une discussion securisee active avec ' + contact + '.',
            'info',
            'Tunnel E2E deja etabli'
        );
        openConversation(contact);
        loadHistory(contact);
        return;
    }

    clearDiscussionSession(contact);

    if (sharedKeys[contact]) {
        console.log('[TRACE] Ancienne clé E2E avec ' + contact + ' supprimée -> renégociation obligatoire');
        delete sharedKeys[contact];
        removeSharedKeyFromStorage(contact);
    }

    resetPendingConversationState();
    activeRecipient = null;
    showChatView(false);

    const contactUser = allUsers.find(u => u.username === contact);
    const invitationProfiles = getLocallyReadyProfiles();

    if (!invitationProfiles.length) {
        document.getElementById('protocolMismatchModal').classList.remove('hidden');
        return;
    }

    showToast('Demande de discussion securisee envoyee a ' + contact + '. En attente d acceptation.', 'info', 'Negociation');
    setDiscussionSession(contact, {
        status: 'pending',
        negotiatedProfile: '',
        preview: 'Invitation en attente'
    });

    let theirPubKeyJwk = contactUser?.publicKey || null;
    const commonProfiles = getMutuallyReadyProfiles(contactUser, parseProtocols(contactUser?.protocols), theirPubKeyJwk);

    sendNeg(MSG.NEG_REQUEST, contact, invitationProfiles.join(','), myPublicKeyJwk || '');
    console.log('[TRACE] Demande envoyee (pas de fil dans la liste tant que le tunnel E2E nest pas pret). Profils proposes:', invitationProfiles, 'Profils deja valides:', commonProfiles);
}

// =====================================================
// CONTACTS MODAL
// =====================================================
function fetchContactsAndShowModal() {
    const modal = document.getElementById('contactsModal');
    modal.classList.remove('hidden');
    const list = document.getElementById('contactsList');
    list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary)">Chargement...</div>';

    fetchAuth('/api/users')
        .then(r => r.json())
        .then(users => {
            allUsers = users;
            renderContactsList(users.filter(u => u.username !== username));
        }).catch(e => { if (e.message !== 'session') list.innerHTML = '<div style="padding:20px;color:var(--danger)">Erreur de chargement.</div>'; });
}

function renderContactsList(users) {
    const list = document.getElementById('contactsList');
    list.innerHTML = '';
    if (!users.length) { list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary)">Aucun autre utilisateur.</div>'; return; }
    users.forEach(u => {
        const row = document.createElement('div');
        row.className = 'modal-contact-row';
        const av = document.createElement('div');
        av.className = 'mc-avatar';
        av.textContent = initials(u.username);
        av.style.background = avatarColor(u.username);
        const nm = document.createElement('div');
        nm.className = 'mc-name';
        nm.textContent = u.username;
        row.appendChild(av); row.appendChild(nm);
        row.onclick = () => startPrivateChat(u.username);
        list.appendChild(row);
    });
}

function filterContacts(q) {
        const filtered = allUsers.filter(u => u.username !== username && u.username.toLowerCase().includes(q.toLowerCase()));
    renderContactsList(filtered);
}

function filterSidebar(q) {
    document.querySelectorAll('.conv-item').forEach(el => {
        el.style.display = el.dataset.contact?.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
    });
}

// =====================================================
// HELPERS UI
// =====================================================
function doc(id) { return document.getElementById(id); }
function escHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function showNegOverlay(msg) {
    const o = doc('negotiationOverlay');
    o.classList.remove('hidden');
    doc('negotiationStatus').textContent = msg;
}
function hideNegOverlay() {
    doc('negotiationOverlay').classList.add('hidden');
}

function autoResize(ta) {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
}

function handleMsgKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('messageForm').dispatchEvent(new Event('submit'));
    }
}

function playBell() {
    try {
        const AudioContextCtor = globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!AudioContextCtor) {
            return;
        }
        const ctx = new AudioContextCtor();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 820;
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
        console.warn('Impossible de jouer la notification sonore', e);
    }
}

// =====================================================
// EVENT LISTENERS
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('messageForm')?.addEventListener('submit', sendMessage);
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('newChatBtn')?.addEventListener('click', fetchContactsAndShowModal);
    document.getElementById('openSettingsBtn')?.addEventListener('click', () => {
        document.getElementById('configTitle').textContent = 'Paramètres de Sécurité';
        document.getElementById('closeConfigBtn').classList.remove('hidden');
        resetKeygenStatusPanel();
        document.getElementById('generateKeysBtn').textContent = 'Enregistrer les profils';
        loadProfileCheckboxes(mySupportedProtocols);
        syncCryptoDebugCheckbox();
        setConfigJournalUiAvailable(true);
        showPage('config');
        restoreConfigTabPreference();
    });
    document.getElementById('deleteConvBtn')?.addEventListener('click', () => {
        if (activeRecipient) confirmDelete(activeRecipient);
    });
    document.getElementById('cancelMismatchBtn')?.addEventListener('click', () => {
        document.getElementById('protocolMismatchModal').classList.add('hidden');
    });

    ['contactsModal','incomingRequestModal','protocolMismatchModal','deleteConfirmModal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', e => { if (e.target === el) el.classList.add('hidden'); });
    });

    initCryptoDebugOption();
});
