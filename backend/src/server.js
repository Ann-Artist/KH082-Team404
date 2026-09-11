const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Initialize database
require('./database/db');

const profileRoutes = require('./routes/profileRoutes');
const carbonRoutes = require('./routes/carbonRoutes');
const questRoutes = require('./routes/questRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const progressionRoutes = require('./routes/progressionRoutes');
const impactRoutes = require('./routes/impactRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & body parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/profile', profileRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/progression', progressionRoutes);
app.use('/api/impact', impactRoutes);

// Convenience alias routes matching user endpoint requirements
const progressionController = require('./controllers/progressionController');
const submissionController = require('./controllers/submissionController');
const impactController = require('./controllers/impactController');

app.get('/api/users/:userId/dashboard', progressionController.getDashboard);
app.get('/api/users/:userId/submissions', submissionController.getUserSubmissions);
app.get('/api/users/:userId/progression', progressionController.getProgression);
app.get('/api/users/:userId/impact', impactController.getUserImpact);

// Root health & info check
app.get('/', (req, res) => {
  res.send('🌱 EcoQuest API Backend Server is running! Please open <a href="http://localhost:3000">http://localhost:3000</a> in your browser to view the EcoQuest Game application.');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'EcoQuest API Backend', timestamp: new Date() });
});

// Central error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🌱 EcoQuest Backend Server Running`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`=================================`);
});
