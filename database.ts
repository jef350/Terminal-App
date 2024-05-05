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
        console.log("Database is empty, loading users from API")
        const response = await fetch("/data/airsoft.json");
        const airsofters : airsoft[] = await response.json();
        await airsoftcollection.insertMany(airsofters);
    }
}

export async function loadmanufacturerFromApi() {
    const manufacturer : manufacturer[] = await getmanufacturerdata();
    if (manufacturer.length == 0) {
        console.log("Database is empty, loading users from API")
        const response = await fetch("/data/Manufacturer.json");
        const manu : manufacturer[] = await response.json();
        await manufacturercollection.insertMany(manu);
    }
}



export async function getAirsoftById(id: number) {
    return await airsoftcollection.findOne({ id: id });
}

export async function updateItem(id: number, item: airsoft) {
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

