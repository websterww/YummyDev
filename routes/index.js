var schema = require("../DB/dbSchema"),
    db = require("../DB/dbQuery"),
    util = require("../Utils/tool");

/************Template route**************/
exports.validateLogin = function(req, res, next){

    if (req.body.remember) {
        req.session.cookie.maxAge = 3600; //1 hour
    } else {
        req.session.cookie.expires = false;
    }

    if(req.body.username){
        res.session.user_id = req.body.username;
        res.redirect(req.nextUrl);
    }

};

exports.needLogin = function(req, res, next){

    if (!req.session.user_id) {

        res.redirect("/yummy");

    } else {

        next();

    }

};

exports.logout = function(req, res, next){

    if (req.session.user_id) {
        delete req.session.user_id;
        res.redirect("/yummy");
    }

};


/************RESTful API***************/

exports.food = {

    list: db.getAllWhere(schema.Food, {"isAvailable": "use"}),

    update: db.updateBy(schema.Food, "idFood", "id"),

    add: db.insert(schema.Food),

    del: db.deleteWhere(schema.Menu, {"isAvailable": "use"}, {"id": "idFood"}),

    searchByVendorId: db.getAllWhere(schema.Food, {"isAvailable": "use"}, {"id": "VendorId"})

};

exports.menu = {

    list: function(req, res){

        var sql = schema.Menu.select().order("Date");

        db.runSql(sql.text, sql.values, function(result){
            res.json(result);
        });
    },

    listByDate: db.getAllWhere(schema.Menu, {}, {"date": "Date"}),

    /*
     *TODO: some field like 'status' cannot be changed alone.
     */
    update: db.updateBy(schema.Menu, "idMenu", "id"),

    bulkUpdate: db.updateBy(schema.Menu, "Date", "date"),

    del: db.deleteWhere(schema.Menu, {"status": "saved"}, {"id": "idMenu"}),

    bulkDel: db.deleteWhere(schema.Menu, {"status": "saved"}, {"date": "Date"}),

    bulkAdd: function(req, res){
        /**
         * Need Transaction here
         */

    }
};

exports.order = {

    list: function(req, res){

        var sql = schema.Order.select().order("Date");

        db.runSql(sql.text, sql.values, function(result){
            res.json(result);
        });
    },

    listByDate: db.getAllWhere(schema.Order, {}, {"date": "Date"}),

    listByUserNDate: db.getAllWhere(schema.Order, {}, {"date": "Date", "user": "UserId"}),

    listByUser: db.getAllWhere(schema.Order, {}, {"user": "UserId"})
};

exports.vendor = {

    list: db.getAllWhere(schema.Vendor),

    update: db.updateBy(schema.Vendor, "idVendor", "id"),

    add: db.insert(schema.Vendor),

    del: db.deleteWhere(schema.Vendor, {"id": "idVendor"})

};

exports.user = {

    list: db.getAllWhere(schema.User),

    update: db.updateBy(schema.User, "idUser", "id"),

    add: db.insert(schema.User),

    del: db.deleteWhere(schema.User, {"id": "idUser"})

};
