import { text } from "stream/consumers";
import data from "./assets/airsoft.json";
import arr from "./assets/Manufacturer.json";
import { airsoft, manufacturer } from './interfaces';
import * as readline from 'readline-sync';

import express from "express";
import ejs from "ejs";

const app = express();

app.set("view engine", "ejs"); // EJS als view engine
app.set("port", 3000);




app.get('/',(req,res)=>{
    let q: string = req.query.q ? req.query.q.toString() : '';
        let filteredPersons: airsoft[] = data.filter((data) => {
        return data.name.toLowerCase().startsWith(q.toLowerCase());
    });
    

    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "name";
    const sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";
  
    let sortedPersons = [...data].sort((a, b) => {
        if (sortField === "name") {
            return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortField === "fps") {
            return sortDirection === "asc" ? a.fps - b.fps : b.fps - a.fps;
        } else {
            return 0;
        }
    });

    res.render("home", {
        data: sortedPersons,
        sortField: sortField,
        sortDirection: sortDirection
    });

  })

  
  app.listen(app.get('port'), ()=>console.log( '[server] http://localhost:' + app.get('port')));




