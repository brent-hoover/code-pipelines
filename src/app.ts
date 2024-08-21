import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { runPipeline } from './utils/runPipeline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());


app.post('/validateEmail', async (req, res) => {
    const { email, maxCost = 1000 } = req.body;
    console.log(`Running functions for email validation with email: ${email} and max cost: ${maxCost}...`);

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const isValid = await runPipeline(email, 'validateEmail', maxCost);
        res.json({ isValid });
    } catch (error) {
        console.error('Error in email validation pipeline:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Pipeline Server is running on port ${PORT}`);
});
