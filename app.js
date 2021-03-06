var express = require('express');
var path = require('path');
var consolidate = require('consolidate');

var isDev = process.env.NODE_ENV !== 'production';
var app = express();
var port = 3000;

app.engine('html', consolidate.ejs);
app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, './src/server/views'));

// local variables for all views
app.locals.env = process.env.NODE_ENV || 'dev';
app.locals.reload = true;

if (isDev) {

    var path = require('path');
    var chokidar = require('chokidar');
    var DtsCreator = require('typed-css-modules');

    chokidar.watch('src', {persistent: true}).on('all', (event, file) => {
        
        if (path.extname(file) == '.css') {
            let creator = new DtsCreator();
            creator.create(file).then(content => {
                // console.log(content.tokens);          // ['myClass']
                // console.log(content.formatted);       // 'export const myClass: string;'
                content.writeFile();                  // writes this content to "src/style.css.d.ts"
                console.log(file + '.d.ts  ' + 'updated!')
         });
        }
    });

    // static assets served by webpack-dev-middleware & webpack-hot-middleware for development
    var webpack = require('webpack');
    var webpackDevMiddleware = require('webpack-dev-middleware');
    var webpackHotMiddleware = require('webpack-hot-middleware');
    // var webpackDevConfig = require('./webpack.config.js');
    // var compiler = webpack(webpackDevConfig);

    var webpackDevConfig = require('./webpack-commonjs.config.js');
    var compiler = webpack(webpackDevConfig);


    // attach to the compiler & the server
    app.use(webpackDevMiddleware(compiler, {

        // public path should be the same with webpack config
        publicPath: webpackDevConfig.output.publicPath,
        noInfo: false,
        stats: {
            colors: true
        }
    }));
    app.use(webpackHotMiddleware(compiler));
    app.use(express.static(path.join(__dirname, './')));

    require('./build/server/routes')(app);

    // add "reload" to express, see: https://www.npmjs.com/package/reload
    var reload = require('reload');
    var http = require('http');

    var server = http.createServer(app);
    reload(server, app);

    server.listen(port, function () {
        console.log('App (dev) is now running on port 3000!');
    });



} else {

    // static assets served by express.static() for production
    app.use(express.static(path.join(__dirname, './')));
    //require('./server/routes')(app);
    app.listen(port, function () {
        console.log('App (production) is now running on port 3000!');
    });
}
