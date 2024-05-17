import session from "express-session";
import mongoDbSession from "connect-mongodb-session";
import { User } from "./interfaces";
import { MONGODB_URI } from "./database";
import dotenv from 'dotenv';

dotenv.config();

const MongoDBStore = mongoDbSession(session);

console.log(`Connecting to MongoDB with URI: ${MONGODB_URI}`);

const mongoStore = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
    databaseName: "login-express",
});

mongoStore.on('error', function(error) {
    console.error('Session store error:', error);
});

declare module 'express-session' {
    export interface SessionData {
        user?: User
    }
}

export default session({
    secret: process.env.SESSION_SECRET ?? "my-super-secret-secret",
    store: mongoStore,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
});
