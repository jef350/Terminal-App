import { ObjectId } from "mongodb";

export interface User {
    _id?: ObjectId;
    email: string;
    password?: string;
    role: "ADMIN" | "USER";
}

export interface FlashMessage {
    type: "error" | "success";
    message: string;
  }

export interface airsoft {
    id: number;
    name: string;
    description: string;
    price: number;
    fullauto: boolean; 
    releasedate: string;
    imageURL: string;
    type: string;
    playtypes: string[];
    manufacturer: number;
}

export interface manufacturer{
    id: number,
    name: string,
    country: string,
    website: string
}