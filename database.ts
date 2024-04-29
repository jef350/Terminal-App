import { Collection, MongoClient } from "mongodb";
import dotenv from "dotenv";
import { airsoft, manufacturer } from "./interfaces"; // Import interfaces

dotenv.config();

export const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");

export const airsoftCollection: Collection<airsoft> = client.db("exercises").collection<airsoft>("airsoft");
export const manufacturerCollection: Collection<manufacturer> = client.db("exercises").collection<manufacturer>("manufacturers");

export async function getAirsoftProducts(): Promise<airsoft[]> {
    return await airsoftCollection.find({}).toArray();
}

export async function getManufacturers(): Promise<manufacturer[]> {
    return await manufacturerCollection.find({}).toArray();
}

async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

export async function loadAirsoftProductsFromApi() {
    const airsoftProducts: airsoft[] = await getAirsoftProducts();
    if (airsoftProducts.length === 0) {
        console.log("Database is empty, loading airsoft products from API")
        const response = await fetch("https://your-airsoft-api-url.com/products");
        const products: airsoft[] = await response.json();
        await airsoftCollection.insertMany(products);
    }
}

export async function loadManufacturersFromApi() {
    const manufacturers: manufacturer[] = await getManufacturers();
    if (manufacturers.length === 0) {
        console.log("Database is empty, loading manufacturers from API")
        const response = await fetch("https://your-manufacturers-api-url.com/manufacturers");
        const manufacturersData: manufacturer[] = await response.json();
        await manufacturerCollection.insertMany(manufacturersData);
    }
}

export async function connect() {
    try {
        await client.connect();
        await loadAirsoftProductsFromApi();
        await loadManufacturersFromApi();
        console.log("Connected to database");
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}
