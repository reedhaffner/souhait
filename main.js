const express = require("express");
const cookieParser = require("cookie-parser");

var api = require("./router/api");
var auth = require("./functions/auth");
var db = require("./functions/db");
require("./functions/func");

const PORT = 8080;
const HOST = "0.0.0.0";

const app = express();

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Asd");
});

app.use("/api", api);
app.use("/user", auth.router);

app.listen(PORT, HOST);
console.log(`Souhait on http://${HOST}:${PORT}`);
