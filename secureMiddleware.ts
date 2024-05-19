import { NextFunction, Request, Response } from "express";

// Middleware to ensure the user is authenticated
export function secureMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
        res.locals.user = req.session.user;
        next();
    } else {
        res.redirect("/login");
    }
}

// Middleware to ensure the user is not authenticated (for login and register pages)
export function checkNotAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
        return res.redirect('/');
    }
    next();
}
