import express from 'express';
import { login } from '../database';
import { User } from '../types';
import { checkNotAuthenticated } from '../secureMiddleware'; // Import the middleware

export const loginRouter = () => {
    const router = express.Router();

    router.get('/login', checkNotAuthenticated, (req, res) => {
        res.render('login', { error: null });
    });

    router.post('/login', checkNotAuthenticated, async (req, res) => {
        const email: string = req.body.email;
        const password: string = req.body.password;

        console.log('Received login request with email:', email);
        console.log('Received login request with password:', password);

        if (!email || !password) {
            return res.render('login', { error: 'Email and password are required.' });
        }
        try {
            const user: User | null = await login(email, password);
            if (user) {
                delete user.password;
                req.session.user = user;
                console.log('User session set:', req.session.user);
                res.redirect('/');
            } else {
                res.render('login', { error: 'Invalid email or password.' });
            }
        } catch (e: any) {
            console.error('Login error:', e);
            res.render('login', { error: 'An error occurred. Please try again.' });
        }
    });

    return router;
};
