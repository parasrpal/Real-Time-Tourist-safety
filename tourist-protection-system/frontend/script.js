// Tourist Protection System - Frontend Script
// Features: GPS tracking, geofencing, SOS, multilingual chat

class TouristProtection {
    constructor() {
        this.map = null;
        this.userMarker = null;
        this.watchId = null;
        this.currentPosition = null;
        this.isTracking = false;
        this.chatMessages = [];
        this.translations = {
            en: {
                title: 'Tourist Protection System',
                startTracking: 'Start Tracking',
                sos: 'SOS Emergency',
                location: 'Location:',
                zone: 'Zone:',
                safe: 'Safe',
                unsafe: 'UNSAFE - Alert!',
                warning: 'Warning Zone',
                askHelp: 'Ask for help...',
                aiHello: 'Hello! How can I assist you today?',
                aiSafe: "You're in a safe area. Enjoy your trip!",
                aiUnsafe: '⚠️ DANGER ZONE! Move to safer area immediately.',
                aiSos: 'SOS activated! Help is on the way.'
            },
            es: {
                title: 'Sistema de Protección Turística',
                startTracking: 'Iniciar Seguimiento',
                sos: 'SOS Emergencia',
                location: 'Ubicación:',
                zone: 'Zona:',
                safe: 'Segura',
                unsafe: 'NO SEGURA - ¡Alerta!',
                warning: 'Zona de Advertencia',
                askHelp: 'Pide ayuda...',
                aiHello: '¡Hola! ¿En qué puedo ayudarte hoy?',
                aiSafe: 'Estás en una zona segura. ¡Disfruta tu viaje!',
                aiUnsafe: '⚠️ ¡ZONA PELIGROSA! Dirígete inmediatamente a una zona más segura.',
                aiSos: '¡SOS activado! La ayuda está en camino.'
            },
            fr: {
                title: 'Système de Protection Touristique',
                startTracking: 'Démarrer Suivi',
                sos: 'SOS Urgence',
                location: 'Emplacement:',
                zone: 'Zone:',
                safe: 'Sûre',
                unsafe: 'NON SÛRE - Alerte!',
                warning: 'Zone d\'Alerte',
                askHelp: 'Demander de l\'aide...',
                aiHello: 'Bonjour! Comment puis-je vous aider aujourd\'hui?',
                aiSafe: "Vous êtes dans une zone sûre. Profitez de votre voyage!",
                aiUnsafe: '⚠️ ZONE DANGEREUSE! Dirigez-vous immédiatement vers une zone plus sûre.',
                aiSos: 'SOS activé! L\'aide est en route.'
            }
        };
        this.currentLang = 'en';

        this.init();
    }

    init() {
        this.bindEvents();
        this.initMap();
        this.updateUI();
    }

    bindEvents() {
        // Auth events
        document.getElementById('loginBtn').addEventListener('click', () => {
            document.getElementById('authModal').style.display = 'block';
        });

        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('authModal').style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('authModal');
            if (e.target === modal) modal.style.display = 'none';
        });

        document.getElementById('toggleAuth').addEventListener('click', () => {
            const title = document.getElementById('modalTitle');
            const submit = document.getElementById('submitAuth');
            const nameInput = document.getElementById('name');
            const phoneInput = document.getElementById('phone');
            if (title.textContent === 'Login') {
                title.textContent = 'Register';
                submit.textContent = 'Register';
                nameInput.style.display = 'block';
                phoneInput.style.display = 'block';
            } else {
                title.textContent = 'Login';
                submit.textContent = 'Login';
                nameInput.style.display = 'none';
                phoneInput.style.display = 'none';
            }
        });

        document.getElementById('authForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const title = document.getElementById('modalTitle').textContent;

            if (title === 'Register') {
                if (!name || !phone) {
                    alert('Please fill all fields for registration');
                    return;
                }
                const success = await this.backend.register(name, email, password, phone, []);
                if (success) {
                    document.getElementById('authModal').style.display = 'none';
                    this.addBotMessage('✅ Registration successful! Welcome!');
                } else {
                    alert('Registration failed');
                }
            } else {
                const success = await this.backend.login(email, password);
                if (success) {
                    document.getElementById('authModal').style.display = 'none';
                    this.addBotMessage('✅ Login successful!');
                } else {
                    alert('Login failed');
                }
            }
        });

        // Existing events
        document.getElementById('startTracking').addEventListener('click', () => this.toggleTracking());
        document.getElementById('sosBtn').addEventListener('click', () => this.triggerSOS());
        document.getElementById('langSelect').addEventListener('change', (e) => {
            this.currentLang = e.target.value;
            this.updateUI();
        });
        document.getElementById('sendChat').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    initMap() {
        // Default view: Example tourist area (Paris)
        this.map = L.map('map').setView([48.8566, 2.3522], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Example unsafe geofence zones (red polygons)
        const unsafeZones = [
            { coords: [[48.8600, 2.3400], [48.8600, 2.3500], [48.8550, 2.3500], [48.8550, 2.3400]], alert: 'unsafe' },
            { coords: [[48.8500, 2.3600], [48.8500, 2.3700], [48.8450, 2.3700], [48.8450, 2.3600]], alert: 'warning' }
        ];

        unsafeZones.forEach(zone => {
            L.polygon(zone.coords, {
                color: zone.alert === 'unsafe' ? 'red' : 'orange',
                fillColor: zone.alert === 'unsafe' ? '#ff4444' : '#ffaa00',
                fillOpacity: 0.3,
                weight: 3
            }).addTo(this.map)
            .bindPopup(`<b>${zone.alert.toUpperCase()} ZONE</b><br>Avoid this area!`);
        });
    }

    toggleTracking() {
        if (this.isTracking) {
            this.stopTracking();
        } else {
            this.startTracking();
        }
    }

    async startTracking() {
        if (!navigator.geolocation) {
            alert('Geolocation not supported!');
            return;
        }

        this.isTracking = true;
        document.getElementById('startTracking').textContent = 'Stop Tracking';
        document.getElementById('sosBtn').disabled = !this.backend.userId;

        // Single position
        navigator.geolocation.getCurrentPosition(
            pos => this.updatePosition(pos),
            err => this.handleError(err),
            { enableHighAccuracy: true }
        );

        // Continuous tracking
        this.watchId = navigator.geolocation.watchPosition(
            pos => this.updatePosition(pos),
            err => this.handleError(err),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );
    }

    stopTracking() {
        this.isTracking = false;
        if (this.watchId) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        document.getElementById('startTracking').innerHTML = '<i class="fas fa-location-arrow"></i> Start Tracking';
        document.getElementById('sosBtn').disabled = true;
        if (this.userMarker) this.map.removeLayer(this.userMarker);
        this.updateStatus('Location: Stopped', 'Zone: --');
    }

    async updatePosition(position) {
        this.currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
        };

        // Send to backend
        await this.backend.sendLocation(this.currentPosition.lat, this.currentPosition.lng, this.currentPosition.accuracy);

        // Update marker
        if (this.userMarker) this.map.removeLayer(this.userMarker);
        this.userMarker = L.circleMarker([this.currentPosition.lat, this.currentPosition.lng], {
            radius: 8,
            fillColor: '#44ff44',
            color: '#00ff00',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(this.map)
        .bindPopup(`You are here<br>Accuracy: ${this.currentPosition.accuracy.toFixed(0)}m`);

        this.map.panTo([this.currentPosition.lat, this.currentPosition.lng], { animate: true });

        // Fetch & check geofences from backend
        const geofences = await this.backend.fetchNearbyGeofences(this.currentPosition.lat, this.currentPosition.lng);
        const zoneStatus = this.checkGeofence(geofences);
        this.updateStatus(
            `Location: ${this.currentPosition.lat.toFixed(6)}, ${this.currentPosition.lng.toFixed(6)}`,
            zoneStatus.text
        );
        document.getElementById('zoneStatus').className = `status ${zoneStatus.className}`;
    }

    checkGeofence(geofences = {}) {
        // Use backend geofences or fallback
        if (geofences.success && geofences.geofences) {
            for (const gf of geofences.geofences) {
                // Simplified distance check to geofence center
                const center = { lat: gf.coordinates[0].lat || gf.coordinates[0][0], lng: gf.coordinates[0].lng || gf.coordinates[0][1] };
                const dist = this.getDistance(this.currentPosition, center);
                if (dist < 500) { // Tune based on radius
                    return { text: `${gf.type.toUpperCase()} ZONE`, className: gf.type };
                }
            }
        }

        // Fallback local check
        const unsafe1 = { lat: 48.8575, lng: 2.345 };
        const dist1 = this.getDistance(this.currentPosition, unsafe1);
        const unsafe2 = { lat: 48.8475, lng: 2.365 };
        const dist2 = this.getDistance(this.currentPosition, unsafe2);

        if (dist1 < 500) {
            return { text: this.translations[this.currentLang].unsafe, className: 'unsafe' };
        } else if (dist2 < 300) {
            return { text: this.translations[this.currentLang].warning, className: 'warning' };
        }
        return { text: this.translations[this.currentLang].safe, className: 'safe' };
    }

    getDistance(pos1, pos2) {
        const R = 6371; // Earth radius km
        const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
        const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c * 1000; // meters
    }

    triggerSOS() {
        if (!this.currentPosition) {
            alert('Start tracking first!');
            return;
        }

        const sosMessage = `🚨 EMERGENCY SOS! 🚨\n\nLocation: https://maps.google.com/?q=${this.currentPosition.lat},${this.currentPosition.lng}\nAccuracy: ${this.currentPosition.accuracy.toFixed(0)}m\nTime: ${new Date().toLocaleString()}\n\nTourist needs IMMEDIATE HELP!`;

        // Share API (modern browsers)
        if (navigator.share) {
            navigator.share({
                title: 'Tourist SOS Emergency',
                text: sosMessage,
                url: window.location.href
            });
        } else {
            // Fallback: clipboard + alert
            navigator.clipboard.writeText(sosMessage).then(() => {
                alert('SOS message copied to clipboard!\nPaste to contacts/email:\n' + sosMessage);
            });
        }

        // Send to AI chat
        this.addBotMessage(this.translations[this.currentLang].aiSos);
        document.getElementById('sosBtn').innerHTML = '<i class="fas fa-check"></i> SOS Sent!';
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;

        this.addUserMessage(message);
        input.value = '';

        // Simulate AI response (multilingual)
        setTimeout(() => {
            let response;
            const lowerMsg = message.toLowerCase();
            if (lowerMsg.includes('help') || lowerMsg.includes('ayuda') || lowerMsg.includes('aide')) {
                response = this.currentPosition ? this.translations[this.currentLang].aiSafe : this.translations[this.currentLang].aiHello;
            } else if (lowerMsg.includes('danger') || lowerMsg.includes('peligro') || lowerMsg.includes('danger')) {
                response = this.translations[this.currentLang].aiUnsafe;
            } else {
                response = this.translations[this.currentLang].aiHello;
            }
            this.addBotMessage(response);
        }, 1000);
    }

    addUserMessage(text) {
        this.chatMessages.push({ type: 'user', text });
        this.renderChat();
    }

    addBotMessage(text) {
        this.chatMessages.push({ type: 'bot', text });
        this.renderChat();
    }

    renderChat() {
        const container = document.getElementById('chatMessages');
        container.innerHTML = this.chatMessages.map(msg => 
            `<div class="chat-message ${msg.type}">${this.escapeHtml(msg.text)}</div>`
        ).join('');
        container.scrollTop = container.scrollHeight;
    }

    updateStatus(location, zone) {
        document.getElementById('locationStatus').textContent = this.translations[this.currentLang].location + ' ' + location;
        document.getElementById('zoneStatus').textContent = this.translations[this.currentLang].zone + ' ' + zone;
    }

    updateUI() {
        const t = this.translations[this.currentLang];
        document.querySelector('h1').textContent = t.title;
        document.getElementById('startTracking').childNodes[1].textContent = t.startTracking;
        document.getElementById('sosBtn').childNodes[1].textContent = t.sos;
        document.getElementById('chatInput').placeholder = t.askHelp;
        document.querySelector('.lang-switcher label').textContent = 'Language:';
    }

    handleError(error) {
        let msg = 'Location error: ';
        switch(error.code) {
            case error.PERMISSION_DENIED: msg += 'Permission denied'; break;
            case error.POSITION_UNAVAILABLE: msg += 'Position unavailable'; break;
            case error.TIMEOUT: msg += 'Timeout'; break;
            default: msg += 'Unknown';
        }
        console.error(msg);
        alert(msg);
        this.stopTracking();
    }

    escapeHtml(text) {
        const map = { '&': '&amp;', '<': '<', '>': '>', '"': '"', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Socket.io CDN & API integration
const SOCKET_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:5000/api';

// Backend integration class
class BackendIntegration {
    constructor() {
        this.token = localStorage.getItem('token');
        this.userId = localStorage.getItem('userId');
        this.socket = null;
        this.initSocket();
        this.checkAuth();
    }

    initSocket() {
        const script = document.createElement('script');
        script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
        script.onload = () => {
            this.socket = io(SOCKET_URL);
            this.setupSocketEvents();
        };
        document.head.appendChild(script);
    }

    setupSocketEvents() {
        this.socket.on('connect', () => {
            console.log('Socket connected');
            if (this.userId) {
                this.socket.emit('join', this.userId);
            }
        });

        this.socket.on('location-update', (data) => {
            console.log('Received location update:', data);
        });

        this.socket.on('sos-confirmation', (data) => {
            app.addBotMessage(data.message);
        });
    }

    async apiCall(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            return await response.json();
        } catch (error) {
            console.error('API error:', error);
            return { success: false, message: 'Network error' };
        }
    }

    async login(email, password) {
        const result = await this.apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (result.success) {
            this.setAuth(result.token, result.user.id);
            app.updateUserStatus(result.user);
            return true;
        }
        return false;
    }

    async register(name, email, password, phone, emergencyContacts) {
        const result = await this.apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, phone, emergencyContacts })
        });

        if (result.success) {
            this.setAuth(result.token, result.user.id);
            app.updateUserStatus(result.user);
            return true;
        }
        return false;
    }

    setAuth(token, userId) {
        this.token = token;
        this.userId = userId;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
    }

    logout() {
        this.token = null;
        this.userId = null;
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        app.updateUserStatus(null);
    }

    checkAuth() {
        if (this.token && this.userId) {
            // Verify token if needed
            app.updateUserStatus({ id: this.userId });
        }
    }

    async sendLocation(lat, lng, accuracy) {
        if (!this.userId) return;
        await this.apiCall(`/users/${this.userId}/location`, {
            method: 'POST',
            body: JSON.stringify({ lat, lng, accuracy })
        });

        // Socket emit
        this.socket.emit('location-update', {
            userId: this.userId,
            lat, lng, accuracy,
            timestamp: Date.now()
        });
    }

    async sendSOS(lat, lng, accuracy, message) {
        if (!this.userId) return;
        const result = await this.apiCall('/alerts/sos', {
            method: 'POST',
            body: JSON.stringify({
                userId: this.userId,
                location: { type: 'Point', coordinates: [lng, lat] },
                accuracy,
                message
            })
        });

        if (result.success) {
            this.socket.emit('sos-alert', {
                userId: this.userId,
                lat, lng, accuracy
            });
        }
        return result;
    }

    async fetchNearbyGeofences(lat, lng) {
        return await this.apiCall(`/geofences/nearby?lat=${lat}&lng=${lng}`);
    }
}

// Global instances
const backend = new BackendIntegration();
const app = new TouristProtection();

// Extend TouristProtection with backend integration
app.backend = backend;
app.updateUserStatus = function(user) {
    const status = document.getElementById('userStatus');
    if (user) {
        status.textContent = `Logged in: ${user.name || user.id}`;
        status.className = 'status logged-in';
    } else {
        status.textContent = 'Guest Mode';
        status.className = 'status';
    }
};
