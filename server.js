// Codebase adapted from https://github.com/alex996/presentations/blob/master/express-session.md
// and based on youtube tutorial https://www.youtube.com/watch?v=OH6Z0dJ_Huk&list=FL553-LfOaFIPeOrDw8y9cSA&index=2&t=0s

// Code for server login based authenticated sessions in expressjs

const express = require("express")

// Define express app
const app = express()

// Sessions can be stored server-side (ex: user auth) or client-side
// (ex: shopping cart). express-session saves sessions in a store, and
// NOT in a cookie. To store sessions in a cookie, use cookie-session.
const session = require("express-session")

const MongoStore = require('connect-mongo')(session);
const { MongoClient } = require('mongodb');
const MONGO_URI = "mongodb://localhost:27017/";
const client = new MongoClient(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const { PORT = 3000, NODE_ENV = "development", SESS_NAME='sid' } = process.env

app.use(express.json()) //Used to parse JSON bodies
app.use(express.urlencoded({ extended: true }))

app.use(
  // Creates a session middleware with given options.
    session({
        // Defaults to MemoryStore, meaning sessions are stored as POJOs
        // in server memory, and are wiped out when the server restarts.
        store: new MongoStore({
            url: "mongodb://localhost:27017/boilerbot_web",
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
            secure: process.env.NODE_ENV === "production",
        },
  })
)


// * --- Done Config --- 
const redirectLogin = (req, res, next) => {
    if (!req.session.userID){
        return res.redirect("/login")
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
    console.log("Cookie expires " + req.session.cookie.expires) // date of expiry
    // console.log("Cookie maxage " + req.session.cookie.maxAge) // milliseconds left until expiry

    // Unless a valid session ID cookie is sent with the request,
    // the session ID below will be different for each request.
    console.log("Session.id " + req.session.id) // ex: VdXZfzlLRNOU4AegYhNdJhSEquIdnvE-

    // Same as above. Alphanumeric ID that gets written to the cookie.
    // It's also the SESSION_ID portion in 's:{SESSION_ID}.{SIGNATURE}'.
    // console.log("Sessionid " + req.sessionID)
    const { userID } = req.session

    if (userID){
        // Send homepage
        res.send(`
            <h1>Main root page</h1>

            <a href='/home'>home</a>
            <form method='post' action='/logout'>
                <button>Logout</button>
            </form>
        `)
    }
    else {
        res.send(`
            <h1>Main root page</h1>

            <a href='/login'>Login</a>
            <a href='/register'>Register</a>
        `)
    }
})

// * To get the login page html
app.get("/login", redirectHome, (req, res) => {
    // Unless we explicitly write to the session (and resave is false), the
    // store is never updated, even though a new session is generated on each
    // request. After we modify that session and during req.end(), it gets
    // persisted. On subsequent writes, it's updated and synced with the store.
    // req.session.userId = 1

    res.send(`
        <h1>Login</h1>
        <form method='post' action='/login'>
            <input type="email" name="email" id="email" placeholder="email" required></input> 
            <input type="password" name="password" id="password" placeholder="password" required></input> 
            <button type="submit">Submit</button>
        </form>
        <a href='/register'>Register</a>
    `)
})

// db.insertOne({id: 3, name: 'lee', email: 'lee@gmail.com', password: 'passl'})

// * Corresponing post route for login
app.post("/login", redirectHome, (req, res) => {
    const { email, password } = req.body
    let user = null;
    if (email && password){
        //TODO hash
        db.findOne({email: email, password: password}, (err, user) => {
            if (user){
                req.session.userID = user.id
                return res.redirect("/home")
            }

            return res.redirect("/login")
        })

        // return res.redirect("/login")
    }
    else {
        return res.redirect("/login")
    }
})


// * To get the register html
app.get("/register", redirectHome, (req, res) => {
    res.send(`
        <h1>Register</h1>
        <form method='post' action='/register'>
            <input type="name" name="name" id="name" placeholder="name" required></input> 
            <input type="email" name="email" id="email" placeholder="email" required></input> 
            <input type="password" name="password" id="password" placeholder="password" required></input> 
            <button type="submit">Submit</button>
        </form>
        <a href='/login'>Login</a>
    `)
})


async function getRandomID(){
    rand = Math.round(Math.random() * 1000000)
    while ((await db.findOne({id: rand})) != null ){
        console.log(rand)
        rand = Math.round(Math.random() * 1000000)
    }
    console.log(rand)
    return rand

    // docs = await db.find().toArray()
    // for (i in docs){
    //     console.log(docs[i].name)
    // }
}

// * Corresponing post route for register
app.post("/register", redirectHome, (req, res) => {
    const { name, email, password } = req.body

    if (name && email && password){ //TODO validation better
        db.findOne({email: email}, (err, user) => {
            if (!user){
                getRandomID().then( rand=>{
                    console.log("rand")
                    console.log(rand)
      
                    const user_ = {
                        id: rand,
                        name: name,
                        email: email,
                        password: password
                    }
                    
                    db.insertOne(user_);
                    req.session.userID = user_.id
                    return res.redirect("/home")
                })
                
            }
            else {
                return res.redirect("/register") //TODO: query string parameters error maybe
            }

        })      
    }
})


// * Homepage after login
app.get("/home", redirectLogin, (req, res) => {
    db.findOne({id: req.session.userID}, (err, user) => {
        res.send(`
        <h1>home after login</h1>

        <a href='/'>Go to Main</a>
        <ul>
            <li> Name: ${user.name}
            <li> Email:  ${user.email}
        </ul>
        `)
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

var db = null;

client.connect().then(()=>{
    console.log("Connected to MongoDB users server!")
    
    // The database
    db = client.db("boilerbot_web").collection("users")
    db.find().toArray(function(err, docs) {
        for (i in docs){
            console.log(docs[i].name)
        }
    });

    app.listen(PORT, () =>
        console.log(`Starting server on http://localhost:${PORT}...`)
    )
}).catch(err => console.log(err));


