import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connect, getairsoftdata, getmanufacturerdata, getAirsoftById, updateItem, sortairsoftdata } from "./database";
import { airsoft, manufacturer } from './interfaces';
import bcrypt from 'bcrypt';

dotenv.config();

import express from "express";


const app = express();
app.use(session);
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("port", process.env.PORT);

app.get("/", async (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const email: string = req.body.email;
    const password: string = req.body.password;
    try {
        let user: User = await login(email, password);
        delete user.password;
        req.session.user = user;
        res.redirect("/home");
    } catch (e: any) {
        res.redirect("/login");
    }
});


app.get('/home', secureMiddleware, async (req, res) => {
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

app.get("/product/:id/update", async (req, res) => {
    const data = await getairsoftdata();
    let id: number = parseInt(req.params.id);
    let product = data.find((item) => item.id === id);
    let item: airsoft | null = await getAirsoftById(id);
    res.render("update", {
        product: product
    });
});

app.post("/product/:id/update", async (req, res) => {
    const data = await getairsoftdata();
    let id: number = parseInt(req.params.id);
    let item: airsoft = req.body;
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

app.listen(process.env.PORT, async () => {
    await connect();
    const saltRounds : number = 10;
    let hashedPassword : string = await bcrypt.hash("hunter2", saltRounds);
    console.log(hashedPassword)
    console.log(process.env.MONGO_URI);
});

app.use((req, res) => {
    res.status(404);
    res.render("404");
});
