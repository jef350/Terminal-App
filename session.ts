// session.ts
import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session";
import { MONGODB_URI } from "./database";
import { User } from "./types";

const MongoDBStore = connectMongoDBSession(session);

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: "sessions",
});

declare module 'express-session' {
    interface SessionData {
      message?: string;
      user?: import('./types').User; // Assuming `User` type is defined in `types.ts`
    }
  }

export default session({
    secret: process.env.SESSION_SECRET || "my-super-secret-secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
});
