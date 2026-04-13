# Backend Setup & Run

## Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

## Quick Start
```bash
cd "c:/New folder/tourist-protection-system/backend"
npm install
```

## Update .env
```
MONGO_URI=mongodb://localhost:27017/tourist-protection
JWT_SECRET=your-super-secret-key-here
PORT=5000
```

## Run
```bash
npm run dev  # Development with nodemon
# or
npm start    # Production
```

Server runs on http://localhost:5000

## Test APIs
```bash
curl http://localhost:5000/api/health
```

## Seed Geofences (optional)
Add sample unsafe zones via /api/geofences/all
