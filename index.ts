import data from "./assets/airsoft.json";
import arr from "./assets/Manufacturer.json";
import { airsoft, manufacturer } from './interfaces';
import * as readline from 'readline-sync';


let test;

for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < arr.length; j++) {
                test = {
                id: data[i].id,
                name: data[i].name,
                description: data[i].description,
                fps: data[i].fps,
                fullAuto: data[i].fullAuto,
                releasedate: data[i].releasedate,
                imageURL: data[i].imageURL,
                type: data[i].type,
                hobbies: data[i].hobbies,
                manufacturer: arr[data[i].manufacturer]
            };
                 
    }
    console.log(test);
}


console.log("Welcome to the JSON data viewer!");
console.log(`1. View all data`); 
console.log(`2. Filter by ID`); 
console.log(`3. Exit`); 
let choose = readline.question("Welcome to the JSON data viewer!");

    




