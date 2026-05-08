# 🎮 GateQuest

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-orange.svg)](https://www.mongodb.com/atlas)

A modern, real-time multiplayer quiz platform designed for GATE CSE preparation. Challenge friends, climb leaderboards, and master computer science concepts through interactive quizzes with lifelines, badges, and XP rewards.

## ✨ Features

### 🎯 Core Gameplay

- **Solo Quizzes**: Practice with 145+ curated GATE CSE questions across multiple subjects
- **Multiplayer Battles**: Real-time head-to-head competitions with Socket.io
- **Lifelines**: 50-50, Skip Question, Extra Time for strategic gameplay
- **Streak Rewards**: Unlock confetti animations and badges for 5+ correct answers in a row

### 🏆 Progression System

- **XP & Levels**: Earn experience points and level up with each quiz
- **Badges**: Collect achievement badges for milestones and streaks
- **Leaderboards**: Global rankings and personal statistics
- **User Profiles**: Track your progress and quiz history

### 🔧 Technical Highlights

- **Real-time Communication**: WebSocket-powered multiplayer with instant updates
- **Responsive Design**: Mobile-friendly interface built with React
- **Secure Authentication**: JWT-based user management
- **Scalable Backend**: Node.js/Express with MongoDB Atlas
- **Modern Frontend**: Vite-powered React app with smooth animations

## 🛠 Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Validation**: Custom middleware

### Frontend

- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: CSS Modules + Custom animations
- **State Management**: React Context API
- **Routing**: React Router

### DevOps

- **Version Control**: Git
- **Deployment**: Ready for Vercel/Netlify (frontend) + Railway/Render (backend)
- **Environment**: Cross-platform (Windows/macOS/Linux)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- MongoDB Atlas account ([Free tier](https://www.mongodb.com/atlas))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Sunakshi8/gatequest.git
   cd gatequest
   ```

2. **Install dependencies**

   ```bash
   npm install
   cd backend && npm install && cd ../frontend && npm install && cd ..
   ```

3. **Environment Setup**
   - Copy `backend/.env.example` to `backend/.env`
   - Add your MongoDB Atlas connection string:
     ```
     MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gatequest
     JWT_SECRET=your_super_secret_jwt_key
     PORT=5000
     ```

4. **Seed Database**

   ```bash
   npm run seed
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

6. **Open in Browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🎮 Usage

### For Players

1. **Register/Login**: Create an account to save progress
2. **Solo Mode**: Select subject → Start Quiz → Answer questions with lifelines
3. **Multiplayer**: Create/Join lobby → Compete in real-time
4. **Leaderboards**: View global rankings and personal stats

### For Developers

- **API Documentation**: See backend routes in `backend/routes/`
- **Database Models**: Check `backend/models/` for schema
- **Frontend Components**: Explore `frontend/src/components/`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Quiz

- `GET /api/quiz/questions/:subject` - Get questions by subject
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/results/:sessionId` - Get quiz results

### Leaderboard

- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/user/:userId` - User-specific stats

### Multiplayer (Socket.io)

- `join-lobby` - Join multiplayer lobby
- `start-game` - Start multiplayer game
- `submit-answer` - Submit answer in real-time

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write meaningful commit messages
- Test multiplayer features thoroughly
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GATE CSE question bank for educational content
- Open source community for amazing tools and libraries
- Contributors and beta testers

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Sunakshi8/gatequest/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Sunakshi8/gatequest/discussions)

---

**Happy quizzing! 🎉**
