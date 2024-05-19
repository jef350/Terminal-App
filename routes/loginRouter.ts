import express from 'express';
import { login } from '../database';
import { User } from '../types';

export const loginRouter = () => {
    const router = express.Router();

    router.get('/login', (req, res) => {
        res.render('login');
    });

    router.post('/login', async (req, res) => {
        const email: string = req.body.email;
        const password: string = req.body.password;
        try {
            const user: User | null = await login(email, password);
            if (user) {
                delete user.password;
                req.session.user = user;
                console.log('User session set:', req.session.user);
                res.redirect('/');
            } else {
                res.redirect('/login');
            }
        } catch (e: any) {
            console.error('Login error:', e);
            res.redirect('/login');
        }
    });

    return router;
};