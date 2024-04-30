import { text } from "stream/consumers";
/*import data from "./data/airsoft.json";*/
/*import arr from "./data/Manufacturer.json";*/
import { connect, getairsoftdata, getmanufacturerdata } from "./database";

import { airsoft, manufacturer } from './interfaces';


import express from "express";


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs"); 
app.set("port", 3000);

app.get('/', async (req, res) => {

    const data = await getairsoftdata();

    const arr = await getmanufacturerdata();

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
  
    let sortedItems = [...filteredItems].sort((a, b) => {
        if (sortField === "name") {
            return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortField === "price") {
            return sortDirection === "asc" ? a.price - b.price : b.price - a.price;
        }else if (sortField === "date") {
            const dateA = new Date(a.releasedate);
            const dateB = new Date(b.releasedate);
            return sortDirection === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        }else if (sortField === "brand"){
            const manufacturerA = arr.find(manufacturer => manufacturer.id === a.manufacturer);
            const manufacturerB = arr.find(manufacturer => manufacturer.id === b.manufacturer);
            const manufacturerNameA = manufacturerA ? manufacturerA.name : "";
            const manufacturerNameB = manufacturerB ? manufacturerB.name : "";
            return sortDirection === "asc" ? manufacturerNameA.localeCompare(manufacturerNameB) : manufacturerNameB.localeCompare(manufacturerNameA);
        } else if (sortField === "fullauto") {
            return sortDirection === "asc" ? (a.fullauto ? -1 : 1) : (b.fullauto ? -1 : 1);
        } else {
            return 0;
        }
    });
  
    res.render("home", {
        data: sortedItems,
        arr: arr,
        q: q,
        sortField: sortField,
        sortDirection: sortDirection
    });
});


app.get("/product/:id", async (req, res) => {

    const data = await getairsoftdata();

    const arr = await getmanufacturerdata();

    let id: number = parseInt(req.params.id); 

    let product = data.find((item) => item.id === id);

        res.render("product", { product: product, arr: arr });
    
});

app.get("/brands", async (req, res) => {

    const arr = await getmanufacturerdata();

        res.render("brands", { arr: arr });
    
});

app.get("/type's", (req, res) => {

    res.render("types");

});

app.listen(3000, async () => {
    await connect();
    console.log("Server is running on port 3000");
});


