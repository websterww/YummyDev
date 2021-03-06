var mysql = require('mysql'),
    schema = require('../DB/dbSchema'),
    sql = require('sql'),
    util = require('../Utils/tool');

/**
 * TODO: handle pool disconnect or interrupt and reconnect
 * @type {*}
 */
exports.pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'yummyApp',
    password: 'mstr123',
    database: 'yummy'
});


function handleErr(err, conn) {

    console.error(err.stack || err);
    conn && conn.end();

    return;
};

/**
 * Run SQL
 * @param sqlStr
 * @param phArr
 * @param success
 * @param error
 * @param end
 */
exports.runSql = function () {

    var me = this,
        p = {};

    if (!util.validateParameters([
        {n: "sqlStr", t: String},
        {n: 'phArr', t: Array},
        {n: 'success', t: Function},
        {n: 'error', t: Function},
        {n: 'end', t: Function}
    ],
        arguments).apply(p)) {

        console.error("dbQuery.runSql() parameter has error");

        return;
    };


    me.pool.getConnection(function (err, conn) {

        if (err) {
            handleErr(err, conn);

        } else {

            conn.query(p.sqlStr, p.phArr, p.success)
                .on('error', p.error || function (err) {
                    /**
                     * TODO some database check fails here
                     */
                    handleErr(err, conn);

                })
                .on('end', p.end || function () {

                    conn.end();

                });
        }

    });

};


exports.getAllWhere = function () {

    var p = {},
        db = this;

    if (!util.validateParameters([
        {n: 'schema', t: sql.Table},
        {n: 'where', t: Object},
        {n: 'paramMap', t: Object},
        {n: "ignoreInput", t: Boolean}
    ], arguments).apply(p)) {

        console.error("Error when initialize " + p.schema._name + " dbQuery.getAllWhere()");

        return;
    };

    return function (req, res) {

        var parsedQuery = p.ignoreInput ? null : util.getQuery(req, p.paramMap),
            where = p.where ,
            sql = p.schema.select();

        if (!util.isEmpty(parsedQuery) || !util.isEmpty(where)) {

            parsedQuery = util.mergeCover(parsedQuery, where);

            sql = sql.where(parsedQuery);

        }

        sql = sql.toQuery();

        db.runSql(sql.text, !util.isEmpty(sql.values) && sql.values, function (err, rows, fields) {

            res.json(rows);

        });

    };

};


exports.deleteWhere = function () {

    var p = {},
        db = this;

    if (!util.validateParameters([
        {n: 'schema', t: sql.Table},
        {n: 'where', t: Object},
        {n: 'paramMap', t: Object}
    ], arguments).apply(p)) {

        console.error("Error when initialize " + p.schema._name + " dbQuery.deleteWhere()");

        return;
    };

    return function (req, res) {

        var parsedQuery = util.getQuery(req, p.paramMap),
            where = p.where ,
            sql = p.schema.delete();

        if (!util.isEmpty(parsedQuery) || !util.isEmpty(where)) {

            parsedQuery = util.mergeCover(parsedQuery, where);

            sql = sql.where(parsedQuery).toQuery();

            db.runSql(sql.text, sql.values, function (err, result) {
                res.json(result);
            });

        } else {
            res.json({"error": "Invalid input"});
        }

    };

};


exports.insert = function () {

    var p = {},
        db = this;

    if (!util.validateParameters([
        {n: 'schema', t: sql.Table}
    ], arguments).apply(p)) {

        console.error("Error when initialize " + p.schema._name + " dbQuery.insert()");

        return;
    };

    return function (req, res) {

        var parsedQuery = util.getQuery(req);

        /**
         * TODO should check if req.query is suitable for this schema
         * @type {*}
         */

        if (!util.isEmpty(parsedQuery)) {

            var sql = p.schema.insert(parsedQuery).toQuery();

            db.runSql(sql.text, sql.values, function (err, result) {
                res.json(result);
            });
        } else {
            res.json({"error": "Invalid input"});
        }

    };

};

exports.updateBy = function () {

    var p = {},
        db = this;

    if (!util.validateParameters([
        {n: 'schema', t: sql.Table},
        "idName",
        "idParam"
    ], arguments).apply(p)) {

        console.error("Error when initialize " + p.schema._name + " dbQuery.update()");

        return;
    };

    return function (req, res) {

        var parsedQuery = util.getQuery(req),
            filter = {};

        /**
         * TODO should check if req.query is suitable for this schema
         * @type {*}
         */

        filter[p.idName] = req.params[p.idParam];

        if (!util.isEmpty(parsedQuery)) {

            var sql = p.schema.update(parsedQuery).where(filter).toQuery();

            db.runSql(sql.text, sql.values, function (err, result) {
                res.json(result);
            });
        } else {
            res.json({"error": "Invalid input"});
        }

    };


};