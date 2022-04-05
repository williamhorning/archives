// Set up express.js
const express = require('express')
const app = express()
// Set up express.js stuff
const mustacheExpress = require('mustache-express')
const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.engine('html', mustacheExpress())
app.set('views', './views')
app.set('view engine', 'html')
app.use(express.json())
app.use('/data', express.static(`${__dirname}/data`))
// Set up database
const fs = require('fs-extra')
fs.ensureDir(`${__dirname}/data`)
// Main Page
app.get('/', (req, res) => {
	res.sendFile(`${__dirname}/views/index.html`)
})
// Auth
app.get('/auth', (req, res) => {
	res.sendFile(`${__dirname}/views/auth.html`)
})
app.get('/auth/callback', (req, res) => {
	res.render('authcall', {
		userid: req.query.id,
		username: req.query.name,
		userroles: req.query.roles
	})
})
// Embed
app.get('/embed/:url', (req, res) => {
	res.render('embed', {
		userid: req.cookies.id,
		username: req.cookies.name,
		userroles: req.cookies.roles,
		url: req.params.url
	})
})
// Legal
app.get('/legal', (req, res) => {
	res.sendFile(`${__dirname}/views/legal.html`)
})
// Post Stuff
app.get('/post/:url', (req, res) => {
	res.render('post', {
		userid: req.cookies.id,
		username: req.cookies.name,
		userroles: req.cookies.roles,
		post: req.query.post,
		url: req.params.url
	})
	fs.ensureFile(`${__dirname}/data/${req.params.url}.html`)
	post = `<!doctype html><html lang="en"><head><style>::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{box-shadow:0 0 5px #000;border-radius:10px}::-webkit-scrollbar-thumb{background:white;border-radius:10px}::-webkit-scrollbar-thumb:hover{background:black}::-webkit-scrollbar-track-piece{background:#00000000}</style><!-- Required meta tags --><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><!-- Bootstrap CSS --><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous"><title>Hello, world!</title></head><body class="bg-dark"><div class="card bg-secondary"><div class="card-header" style="color:white;">${req.cookies.name}</div><div class="card-body"style="color:white;"><p class="card-text">${req.query.post}</p></div></div> <!-- Option 1: Bootstrap Bundle with Popper --><script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js" integrity="sha384-ygbV9kiqUc6oa4msXn9868pTtWMgiQaeYH7/t7LECLbyPA2x65Kgf80OJFdroafW" crossorigin="anonymous"></script></body></html>`
	fs.appendFile(`${__dirname}/data/${req.params.url}.html`, `${post}\r\n`, (err) => {
		if (err) throw err
		console.log('The data to append was appended to file!')
	})
})
// Ensure file
app.get('/ensure/:url', (req, res) => {
	fs.ensureFile(`${__dirname}/data/${req.params.url}.html`)
	res.send("done")
})
// Listen on port
app.listen(3000, () => {
	console.log('server started')
})
