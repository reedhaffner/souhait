const crypto = require("crypto");
const flatfile = require("flat-file-db");
const express = require("express");
var router = express.Router();

var db = flatfile("/data/auth.db");

var authenticatedUsers = [];

function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("base64");
}

function authToken() {
    return crypto.randomBytes(32).toString("hex");
}

function registerUser(username, password) {
    if (db.has(username)) {
        return false;
    } else {
        db.put(username, password);
        return true;
    }
}

function loginUser(username, password) {
    if (db.has(username)) {
        if (password == db.get(username)) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function requireAuth(req, res, next) {
    if (authenticatedUsers[req.cookies.AuthToken]) {
        req.user = authenticatedUsers[req.cookies.AuthToken];
        next();
    } else {
        res.redirect("/user/login?redirect=" + req.path);
    }
}

router.post("/login", (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var hashed = hashPassword(password);

    if (loginUser(username, hashed)) {
        var auth = authToken();
        authenticatedUsers[auth] = username;
        res.cookie("AuthToken", auth);
        res.send("authenticated");
    } else {
        res.send("invalid").end();
    }
});

router.get("/logout", requireAuth, (req, res) => {
    if (authenticatedUsers[req.cookies.AuthToken]) {
        delete authenticatedUsers[req.cookies.AuthToken];
        res.send("logged out");
    }
});

router.post("/register", (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var hashed = hashPassword(password);

    if (db.has(username)) {
        res.send("userExists").end();
    } else {
        registerUser(username, hashed);
        res.send("userCreated").end();
    }
});

router.get("/login", (req, res) => {
    res.render("login");
});

module.exports = { router, requireAuth, authenticatedUsers };
