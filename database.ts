import { Collection, MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { airsoft, manufacturer, User } from "./types";
import fs from "fs/promises";
import path from "path";

dotenv.config();

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
export const MONGODB_URI = uri;

export const client = new MongoClient(MONGODB_URI);

export const airsoftcollection: Collection<airsoft> = client.db("exercises").collection<airsoft>("airsoft");
export const manufacturercollection: Collection<manufacturer> = client.db("exercises").collection<manufacturer>("manufacturer");
export const userCollection = client.db("login-express").collection<User>("users");

export async function getairsoftdata() {
    return await airsoftcollection.find({}).toArray();
}

export async function getmanufacturerdata() {
    return await manufacturercollection.find({}).toArray();
}

export async function sortairsoftdata(req: any, data: airsoft[], arr: manufacturer[]) {
    const itemsWithManufacturer = data.map(item => {
        const manufacturer = arr.find(m => m.id === item.manufacturer);
        const manufacturerName = manufacturer ? manufacturer.name : "";
        return { ...item, manufacturerName };
    });

    const q: string = req.query.q ? req.query.q.toString() : '';

    const filteredItems: airsoft[] = itemsWithManufacturer.filter(item => {
        for (const key of Object.keys(item)) {
            const value = item[key as keyof airsoft];
            if (Array.isArray(value)) {
                for (const element of value) {
                    if (element.toString().toLowerCase().includes(q.toLowerCase())) {
                        return true;
                    }
                }
            } else {
                if (value.toString().toLowerCase().includes(q.toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
    });

    const sortField = req.query.sortField || "name";
    const sortDirection = req.query.sortDirection || "asc";

    const sortedItems: airsoft[] = filteredItems.sort((a, b) => {
        if (sortField === "name") {
            return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortField === "price") {
            return sortDirection === "asc" ? a.price - b.price : b.price - a.price;
        } else if (sortField === "date") {
            const dateA = new Date(a.releasedate).getTime();
            const dateB = new Date(b.releasedate).getTime();
            return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        } else if (sortField === "brand") {
            const manufacturerA = arr.find(m => m.id === a.manufacturer);
            const manufacturerB = arr.find(m => m.id === b.manufacturer);
            const manufacturerNameA = manufacturerA ? manufacturerA.name : "";
            const manufacturerNameB = manufacturerB ? manufacturerB.name : "";
            return sortDirection === "asc" ? manufacturerNameA.localeCompare(manufacturerNameB) : manufacturerNameB.localeCompare(manufacturerNameA);
        } else if (sortField === "fullauto") {
            return sortDirection === "asc" ? (a.fullauto ? -1 : 1) : (b.fullauto ? -1 : 1);
        }
        return 0;
    });

    return sortedItems;
}

export async function loadairsoftFromApi() {
    try {
        const airsofting: airsoft[] = await getairsoftdata();
        if (airsofting.length === 0) {
            console.log("Database is empty, loading airsoft data from API");
            const filePath = path.resolve(__dirname, 'data', 'airsoft.json');
            const data = await fs.readFile(filePath, 'utf-8');
            const airsofters: airsoft[] = JSON.parse(data);
            await airsoftcollection.insertMany(airsofters);
            console.log("Airsoft data successfully loaded into the database.");
        }
    } catch (error) {
        console.error("Failed to load airsoft data:", error);
    }
}

export async function loadmanufacturerFromApi() {
    try {
        const manufacturer: manufacturer[] = await getmanufacturerdata();
        if (manufacturer.length === 0) {
            console.log("Database is empty, loading manufacturer data from API");
            const filePath = path.resolve(__dirname, 'data', 'Manufacturer.json');
            const data = await fs.readFile(filePath, 'utf-8');
            const manu: manufacturer[] = JSON.parse(data);
            await manufacturercollection.insertMany(manu);
            console.log("Manufacturer data successfully loaded into the database.");
        }
    } catch (error) {
        console.error("Failed to load manufacturer data:", error);
    }
}

export async function getAirsoftById(id: number) {
    return await airsoftcollection.findOne({ id: id });
}

export async function updateItem(id: number, item: airsoft) {
    await airsoftcollection.updateOne({ id: id }, { $set: item });
}

export async function clearDatabase() {
    try {
        await airsoftcollection.deleteMany({});
        await manufacturercollection.deleteMany({});
        console.log("Database collections cleared successfully.");
    } catch (error) {
        console.error("Failed to clear database collections:", error);
    }
}

const saltRounds: number = 10;

async function createInitialUser() {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const userEmail = process.env.USER_EMAIL;
    const userPassword = process.env.USER_PASSWORD;

    if (!adminEmail || !adminPassword || !userEmail || !userPassword) {
        throw new Error("ADMIN_EMAIL, ADMIN_PASSWORD, USER_EMAIL, and USER_PASSWORD must be set in environment");
    }

    const adminExists = await userCollection.findOne({ email: adminEmail });
    const userExists = await userCollection.findOne({ email: userEmail });

    if (!adminExists) {
        const hashedAdminPassword = await bcrypt.hash(adminPassword, saltRounds);
        const admin: User = {
            email: adminEmail,
            password: hashedAdminPassword,
            role: "ADMIN"
        };
        await userCollection.insertOne(admin);
        console.log('Admin user created:', adminEmail);
    } else {
        console.log('Admin user already exists:', adminEmail);
    }

    if (!userExists) {
        const hashedUserPassword = await bcrypt.hash(userPassword, saltRounds);
        const user: User = {
            email: userEmail,
            password: hashedUserPassword,
            role: "USER"
        };
        await userCollection.insertOne(user);
        console.log('Default user created:', userEmail);
    } else {
        console.log('Default user already exists:', userEmail);
    }
}

export async function login(email: string, password: string): Promise<User | null> {
    if (!email || !password) {
        throw new Error("Email and password required");
    }
    console.log(`Searching for user with email: ${email}`);
    const user: User | null = await userCollection.findOne({ email: email });
    console.log(`User found: ${user !== null}`);
    if (user && user.password && await bcrypt.compare(password, user.password)) {
        console.log(`Password match for user: ${email}`);
        return user;
    }
    console.log(`User not found or incorrect password for: ${email}`);
    return null;
}

export async function connect() {
    try {
        await client.connect();
        await createInitialUser();
        await loadairsoftFromApi();
        await loadmanufacturerFromApi();
        console.log(`Connected to database at ${MONGODB_URI}`);
        process.on("SIGINT", exit);
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

async function exit() {
    try {
        await clearDatabase();
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error("Failed to disconnect from database:", error);
    }
    process.exit(0);
}
