var express = require('express')
  , http = require('http')
  , path = require('path')
  , routes = require('./routes')  /*DO NOT remove routes*/
  , fs = require('fs');

var app = express();

/**
 *  all environments
 */

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


/**
 * Route
 */

app.mapRouter = function(obj, routePath){
    
    routePath = routePath || '';
    
    for (var key in obj) {
        var ak = obj[key];

        switch (typeof ak) {

            case 'object':
                //children router
                app.mapRouter(ak, routePath + key);
                break;

            case 'string':
                if(/^\/\*/.test(key)){
                    key = "all";
                }

                //Handler
                if(/^routes\./.test(ak)){
                    app[key](routePath + (key == "all"? "/*": ""), eval(ak));

                } else{
                    //template view
                    var renderTemplate  = function(){
                        var templateName = ak;

                        return function(req, res){
                             res.render(templateName);
                        };
                    }

                    app[key](routePath + (key == "all"? "/*": ""), renderTemplate());
                 }

                break;
        }

    }
};

var routeJson = JSON.parse(fs.readFileSync(__dirname + '/routes/router.json'));
app.mapRouter(routeJson);


/**
 * Start server
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
