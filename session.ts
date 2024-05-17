import dotenv from "dotenv";
dotenv.config();

import session, {MemoryStore } from "express-session";

declare module 'express-session' {
    export interface SessionData {

    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? "my-super-secret-secret",
    store: new MemoryStore(),
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
});