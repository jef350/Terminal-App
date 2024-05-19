import express from "express";
import { login } from "../database";
import { User } from '../types';
import { secureMiddleware } from "../secureMiddleware";

export function loginRouter() {
    const router = express.Router();

    router.get("/login", (req, res) => {
        res.render("login");
    });

    router.post("/login", async (req, res) => {
        const email: string = req.body.email;
        const password: string = req.body.password;
        try {
            console.log('Attempting login for:', email); // Log the email being attempted
            const user: User | null = await login(email, password);
            if (user) {
                delete user.password; // Remove password from user object
                req.session.user = user;
                console.log('User session set:', req.session.user); // Log the user session
                res.redirect("/");
            } else {
                console.log('User not found or incorrect password');
                res.redirect("/login");
            }
        } catch (e: any) {
            console.error('Login error:', e); // Log the error for diagnostics
            res.redirect("/login");
        }
    });

    router.post("/logout", secureMiddleware, (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err); // Log the error for diagnostics
            }
            res.redirect("/login");
        });
    });

    return router;
}
