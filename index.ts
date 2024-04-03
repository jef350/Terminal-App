import { text } from "stream/consumers";
import data from "./data/airsoft.json";
import arr from "./data/Manufacturer.json";

import { airsoft, manufacturer } from './interfaces';
import * as readline from 'readline-sync';

import express from "express";
import ejs, { Data } from "ejs";


const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs"); 
app.set("port", 3000);






app.get('/', (req, res) => {
    let q: string = req.query.q ? req.query.q.toString() : ''; 
    let filteredItems: airsoft[] = data.filter((data) => {
        return data.name.toLowerCase().includes(q.toLowerCase()); 
    });

    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
    const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
  
    let sortedPersons = [...filteredItems].sort((a, b) => {
        if (sortField === "name") {
            return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortField === "price") {
            return sortDirection === "asc" ? a.price - b.price : b.price - a.price;
        }else if (sortField === "date") {
            const dateA = new Date(a.releasedate);
            const dateB = new Date(b.releasedate);
            return sortDirection === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        } else {
            return 0;
        }
    });

    res.render("home", {
        data: sortedPersons,
        arr: arr,
        q: q,
        sortField: sortField,
        sortDirection: sortDirection
    });
});

app.get("/product/:id", (req, res) => {
    let id: number = parseInt(req.params.id); 

    let product = data.find((item) => item.id === id);

        res.render("product", { product: product, arr: arr });
    
});

app.get("/brands", (req, res) => {

        res.render("brands", { arr: arr });
    
});

app.get("/type's", (req, res) => {

    res.render("types");

});

  app.listen(app.get('port'), ()=>console.log( '[server] http://localhost:' + app.get('port')));