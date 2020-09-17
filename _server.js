// Codebase adapted from https://github.com/alex996/presentations/blob/master/express-session.md
// and based on youtube tutorial https://www.youtube.com/watch?v=OH6Z0dJ_Huk&list=FL553-LfOaFIPeOrDw8y9cSA&index=2&t=0s

// Code for server login based authenticated sessions in expressjs
const path            = require("path")
const express         = require("express")
const session         = require("express-session")
const MongoStore      = require('connect-mongo')(session)
const { MongoClient, ObjectID } = require('mongodb')
var mongoDbQueue = require('mongodb-queue')
const bodyparser = require("body-parser")
//Set up mongodb
const MONGO_URI = "mongodb+srv://test:test@boilerbot-db.sura6.gcp.mongodb.net/boilerbot_web?retryWrites=true&w=majority"//"mongodb://localhost:27017/"

// For env variables 
const { 
    PORT = 8080, 
    NODE_ENV = "development", 
    SESS_NAME='sid' 
} = process.env 

const app = express()
app.set('view engine', 'pug')
app.use(express.static("public"));
app.use(express.json()) //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true }))
app.use(bodyparser.json());

app.get("/", (req, res) => {
    res.render("root")
})

app.listen(PORT, () =>
    console.log(`Starting server on http://localhost:${PORT}...`)
)
