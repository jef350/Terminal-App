import { text } from "stream/consumers";
/*import data from "./data/airsoft.json";*/
/*import arr from "./data/Manufacturer.json";*/
import { connect, getairsoftdata, getmanufacturerdata, getAirsoftById, updateItem, sortairsoftdata } from "./database";

import { airsoft, manufacturer } from './interfaces';


import express from "express";


const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs"); 
app.set("port", 3000);

app.get('/', async (req, res) => {
    try {
        const data = await getairsoftdata();
        const arr = await getmanufacturerdata();

        let q: string = req.query.q ? req.query.q.toString() : '';
        const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
        const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";

        let sortedItems = await sortairsoftdata(req, data, arr);

        res.render("home", {
            data: sortedItems,
            arr: arr,
            q: q,
            sortField: sortField,
            sortDirection: sortDirection
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/product/:id", async (req, res) => {

    const data = await getairsoftdata();

    const arr = await getmanufacturerdata();

    let id: number = parseInt(req.params.id); 

    let product = data.find((item) => item.id === id);

        res.render("product", { product: product, arr: arr });
    
});

app.get("/product/:id/update", async(req, res) => {
    const data = await getairsoftdata();
    let id : number = parseInt(req.params.id);
    let product = data.find((item) => item.id === id);
    let item : airsoft | null = await getAirsoftById(id);
        res.render("update", {
            product: product
        });
});

app.post("/product/:id/update", async(req, res) => {
    const data = await getairsoftdata();
    let id : number = parseInt(req.params.id);
    let item : airsoft = req.body;
    const arr = await getmanufacturerdata();
    await updateItem(id, item);
    res.redirect("/product/" + id);
});


app.get("/brands", async (req, res) => {

    const arr = await getmanufacturerdata();

        res.render("brands", { arr: arr });
    
});

app.get("/types", (req, res) => {

    res.render("types");

});

app.listen(3000, async () => {
    await connect();
    console.log("Server is running on port 3000");
});


