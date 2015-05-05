var express = require('express');
var router = express.Router();
var request = require('request');
var uuid = require('uuid');
var cheerio = require('cheerio');
var async = require('async');
var path = require('path');
var fs = require('fs');


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/downloads', function(req, res, next) {


    request(req.body.url, function (error, response, body) {
        console.log(error);
        if (!error && response.statusCode == 200) {
            // console.log(body); // Show the HTML for the Google homepage.
            var $ = parseHTML(body);  // jquery, parseHTML Parses a string into an array of DOM nodes.


            var images = [];
            $('img').each(function () {
                images.push({
                    src: $(this).attr('src'),
                    //uuid: uuid.v4()
                });
            });


            var fns = images.map(function(elem){
                return saveImage.bind(null, elem);
            });

            async.parallelLimit(fns, 5, function(error, result) {
                if (result) {
                    console.log(result);
                    res.status(200).json({message: 'OK', files: result});  // sending results of AJAX call to the browser
                }

                else {
                    console.log(error);
                    res.status(500).json({message : 'Could not download images'});
                }
            });

        }
    });


    function saveImage(item, callback){
        try {
            var displayFilename =  uuid.v4() + path.extname(item.src);   // gets only image file name
            var filename = __dirname + '/../public/images/' + displayFilename;
            console.log(filename);
            var x = request(item.src);
            x.on('end', function(){
                callback(null, displayFilename);
            });
            x.pipe(fs.createWriteStream(filename));
            console.log('After');

        }catch(e) {
            console.log(e);
            callback("element creation error", false);
        }
    }

});

function parseHTML(str) {
    return cheerio.load(str);
}

module.exports = router;

