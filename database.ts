import { Collection, MongoClient} from "mongodb";
import dotenv from "dotenv";
import { airsoft, manufacturer, User } from "./interfaces";
import bcrypt from "bcrypt";
import { error } from "console";
dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";

export const client = new MongoClient(process.env.MONGODB_URI || "mongodb+srv://8088:8088@cluster0.prdpq6c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

export const airsoftcollection : Collection<airsoft> = client.db("exercises").collection<airsoft>("airsoft");
export const manufacturercollection : Collection<manufacturer> = client.db("exercises").collection<manufacturer>("manufacturer");
export const userCollection = client.db("login-express").collection<User>("users");

const saltRounds : number = 10;

export async function getairsoftdata() {
    return await airsoftcollection.find({}).toArray();
}

export async function getmanufacturerdata() {
    return await manufacturercollection.find({}).toArray();
}

export async function sortairsoftdata(req: any, data: airsoft[], arr: manufacturer[]) {
    let itemsWithManufacturer = data.map(item => {
        const manufacturer = arr.find((manufacturer: any) => manufacturer.id === item.manufacturer);
        const manufacturerName = manufacturer ? manufacturer.name : ""; 
        return { ...item, manufacturerName };
    });

    let q: string = req.query.q ? req.query.q.toString() : ''; 

    let filteredItems: airsoft[] = itemsWithManufacturer.filter((item: airsoft) => {
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

    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
    const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";

    let sortedItems: airsoft[] = [];

    try {
        if (sortField === "name") {
            sortedItems = filteredItems.sort((a, b) => (sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
        } else if (sortField === "price") {
            sortedItems = filteredItems.sort((a, b) => (sortDirection === "asc" ? a.price - b.price : b.price - a.price));
        } else if (sortField === "date") {
            sortedItems = filteredItems.sort((a, b) => {
                const dateA = new Date(a.releasedate).getTime();
                const dateB = new Date(b.releasedate).getTime();
                return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
            });
        } else if (sortField === "brand") {
            sortedItems = filteredItems.sort((a, b) => {
                const manufacturerA = arr.find(manufacturer => manufacturer.id === a.manufacturer);
                const manufacturerB = arr.find(manufacturer => manufacturer.id === b.manufacturer);
                const manufacturerNameA = manufacturerA ? manufacturerA.name : "";
                const manufacturerNameB = manufacturerB ? manufacturerB.name : "";
                return sortDirection === "asc" ? manufacturerNameA.localeCompare(manufacturerNameB) : manufacturerNameB.localeCompare(manufacturerNameA);
            });
        } else if (sortField === "fullauto") {
            sortedItems = filteredItems.sort((a, b) => (sortDirection === "asc" ? (a.fullauto ? -1 : 1) : (b.fullauto ? -1 : 1)));
        } else {
            sortedItems = filteredItems;
        }
    } catch (error) {
        console.error(error);
        sortedItems = filteredItems; // If an error occurs during sorting, return the unsorted data
    }

    return sortedItems;
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

async function createInitialUser() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }
    let email : string | undefined = process.env.ADMIN_EMAIL;
    let password : string | undefined = process.env.ADMIN_PASSWORD;
    if (email === undefined || password === undefined) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
    }
    await userCollection.insertOne({
        email: email,
        password: await bcrypt.hash(password, saltRounds),
        role: "ADMIN"
    });
}

export async function login(email:string, password: string) {
    if (email === "" || password === "") {
        throw new Error("email en passwoord zijn nodig om verder te gaan");
    }
    let user: User | null = await userCollection.findOne<User>({email: email});
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        }else{
            throw new Error("passwoord is verkeerd");
        }
    }else{
        throw new Error("gebruiker niet gevonden");
    }
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


export async function connect() {
    try {
        await client.connect();
        await loadairsoftFromApi(); 
        await loadmanufacturerFromApi();  
        await createInitialUser();
        console.log("Connected to database");
        process.on("SIGINT", exit);
    } catch (error) {
        console.error(error);
    }
}

