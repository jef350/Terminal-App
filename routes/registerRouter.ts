import express, { Request, Response } from 'express';
import { userCollection } from '../database';
import bcrypt from 'bcrypt';
import { User } from '../types';

export const registerRouter = () => {
    const router = express.Router();
    const saltRounds = 10;

    router.get('/register', (req: Request, res: Response) => {
        res.render('register', { error: null });
    });

    router.post('/register', async (req: Request, res: Response) => {
        const { email, password } = req.body;

        // Debugging
        console.log('Received registration request with email:', email);
        console.log('Received registration request with password:', password);

        try {
            // Check if email already exists
            const existingUser = await userCollection.findOne({ email: email });
            if (existingUser) {
                return res.render('register', { error: 'Email already exists.' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            console.log('Hashed password:', hashedPassword);

            // Create the user
            const newUser: User = {
                email: email,
                password: hashedPassword,
                role: "USER" // Explicitly assign the role as "USER"
            };
            await userCollection.insertOne(newUser);
            console.log('New user created:', newUser);

            // Redirect to login page
            res.redirect('/login');
        } catch (error) {
            console.error('Error during registration:', error);
            res.render('register', { error: 'An error occurred. Please try again.' });
        }
    });

    return router;
};
