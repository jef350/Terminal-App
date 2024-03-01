import { text } from "stream/consumers";
import data from "./assets/airsoft.json";
import arr from "./assets/Manufacturer.json";
import { airsoft, manufacturer } from './interfaces';
import * as readline from 'readline-sync';





console.log("Welcome to the JSON data viewer!");
console.log(`1. View all data`); 
console.log(`2. Filter by ID`); 
console.log(`3. Exit`); 
let choice = readline.questionInt("please enter your choice: ");

let test ;


switch (choice) {
    case 1:

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
        break;
    case 2:
        let numberid = readline.questionInt("geef het id waarbij je wilt filteren: ");
        numberid -= 1;
        if (numberid > 12) {
           console.log("er zijn maar 12 producten!") 
        }else{
            test =  {
                id: data[numberid].id,
                name: data[numberid].name,
                description: data[numberid].description,
                fps: data[numberid].fps,
                fullAuto: data[numberid].fullAuto,
                releasedate: data[numberid].releasedate,
                imageURL: data[numberid].imageURL,
                type: data[numberid].type,
                hobbies: data[numberid].hobbies,
                manufacturer: arr[data[numberid].manufacturer]
            
        }
        console.log(test);
    }

        break;
        case 3:
            console.clear;
            break;

    default:
        console.log('dit moet een nummer zijn!')
        break;
}

    




