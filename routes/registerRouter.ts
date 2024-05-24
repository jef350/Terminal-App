import express, { Request, Response } from 'express';
import { userCollection } from '../database';
import bcrypt from 'bcrypt';
import { User } from '../types';
import { checkNotAuthenticated } from '../secureMiddleware'; 
export const registerRouter = () => {
    const router = express.Router();
    const saltRounds = 10;

    router.get('/register', checkNotAuthenticated, (req, res) => {
        res.render('register', { error: null });
    });

    router.post('/register', checkNotAuthenticated, async (req, res) => {
        const { email, password } = req.body;

        console.log('Received registration request with email:', email);
        console.log('Received registration request with password:', password);

        try {
            const existingUser = await userCollection.findOne({ email: email });
            if (existingUser) {
                return res.render('register', { error: 'Email already exists.' });
            }

            const hashedPassword = await bcrypt.hash(password, saltRounds);
            console.log('Hashed password:', hashedPassword);

            const newUser: User = {
                email: email,
                password: hashedPassword,
                role: "USER"
            };
            await userCollection.insertOne(newUser);
            console.log('New user created:', newUser);

            res.redirect('/login');
        } catch (error) {
            console.error('Error during registration:', error);
            res.render('register', { error: 'An error occurred. Please try again.' });
        }
    });

    return router;
};
