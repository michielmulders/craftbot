var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Craftball = require('./models/craftball');

var app = express();
var port = process.env.PORT || 8080;
mongoose.connect("mongodb://admin:craftball@ds111791.mlab.com:11791/craftbot");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(port, function(){
    console.log('Listening on port ' + port);
});


/*
     Get: Return 'Hello world!' to test if app is working
*/
app.get('/', function(req, res){
    res.status(200).send('Hello world!');
});


/*
     Get: Return list with all scores
*/
app.post('/craftball', function(req, res, next) {
    Craftball
        .find({}, function(err, result) {
            let message = "";
            for (var i = 0, len = result.length; i < len; i++) {
                message += "Score of " + result[i].score + " on " + result[i].date + "\n";
            }

            // Create Payload 
            const botPayload = {
                "text": message
            };

            // To avoid loop and send response back
            var userName = req.body.user_name;
            if(userName !== 'slackbot') {
                return res.status(200).json(botPayload);
            } else {
                return res.status(200).end();
            }
        });
});


/*
     Post score: add new score to MongoDB
*/
app.post('/addScoreOriginal', function(req, res, next) {
    // Check if input is number
    let score = req.body.text.trim();
    if(isNaN(score)) { // Returns true if it is not a number
        return res.status(500).json({
            title: "Not a number",
            error: "Try again with a number like 25"
        });
    }

    // Create craftball object with score and datestamp
    const craftball = new Craftball({
        score: score,
        date: getDate() 
    });
    
    // Send craftball score to MongoDB
    craftball.save(function(err, result) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        res.status(201).json({
            message: 'Craftscore added',
            obj: result
        });
    });

    // Create funny remark about how high score is 
    const remarkAboutScore = (craftball.score >= 28)
            ? 'Well played bitches!'
            : 'What a shitty score...';

    // Create Payload 
    const botPayload = {
        "response_type": "in_channel",
        "text": "A Craftball score of " + craftball.score + " was added!",
        "attachments": [
            {
                "text": remarkAboutScore
            }
        ]
    };

    // To avoid loop and send response
    var userName = req.body.user_name;
    if(userName !== 'slackbot') {
        return res.status(200).json(botPayload);
    } else {
        return res.status(200).end();
    }
});

/*
     Post score: add new score to MongoDB
*/
app.post('/addScore', function(req, res, next) {
    // Check if input is number
    let score = req.body.text.trim();
    if(isNaN(score)) { // Returns true if it is not a number
        return res.status(500).json({
            title: "Not a number",
            error: "Try again with a number like 25"
        });
    }

    // Create craftball object with score and datestamp
    const craftball = new Craftball({
        score: score,
        date: getDate() 
    });
    
    // Send craftball score to MongoDB
    craftball.save(function(err, result) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        
        // Create funny remark about how high score is 
        const remarkAboutScore = (craftball.score >= 28)
                ? 'Well played bitches!'
                : 'What a shitty score...';

        // Create Payload 
        const botPayload = {
            "response_type": "in_channel",
            "text": "A Craftball score of " + craftball.score + " was added!",
            "attachments": [
                {
                    "text": remarkAboutScore
                }
            ]
        };

        // To avoid loop and send response
        var userName = req.body.user_name;
        if(userName !== 'slackbot') {
            return res.status(200).json(botPayload);
        } else {
            return res.status(200).end();
        }
    });
});


/*
     Get: Return highscore for Craftball
*/
app.post('/getHighscore', function(req, res, next) {
    Craftball
        .find({})
        .limit(1)
        .sort({ score: -1 })
        .exec(function(err, result) {
            // Create Payload 
            const botPayload = {
                "response_type": "in_channel",
                "text": "Highscore for Craftball is " + result[0].score + "!"
            };

            // To avoid loop and send response back
            var userName = req.body.user_name;
            if(userName !== 'slackbot') {
                return res.status(200).json(botPayload);
            } else {
                return res.status(200).end();
            }
        });
});


/*
     Get: Return actual Date in format dd/mm/yyyy
*/
function getDate() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    return dd+'/'+mm+'/'+yyyy;
}

