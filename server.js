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
const MONGO_URI = "mongodb+srv://test:test@boilerbot-db.sura6.gcp.mongodb.net/boilerbot_web?retryWrites=true&w=majority"

const client = new MongoClient(MONGO_URI, 
{ 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})

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

app.use(
  // Creates a session middleware with given options.
    session({
        store: new MongoStore({
            url: "mongodb+srv://test:test@boilerbot-db.sura6.gcp.mongodb.net/boilerbot_web?retryWrites=true&w=majority",
            collection: "sessions_test"
        }),

        // Name for the session ID cookie. Defaults to 'connect.sid'.
        name: SESS_NAME,

        // Whether to force-save unitialized (new, but not modified) sessions
        // to the store. Defaults to true (deprecated). For login sessions, it
        // makes no sense to save empty sessions for unauthenticated requests,
        // because they are not associated with any valuable data yet, and would
        // waste storage. We'll only save the new session once the user logs in.
        saveUninitialized: false,

        // Whether to force-save the session back to the store, even if it wasn't
        // modified during the request. Default is true (deprecated). We don't
        // need to write to the store if the session didn't change.
        resave: false,

        // Whether to force-set a session ID cookie on every response. Default is
        // false. Enable this if you want to extend session lifetime while the user
        // is still browsing the site. Beware that the module doesn't have an absolute
        // timeout option (see https://github.com/expressjs/session/issues/557), so
        // you'd need to handle indefinite sessions manually.
        // rolling: false,

        // Secret key to sign the session ID. The signature is used
        // to validate the cookie against any tampering client-side.
        secret: `scretkey that doesnt 123123 make too much of a difference apparently`,

        // Settings object for the session ID cookie. The cookie holds a
        // session ID ref in the form of 's:{SESSION_ID}.{SIGNATURE}' for example:
        // s%3A9vKnWqiZvuvVsIV1zmzJQeYUgINqXYeS.nK3p01vyu3Zw52x857ljClBrSBpQcc7OoDrpateKp%2Bc

        // It is signed and URL encoded, but NOT encrypted, because session ID is
        // merely a random string that serves as a reference to the session. Even
        // if encrypted, it still maintains a 1:1 relationship with the session.
        // OWASP: cookies only need to be encrypted if they contain valuable data.
        // See https://github.com/expressjs/session/issues/468

        cookie: {
            // Path attribute in Set-Cookie header. Defaults to the root path '/'.
            // path: '/',

            // Domain attribute in Set-Cookie header. There's no default, and
            // most browsers will only apply the cookie to the current domain.
            // domain: null,

            // HttpOnly flag in Set-Cookie header. Specifies whether the cookie can
            // only be read server-side, and not by JavaScript. Defaults to true.
            // httpOnly: true,

            // Expires attribute in Set-Cookie header. Set with a Date object, though
            // usually maxAge is used instead. There's no default, and the browsers will
            // treat it as a session cookie (and delete it when the window is closed).
            // expires: new Date(...)

            // Preferred way to set Expires attribute. Time in milliseconds until
            // the expiry. There's no default, so the cookie is non-persistent.
            maxAge: 1000 * 60 * 60 * 2, // 2 hours

            // SameSite attribute in Set-Cookie header. Controls how cookies are sent
            // with cross-site requests. Used to mitigate CSRF. Possible values are
            // 'strict' (or true), 'lax', and false (to NOT set SameSite attribute).
            // It only works in newer browsers, so CSRF prevention is still a concern.
            sameSite: true,

            // Secure attribute in Set-Cookie header. Whether the cookie can ONLY be
            // sent over HTTPS. Can be set to true, false, or 'auto'. Default is false.
            // secure: process.env.NODE_ENV === "production", // ERROR WITH COOKIE SAVING
        },
  })
)


const redirectLogin = (req, res, next) => {
    if (!req.session.userID){
        return res.redirect("/login?err=" + encodeURIComponent('error logging in. please try again'))
    }
    else {
        next()
    }
}

const redirectHome = (req, res, next) => {
    if (req.session.userID){
        return res.redirect("/home")
    }
    else {
        next()
    }
}

app.set('views','./views');
// * To get the main page
app.get("/", (req, res) => {
    // A new uninitialized session is created for each request (but not
    // persisted to the store if saveUninitialized is false). It's
    // automatically serialized to JSON and can look something like
    /*
    Session {
        cookie: {
        path: '/',
        _expires: 2018-11-18T01:33:01.043Z,
        originalMaxAge: 7200000,
        httpOnly: true,
        sameSite: true,
        secure: false
        }
    }
    */

    // Beware that express-session only updates req.session on req.end(),
    // so the values below are stale and will change after you read them
    // (assuming that you roll sessions with resave and rolling).
    // console.log("Cookie expires " + req.session.cookie.expires) // date of expiry
    // console.log("Cookie maxage " + req.session.cookie.maxAge) // milliseconds left until expiry

    // Unless a valid session ID cookie is sent with the request,
    // the session ID below will be different for each request.
    // console.log("Session.id " + req.session.id) // ex: VdXZfzlLRNOU4AegYhNdJhSEquIdnvE-

    // Same as above. Alphanumeric ID that gets written to the cookie.
    // It's also the SESSION_ID portion in 's:{SESSION_ID}.{SIGNATURE}'.
    // console.log("Sessionid " + req.sessionID)

    const { userID } = req.session

    if (userID){
        // Send homepage if user was logged in: session has the user id saved
        res.redirect("/home")
    }
    else {
        res.render("root")
    }
})

// * To get the login page html
app.get("/login", redirectHome, (req, res) => {
    // Unless we explicitly write to the session (and resave is false), the
    // store is never updated, even though a new session is generated on each
    // request. After we modify that session and during req.end(), it gets
    // persisted. On subsequent writes, it's updated and synced with the store.
    // req.session.userId = 1
    // res.sendFile('login.html', {
    //     root: path.join(__dirname, './views/')
    // })
    res.render("login", {err:req.query.err})
})


// * Corresponing post route for login
app.post("/login", redirectHome, (req, res) => {
    const { email, password } = req.body
    let user = null;
    if (email && password){
        db.findOne({email: email}, (err, user) => {
            if (user){
                bcrypt.compare(password, user.password, function(err, result) {
                    if (result == true){
                        req.session.userID = user.id
                        return res.redirect("/home")
                    }
                    else {
                        return res.redirect("/login?err=" + encodeURIComponent('incorrect username or password'));
                    }
                });
            } else{
                return res.redirect("/login?err=" + encodeURIComponent('incorrect username or password'));   
            }
        })
    }
    else {
        return res.redirect("/login?err=" + encodeURIComponent('fields were left blank'));
    }
})


// * To get the register html
app.get("/register", redirectHome, (req, res) => {
    res.render("register", {err:req.query.err})
})

// for 10^6 possible id's
const MAX_NUM_ACCOUNTS = Math.pow(10, 6)
function random_nozero(){
    return Math.floor(Math.random() * MAX_NUM_ACCOUNTS) + 1
}

// Get random ID that is not currently in the database
async function getRandomID(){
    var rand = random_nozero()

    while ((await db.findOne({id: rand})) != null ){
        console.log("Duplicate found. Finding another ID")
        rand = random_nozero()
    }
    return rand
}

const bcrypt = require('bcrypt');
const saltRounds = 10;

// * Corresponing post route for register
app.post("/register", redirectHome, (req, res) => {
    const { name, email, password, confirm_password, location, office_key } = req.body

    db.findOne({email: email}, (err, user) => {
        if (!user){
            if (office_key != '12345'){
                return res.redirect("/register?err=" + encodeURIComponent('incorrect office key')); 
            }
            if (password != confirm_password){
                return res.redirect("/register?err=" + encodeURIComponent('passwords do not match'));  
            }
            getRandomID().then( rand=>{
                bcrypt.hash(password, saltRounds, function(err, hash){
                    const user_ = {
                        id: rand,
                        name: name,
                        email: email,
                        password: hash,
                        location: {x:location.slice(0, 2), y:location.slice(3, 5)}
                    }

                    db.insertOne(user_);
                    req.session.userID = user_.id
                    return res.redirect("/home")
                })
            }).catch((err) => {return res.redirect("/register")});
        }
        else {
            res.redirect("/register?err=" + encodeURIComponent('user with that email-id already exists')); 
        }
    }) 
})


// * Homepage after login
app.get("/home", redirectLogin, (req, res) => {
    db.findOne({id: req.session.userID}, (err, user) => {
        res.render("home", {user:user, err:req.query.add_queue_err})
    })
})


// * To send command to logout
app.post("/logout", redirectLogin, (req, res) => {

  // Upon logout, we can destroy the session and unset req.session.
  req.session.destroy((err) => {
    // We can also clear out the cookie here. But even if we don't, the
    // session is already destroyed at this point, so either way, the
    // user won't be able to authenticate with that same cookie again.
    if (err){
        return res.redirect("/home")
    }

    res.clearCookie(SESS_NAME)
    return res.redirect("/")
  })
})

app.post("/add_queue", redirectLogin, (req, res) => {
    const {_source, destination, purpose} = req.body;
    const source = JSON.parse(_source);

    db.findOne({email: destination}, (err, user) => {
        if (!user){
            return res.redirect("/home?add_queue_err=" + encodeURIComponent("Destination not found"))
        }
        if (user.id != source.id){
            if (purpose.length > 25){
                return res.redirect("/home?add_queue_err=" + encodeURIComponent("Purpose must be shorter than 25 chars"))
            }
            const payload = {
                from: source,
                to: user,
                inserted_at: Date.now(),
                purpose: purpose,
            }

            queue.add(payload, (err, id) => {   })
            return res.redirect("/home?add_queue_err=" + encodeURIComponent("Success!"))
        }
        else {
            return res.redirect("/home?add_queue_err=" + encodeURIComponent("Cant add yourself!"))
        }
    })
})


app.get("/update_queue_deets", redirectLogin, (req, res) => {
    queue_db.find({}, (err, obs) => {
        obs.toArray((err, docs) => {
            out = []
            for (i in docs){
                if (docs[i].payload.from.id == parseInt(req.session.userID)){
                    out.push({pos: i, document:docs[i], type:"outgoing"})
                }
                else if (docs[i].payload.to.id == parseInt(req.session.userID)){
                    out.push({pos: i, document:docs[i], type:"incoming"})
                }
            }
            res.send(out)
        })
    })
})

app.post("/remove_from_queue", redirectLogin, (req, res) => {
    const { id } = req.body;
    queue_db.find({}, (err, obs) => {
        obs.toArray((err, docs) => {
            currDelivery = docs[0];
            if (currDelivery._id == id){
                return res.redirect("/home?add_queue_err=" + encodeURIComponent("cannot delete. this is current delivery..."));
            }
            else {
                db.findOne({id: req.session.userID}, (err, user) => { // why are we doing this???
                    console.log("deleting...")
                    queue_db.deleteOne({_id:ObjectID(id)}, (res_) => {
                        return res.redirect("/home?add_queue_err=" + encodeURIComponent("Removed Successfully!"))
                    })
                })
            }  
        })    
    })
})

app.get("/get_users", redirectLogin, (req, res) => {
    db.find({}, (err, obs) => {
        obs.toArray((err, docs) => {
            docs.sort((a, b) => a.name.localeCompare(b.name))
            out = []
            for (i in docs){
                if (docs[i].id != req.session.userID){
                    out.push({name: docs[i].name, email: docs[i].email})
                }
            }

            res.send(out)
        })
    })
})

var unlock_bot = false; // Should the bot be unlocked?
var currDelivery = null;

function updateCurrDelivery(){
    queue_db.find({}, (err, obs) => {
        obs.toArray((err, docs) => {
            if (docs.length > 0) {
                currDelivery = docs[0];
            }
        })
    })
}

app.post("/unlock", redirectLogin, (req, res) => {
    const { id } = req.body;

    queue_db.find({}, (err, obs) => {
        obs.toArray((err, docs) => {
            currDelivery = docs[0];
            if (currDelivery._id == id){
                db.findOne({id: req.session.userID}, (err, user) => { // why are we doing this???
                    if ((req.session.userID == currDelivery.payload.from.id)){
                        if (!delivery_in_progress) {    
                            console.log("setting unlock...")
                            unlock_bot = true;
                            return res.redirect("/home?add_queue_err=" + encodeURIComponent("unlocking..."))
                        }
                        else {
                            return res.redirect("/home?add_queue_err=" + encodeURIComponent("cannot unlock. delivery already in progress..."))
                        }
                    }
                    else { // ur the reciever
                        if (delivery_in_progress && reached_destination) {    
                            console.log("setting unlock...")
                            unlock_bot = true;
                            return res.redirect("/home?add_queue_err=" + encodeURIComponent("unlocking..."))
                        }
                        else {
                            return res.redirect("/home?add_queue_err=" + encodeURIComponent("cannot unlock. delivery still in progress..."))
                        }
                    }
                })
            }
            else {
                return res.redirect("/home?add_queue_err=" + encodeURIComponent("cannot unlock. wrong delivery selected..."))
            }
        })
    })
})

// When set, the bot will start delivery, and turn it off at the end
var delivery_in_progress = false;
var reached_destination = false; // set when reached dest

app.post("/start_delivery", redirectLogin, (req, res) => {
    const { id } = req.body;
    
    queue_db.find({}, (err, obs) => {
        obs.toArray((err, docs) => {
            currDelivery = docs[0]; // get current delivery
            if (currDelivery._id == id){ // if current delivery is the one that user requested, then ... 
                db.findOne({id: req.session.userID}, (err, user) => {
                    if (currDelivery.payload.from.id == req.session.userID){
                        if (!delivery_in_progress) {
                            console.log("starting delivery...")
                            delivery_in_progress = true;
                            reached_destination = false;
                            return res.redirect("/home?add_queue_err=" + encodeURIComponent("starting delivery..."))
                        }
                        else {
                            return res.redirect("/home?add_queue_err=" + encodeURIComponent("delivery already in progress..."))
                        }
                    }
                    else {
                        return res.redirect("/home?add_queue_err=" + encodeURIComponent("you do not own this delivery..."))
                    }
                })
            }
            else {
                return res.redirect("/home?add_queue_err=" + encodeURIComponent("cannot start delivery. wrong delivery selected..."))
            }
        })
    })
})

app.post("/end_delivery", redirectLogin, (req, res) => {
    const { id } = req.body;

    queue_db.find({}, (err, obs) => {
        obs.toArray((err, docs) => {
            currDelivery = docs[0]; // get current delivery
            if (currDelivery._id == id){ // if current delivery is the one that user requested, then ... 
                db.findOne({id: req.session.userID}, (err, user) => {
                    if (currDelivery.payload.to.id == req.session.userID){
                        if (delivery_in_progress && reached_destination) {
                            console.log("ending delivery...")
                            delivery_in_progress = false;
                            queue_db.deleteOne({_id:ObjectID(id)}, (res_) => {
                                return res.redirect("/home?add_queue_err=" + encodeURIComponent("ended Successfully!"))
                            })
                        }
                        else {
                            return res.redirect("/home?add_queue_err=" + encodeURIComponent("delivery still in progress..."))
                        }
                    }
                    else {
                        return res.redirect("/home?add_queue_err=" + encodeURIComponent("you do not own this delivery..."))
                    }
                })
            }
            else {
                return res.redirect("/home?add_queue_err=" + encodeURIComponent("cannot end delivery. wrong delivery selected..."))
            }
        })
    })
})

// 1. client polls server to hckec if it is the recipent of ongoing delivery
// 2. the client js shows a notification for delivery, with options

// app.post("/login", redirectHome, (req, res) => {
//     const { email, password } = req.body
//     let user = null;
//     if (email && password){
//         db.findOne({email: email}, (err, user) => {
//             if (user){
//                 bcrypt.compare(password, user.password, function(err, result) {
//                     if (result == true){
//                         req.session.userID = user.id
//                         return res.redirect("/home")
//                     }
//                     else {
//                         return res.redirect("/login?err=" + encodeURIComponent('incorrect username or password'));
//                     }
//                 });
//             } else{
//                 return res.redirect("/login?err=" + encodeURIComponent('incorrect username or password'));   
//             }
//         })
//     }
//     else {
//         return res.redirect("/login?err=" + encodeURIComponent('fields were left blank'));
//     }
// })


// ------------------------ BOILER BOT ADMIN USAGE-------------------------------------
function _random(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function _make_2_digit(num) {
    if (num.length < 2){
        num = '0' + num;
    }
    return num;
}


app.get("/admin/get_from_queue", (req, res) => {
    queue_db.find({}, (err, obs) => {
        obs.toArray((err, docs) => {
            if (docs.length == 0){
                res.send("na");
            }
            else {
                tosend = docs[0].payload.from.location.x + ':' + docs[0].payload.from.location.y + ':' + docs[0].payload.to.location.x + ':' + docs[0].payload.to.location.y + ':';
                res.send(tosend); 
            }
        })
    })
})

// Unlock portal- unlock the lock for 15s - check that unlock guy 
app.get("/admin/check_unlock", (req, res) => {
    let sendchar = 'n';

    if (unlock_bot == true){
        unlock_bot = false;
        sendchar = 'y';
    }

    res.send(sendchar);
})

// use when reached dest
app.get("/admin/set_reached_destination", (req, res) => {
    reached_destination = true;
    res.sendStatus(200);
})

// Has the delivery been started?
app.get("/admin/has_delivery_started", (req, res) => {
    if (delivery_in_progress){
        res.send("yes");
    }
    else {
        res.send("no");
    }
})

app.get("/admin/has_delivery_ended", (req, res) => {
    if (!delivery_in_progress){
        res.send("yes");
    }
    else {
        res.send("no");
    }
})



// ------------------------------------------------------------------------------------

app.get("/visualize", (req, res) => {
    res.render("visualizer");
})

// ------------------------------------------------------------------------------------

// client.db.collection object for mongodb. Will be updated after this for all functions to use
var db = null;
var queue = null;
var queue_db = null;

client.connect().then( err => {
    // The database
    db = client.db("boilerbot_web").collection("users")
    queue = mongoDbQueue(client.db("boilerbot_web"), 'queue')
    queue_db = client.db("boilerbot_web").collection("queue")

    console.log("Connected to MongoDB users server!")
    
    // db.find().toArray(function(err, docs) {
    //     for (i in docs){
    //         console.log(docs[i].name)
    //     }
    // });
    updateCurrDelivery();
    
    app.listen(PORT, () =>
        console.log(`Starting server on http://localhost:${PORT}...`)
    )
}).catch(err => console.log(err));
