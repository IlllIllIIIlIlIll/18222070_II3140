const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const { PrismaClient } = require('@prisma/client');


const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
      secret: 'your_session_secret', // replace with a secure secret
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
    })
);


app.post('/register', async (req, res) => {
const { name, email, password } = req.body;

try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
    data: {
        name,
        email,
        password: hashedPassword,
    },
    });

    res.status(201).json({ message: 'User registered successfully' });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
}
});

  app.get('/user/score', requireAuth, async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { score: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ score: user.score });
    } catch (error) {
        console.error('Error fetching user score:', error);
        res.status(500).json({ error: 'An error occurred while fetching score' });
    }
});

// Endpoint to update the current user's score
app.post('/user/score', requireAuth,  async (req, res) => {
    const { score: newScore } = req.body;

    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Retrieve the current score
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { score: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Only update if the new score is higher
        if (newScore > user.score) {
            await prisma.user.update({
                where: { id: userId },
                data: { score: newScore },
            });
            return res.json({ message: 'Score updated successfully' });
        } else {
            return res.status(400).json({ error: 'New score is not higher than current score' });
        }
    } catch (error) {
        console.error('Error updating user score:', error);
        res.status(500).json({ error: 'An error occurred while updating score' });
    }
});
  
  // Login route
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Find user by email
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
  
      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }
  
      // Create a session in the database
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          createdAt: new Date(),
          expiresAt: expiresAt,
        },
      });
  
      // Save session data in Express session
      req.session.userId = user.id;
      req.session.sessionId = session.id;
  
      res.json({ message: 'Login successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Middleware to check if user is logged in
  function requireAuth(req, res, next) {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  }
  
  // Logout route
  app.post('/logout', async (req, res) => {
    if (req.session.userId) {
      // Delete session from database
      await prisma.session.delete({
        where: { id: req.session.sessionId },
      });
  
      // Destroy session in Express
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ message: 'Logout successful' });
      });
    } else {
      res.status(400).json({ error: 'No active session' });
    }
  });
  

// Route for the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for the game page
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'game.html'));
});

// // Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

export default app;