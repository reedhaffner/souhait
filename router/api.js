var express = require("express");
var router = express.Router();
var path = require("path");
var apidoc = require("apidoc");

var db = require("../functions/db");
var func = require("../functions/func");

const doc = apidoc.createDoc({
    src: path.resolve(__dirname, ""),
    dest: path.resolve(__dirname, "/../pages/api/"),
});

router.use("/", express.static(path.resolve(__dirname, "/../pages/api/")));

router.get("/lists/", (req, res) => {
    /**
     * @api {get} /lists/ Request list of lists
     * @apiName GetLists
     * @apiGroup Lists
     *
     * @apiSuccess {Object[]} N/A  List of lists.
     */
    res.status(200).send(db.keys());
});
router.post("/lists/", (req, res) => {
    /**
     * @api {post} /lists/ Create new list
     * @apiName PostLists
     * @apiGroup Lists
     *
     * @apiParam {String} title  List title
     *
     * @apiError (Error 409) {String} N/A  The list already exists.
     * @apiSuccess {String} title  Cleansed list title
     */
    try {
        var cleansed = func.cleanse_list_name(req.body.title);
        if (db.has(cleansed)) {
            res.status(409).send("ListExists").end();
        } else {
            db.put(cleansed, {
                title: req.body.title,
                items: [],
            });
            res.status(200).send(cleansed).end();
        }
    } catch (error) {
        console.log(error);
        res.end();
    }
});
router.put("/lists/:listTitle", (req, res) => {
    /**
     * @api {put} /lists/:listTitle Edits list title
     * @apiName PutLists
     * @apiGroup Lists
     *
     * @apiParam {String} :listTitle  Current list title
     * @apiParam {String} title  New list title
     *
     * @apiError (Error 400) {String} N/A  The list does not exist.
     * @apiSuccess {String} title  Editied list title
     */
    try {
        var cleansed = func.cleanse_list_name(req.params.listTitle);
        if (db.has(cleansed)) {
            db.put(cleansed, {
                title: req.body.title,
                items: db.get(cleansed).items,
            });
            res.status(200).send(cleansed).end();
        } else {
            res.status(400).send("List does not exist.").end();
        }
    } catch (error) {
        res.end(error);
    }
});
router.delete("/lists/:listTitle", (req, res) => {
    /**
     * @api {delete} /lists/:listTitle Deletes list
     * @apiName DeleteLists
     * @apiGroup Lists
     *
     * @apiParam {String} :listTitle  List title to delete
     *
     * @apiError (Error 400) {String} N/A  The list does not exist.
     * @apiSuccess {String} N/A  Deleted list
     */
    try {
        var cleansed = func.cleanse_list_name(req.params.listTitle);
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
router.get("/lists/:listTitle", (req, res) => {
    /**
     * @api {get} /lists/:listTitle Request list items
     * @apiName GetList
     * @apiGroup List
     *
     * @apiParam {String} :listTitle  List to pull
     *
     * @apiSuccess {Object[]} N/A  List items
     */
    res.status(200).send(db.get(req.params.listTitle));
});
router.post("/lists/:listTitle", (req, res) => {
    /**
     * @api {post} /lists/:listTitle Creates a list item
     * @apiName PostList
     * @apiGroup List
     *
     * @apiParam {String} :listTitle  List to add to
     * @apiParam {String} title  Title of item to add
     * @apiParam {String} url  URL of item to add
     *
     * @apiError (Error 400) {String} N/A  URL is not valid.
     * @apiSuccess {String} itemid  Item ID
     */
    try {
        if (!func.validURL(req.body.url)) {
            res.status(400).send("URL is not valid.").next();
        }
        var cleansed = func.cleanse_list_name(req.params.listTitle);
        var list = db.get(cleansed);
        var itemId = list.items.length;
        list.items.push({
            title: req.body.title,
            url: req.body.url,
        });
        db.put(cleansed, list);
        res.status(200).send(String(itemId)).end();
    } catch (error) {
        res.end(error);
    }
});
router.put("/lists/:listTitle/:itemId", (req, res) => {
    /**
     * @api {post} /lists/:listTitle/:itemId Edits a list item
     * @apiName PutList
     * @apiGroup List
     *
     * @apiParam {String} :listTitle  List to edit
     * @apiParam {String} :itemId  List item to edit
     * @apiParam {String} title  Title of item to edit
     * @apiParam {String} url  URL of item to edit
     *
     * @apiError (Error 400) {String} N/A  URL is not valid.
     * @apiSuccess {String} N/A  Item successfully edited.
     */
    try {
        if (!func.validURL(req.body.url)) {
            res.status(400).send("URL is not valid.").next();
        }
        var cleansed = func.cleanse_list_name(req.params.listTitle);
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
router.delete("/lists/:listTitle/:itemId", (req, res) => {
    /**
     * @api {post} /lists/:listTitle/:itemId Delete a list item
     * @apiName DeleteList
     * @apiGroup List
     *
     * @apiParam {String} :listTitle  List to edit
     * @apiParam {String} :itemId  Item to delete
     *
     * @apiSuccess {String} N/A  Item successfully deleted.
     */
    try {
        var cleansed = func.cleanse_list_name(req.params.listTitle);
        var list = db.get(cleansed);
        list.items.splice([req.params.itemId], 1);
        db.put(cleansed, list);
        res.status(200).send("Item successfully deleted.").end();
    } catch (error) {
        res.end(error);
    }
});

module.exports = router;
