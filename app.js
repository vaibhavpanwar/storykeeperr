const expresss = require('express');
const mongoose = require('mongoose');
const app =expresss();
const bodyParser = require('body-parser');
const methodOverride =require('method-override')
const path = require('path')
const exphbs = require('express-handlebars');
const passport =require('passport')
const cookieParser = require('cookie-parser');
const session =require('express-session');

//load user model
require('./models/users')
require('./models/story');
//passport config
require('./config/passport')(passport);
//load routes
const index = require('./routes/index');
const auth= require('./routes/auth');
const stories =require('./routes/stories');

//Load Keys
const keys= require('./config/keys');

//handlebaer helpers
const {
    truncate,
    stripTags,
    formatDate,
    select
}   = require('./helpers/hbs')
//Map Global Promises
mongoose.Promise = global.Promise;

//connect mogoose

mongoose.connect(keys.mongoURI, {useNewUrlParser: true})
.then(()=> console.log("MongoDB Server Connected"))
.catch(err=> console.log(err));

//body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())
//method override 
app.use(methodOverride('_method'))
//handle brs mwares
app.engine('handlebars', exphbs({
    helpers : {truncate : truncate,
    stripTags : stripTags,
    formatDate : formatDate,
    select : select
    },
    defaultLayout: 'main'
}));
app.set("view engine", "handlebars");



// cookie parser nd session midleware must be above auth routes
app.use(cookieParser());
app.use(session({
    secret : 'secret',
    resave : false,
    saveUninitialized :  false
}))

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//User Global Variable
app.use((req, res, next)=>{
    res.locals.user = req.user || null;
    next(); 
})
//Set Static Folder
app.use(expresss.static(path.join(__dirname, 'public')))

//use Routes
app.use('/auth', auth)
app.use('/', index)
app.use('/stories', stories)
const port =5000 || process.env.PORT

app.listen(port , ()=>
console.log("Server Started On Port 5000"))