import { Collection, MongoClient } from "mongodb";
import dotenv from "dotenv";
import { airsoft, manufacturer } from "./interfaces";
import fs from 'fs';
dotenv.config();

export const client = new MongoClient(process.env.MONGODB_URI || "mongodb+srv://8088:8088@cluster0.prdpq6c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

export const airsoftcollection : Collection<airsoft> = client.db("exercises").collection<airsoft>("airsoft");
export const manufacturercollection : Collection<manufacturer> = client.db("exercises").collection<manufacturer>("manufacturer");


export async function getairsoftdata() {
    return await airsoftcollection.find({}).toArray();
}

export async function getmanufacturerdata() {
    return await manufacturercollection.find({}).toArray();
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

export async function loadairsoftFromApi() {
    const airsofting : airsoft[] = await getairsoftdata();
    if (airsofting.length == 0) {
        console.log("Database is empty, loading airsoft from API")
        const data = JSON.parse(fs.readFileSync('./data/airsoft.json', 'utf8'));
        await airsoftcollection.insertMany(data);
    }
}

export async function loadmanufacturerFromApi() {
    const manufacturers : manufacturer[] = await getmanufacturerdata();
    if (manufacturers.length == 0) {
        console.log("Database is empty, loading manufacturer from API")
        const data = JSON.parse(fs.readFileSync('./data/Manufacturer.json', 'utf8'));
        await manufacturercollection.insertMany(data);
    }
}

export async function getUserById(id: number) {
    return await airsoftcollection.findOne({ id: id });
}

export async function updateUser(id: number, item: airsoft) {
    return await airsoftcollection.updateOne({ id: id }, { $set: item });
}




export async function connect() {
    try {
        await client.connect();
        await loadairsoftFromApi(); 
        await loadmanufacturerFromApi();  
        console.log("Connected to database");
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}