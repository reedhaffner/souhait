const express = require("express");
const cookieParser = require("cookie-parser");
var exphbs = require("express-handlebars");
const path = require("path");

var api = require("./router/api");
var me = require("./router/frontend");
var auth = require("./functions/auth");
var db = require("./functions/db");
require("./functions/func");

const PORT = 8080;
const HOST = "0.0.0.0";

const app = express();

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine(
    "hbs",
    exphbs({
        extname: ".hbs",
    })
);

app.set("view engine", "hbs");

app.use("/api", api);
app.use("/user", auth.router);
app.use("/", me);
app.use(express.static("static"));

app.listen(PORT, HOST);
console.log(`Souhait on http://${HOST}:${PORT}`);
