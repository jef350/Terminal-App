import express from "express";
import { connect, getairsoftdata, getmanufacturerdata, getAirsoftById, updateItem, sortairsoftdata, login } from "../database";
import { secureMiddleware } from "../secureMiddleware";


export function homeRouter() {
    const router = express.Router();

    router.get('/', secureMiddleware, async (req, res) => {
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

    return router;
}