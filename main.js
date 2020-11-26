const express = require("express");
const flatfile = require("flat-file-db");

var db = flatfile("/data/wishlist.db");

const PORT = 8080;
const HOST = "0.0.0.0";

const app = express();

function cleanse_list_name(list) {
    return list.toLowerCase().split(" ").join("_").replace(/\W/g, "");
}
function validURL(str) {
    var pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
            "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
            "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
            "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
            "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
            "(\\#[-a-z\\d_]*)?$",
        "i"
    ); // fragment locator
    return !!pattern.test(str);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send(db.keys());
});

// Manipulation of Lists
app.get("/api/lists/", (req, res) => {
    res.status(200).send(db.keys());
});
app.post("/api/lists/", (req, res) => {
    try {
        var cleansed = cleanse_list_name(req.body.title);
        if (db.has(cleansed)) {
            res.status(409).send("List already exists.").end();
        } else {
            db.put(cleansed, {
                title: req.body.title,
                items: [],
            });
            res.status(200).send("List created.").end();
        }
    } catch (error) {
        res.end(error);
    }
});
app.put("/api/lists/:listTitle", (req, res) => {
    try {
        var cleansed = cleanse_list_name(req.params.listTitle);
        if (db.has(cleansed)) {
            db.put(cleansed, {
                title: req.body.title,
                items: db.get(cleansed).items,
            });
            res.status(200).send("List edited.").end();
        } else {
            res.status(400).send("List does not exist.").end();
        }
    } catch (error) {
        res.end(error);
    }
});
app.delete("/api/lists/:listTitle", (req, res) => {
    try {
        var cleansed = cleanse_list_name(req.params.listTitle);
        if (db.has(cleansed)) {
            db.del(cleansed);
            res.status(200).send("List successfully deleted.").end();
        } else {
            res.status(400).send("List does not exist.").end();
        }
    } catch (error) {
        res.end(error);
    }
});

// Manipulation of Items in Lists
app.get("/api/lists/:listTitle", (req, res) => {
    res.status(200).send(db.get(req.params.listTitle));
});
app.post("/api/lists/:listTitle", (req, res) => {
    try {
        if (!validURL(req.body.url)) {
            res.status(400).send("URL is not valid.").next();
        }
        var cleansed = cleanse_list_name(req.params.listTitle);
        var list = db.get(cleansed);
        list.items.push({
            title: req.body.title,
            url: req.body.url,
        });
        db.put(cleansed, list);
        res.status(200).send("Item successfully added.").end();
    } catch (error) {
        res.end(error);
    }
});
app.put("/api/lists/:listTitle/:itemId", (req, res) => {
    try {
        if (!validURL(req.body.url)) {
            res.status(400).send("URL is not valid.").next();
        }
        var cleansed = cleanse_list_name(req.params.listTitle);
        var list = db.get(cleansed);
        list.items[req.params.itemId] = {
            title: req.body.title,
            url: req.body.url,
        };
        db.put(cleansed, list);
        res.status(200).send("Item successfully edited.").end();
    } catch (error) {
        res.end(error);
    }
});
app.delete("/api/lists/:listTitle/:itemId", (req, res) => {
    try {
        var cleansed = cleanse_list_name(req.params.listTitle);
        var list = db.get(cleansed);
        list.items.splice([req.params.itemId], 1);
        db.put(cleansed, list);
        res.status(200).send("Item successfully deleted.").end();
    } catch (error) {
        res.end(error);
    }
});

app.listen(PORT, HOST);
console.log(`Souhait on http://${HOST}:${PORT}`);
