const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const app = express();
const weatherRouter = require('./routes/weather');
app.use(express.json());

// Generate a secret temporary key in each server restart
const serverSecret = crypto.randomBytes(64).toString('hex');

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validate hardcoded credentials
    if (email === 'admin@admin.com' && password === 'admin') {
        const user = { email };
        
        // Create token with the temporary secret key generated in each restart
        const accessToken = jwt.sign(user, serverSecret, { expiresIn: '1h' });
        res.json({ accessToken });
    } else {
        res.status(401).json({ message: 'Incorrect credentials. Please try again.' });
    }
});

// Authenticate the token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No valid token. Please log back in.' });

    // Verify the token with the secret temporary key
    jwt.verify(token, serverSecret, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token. Please check your token or log in.' });
        req.user = user;
        next();
    });
}

// Protect all routes with the authentication token
app.use('/weather', authenticateToken, weatherRouter);

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});