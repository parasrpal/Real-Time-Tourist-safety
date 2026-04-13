const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/geofences', require('./routes/geofences'));

// Socket.io for real-time tracking
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user room
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    // Real-time location updates
    socket.on('location-update', (data) => {
        console.log('Location update:', data);
        socket.to(data.userId).emit('location-update', data);
        // Save to DB via API in production
    });

    // SOS alerts
    socket.on('sos-alert', (data) => {
        console.log('SOS ALERT:', data);
        // Broadcast to emergency contacts/authorities
        io.to('authorities').emit('sos-alert', data);
        socket.to(data.userId).emit('sos-confirmation', { message: 'SOS sent! Help incoming.' });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        server.listen(process.env.PORT || 5000, () => {
            console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

module.exports = { app, io };
