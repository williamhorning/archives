var markdown = require('remarked');
markdown.setOptions({sanitize: false})
const express = require('express');
const app = express();
const fs = require('fs')
const matter = require('gray-matter');
const ejs = require('ejs');
const fetch = require('node-fetch')
var cf = require('node_cloudflare');
let postcss = require('postcss')
var cors = require('cors')
const cookieParser = require('cookie-parser');
app.use(cookieParser());
async function getUrls() {
	let array = ['/']
	files = fs.readdirSync("./blog/")
	for (var i in files) {
		var post = await fs.promises.readFile(`./blog/${files[i]}`, "utf-8");
		var matteredData = matter(post);
		matteredData.data.url = files[i].replace(".md", "");
		fetch(`https://social.wgyt.tk/comments/ensure/${matteredData.data.url}`)
		array.push('/blog/' + matteredData.data.url);
	}
	console.log(array)
	array = array
	return array
}
app.use(express.static('public'))
console.log("starting server")
app.set('query parser', 'extended')

app.get('/', (req, res) => {
	const about = fs.readFileSync(`includes/about.html`, 'utf8')
	const blog = fs.readFileSync(`includes/blogpostlist.html`, 'utf8')
	var header
	if (req.query.noheader === undefined) {
		header = fs.readFileSync(`includes/header.html`, 'utf8')
	} else {
		header = '<script>document.cookie = "noheader=true";</script>';
	}
	const footer = fs.readFileSync(`includes/footer.html`, 'utf8')
	ejs.renderFile(
		`${__dirname}/views/index.html`, {
			about: about,
			blog: blog,
			header: header,
			footer: footer
		},
		function(err, str) {
			res.send(str)
		});
});

app.get('/blog/:post', (req, res, next) => {
	if (fs.existsSync(`blog/${req.params.post}.md`)) {
		const data = fs.readFileSync(`blog/${req.params.post}.md`, 'utf8')
		mattered = matter(fs.readFileSync(`blog/${req.params.post}.md`, 'utf8'))
		mattered.data.url = req.params.post

		const options = {
			year: "numeric",
			month: "long",
			day: "numeric"
		};
		let date = new Date(mattered.data.date).toLocaleDateString("en-US");
		mattered.data.formattedDate = date

		var header
		if (req.cookies.noheader === undefined) {
			header = fs.readFileSync(`includes/header.html`, 'utf8')
		} else {
			header = '';
		}

		ejs.renderFile(
			`${__dirname}/views/blogtemplate.html`, {
				data: mattered,
				md: markdown(mattered.content),
				header: header,
			},
			function(err, str) {
				res.send(str)
			});
	} else {
		next() // if it 404's show 404 page
	}
});
app.get('/lewisclark/:post', (req, res, next) => {
	if (fs.existsSync(`lewisclark/${req.params.post}.md`)) {
		const data = fs.readFileSync(`lewisclark/${req.params.post}.md`, 'utf8')
		mattered = matter(fs.readFileSync(`lewisclark/${req.params.post}.md`, 'utf8'))
		mattered.data.url = req.params.post

		const options = {
			year: "numeric",
			month: "long",
			day: "numeric"
		};
		let date = new Date(mattered.data.date).toLocaleDateString("en-US");
		mattered.data.formattedDate = date
		ejs.renderFile(
			`${__dirname}/views/lewisclark.html`, {
				data: mattered,
				md: markdown(mattered.content)
			},
			function(err, str) {
				res.send(str)
			});
	} else {
		next() // if it 404's show 404 page
	}
});
app.get('/api/blog',cors(), (req, res, next) => {
	let array = [];
	fs.readdir("./blog/", async (err, files) => {
		for (var i in files) {
			var post = await fs.promises.readFile(`./blog/${files[i]}`, "utf-8");
			var matteredData = matter(post);
			matteredData.data.url = files[i].replace(".md", "");
			fetch(`https://social.wgyt.tk/comments/ensure/${matteredData.data.url}`)
			array.push(matteredData);
		}
		//sort array real quick
		array.sort(function(a, b) {
			if (a.data.date > b.data.date) {
				return -1;
			}
			if (a.data.date < b.data.date) {
				return 1;
			}
			return 0;
		});


		res.send(array)
	})
})

app.get('/offline.html', (req, res) => {
	res.sendFile(`${__dirname}/offline.html`)
});
app.get('/webstories-test', (req, res) => {
	res.sendFile(`${__dirname}/webstories-test.html`)
});
app.get(`/js/service-worker.js`, (req, res) => {
	res.redirect(301, '/js/sw.js')
})
app.get(`/wp-login.php`, (req, res) => {
	res.redirect(301, '/blog/super-bowl-and-wp-login')
})
app.get(`/sitemap.xml`, (req, res) => {
	res.set('Content-Type', 'text/xml');
	res.send(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<url>
<loc>https://www.wgyt.tk/</loc>
<lastmod>2021-03-13T15:17:25+00:00</lastmod>
<priority>1.00</priority>
</url>
<url>
<loc>https://www.wgyt.tk/blog</loc>
<lastmod>2021-03-13T15:17:25+00:00</lastmod>
<priority>0.80</priority>
</url>
</urlset>`)
})

app.get('/keynote', (req, res) => {
	var header
	if (req.query.noheader === undefined) {
		header = fs.readFileSync(`includes/header.html`, 'utf8')
	} else {
		header = '<script>document.cookie = "noheader=true";</script>';
	}
	const footer = fs.readFileSync(`includes/footer.html`, 'utf8')
	ejs.renderFile(
		`${__dirname}/views/keynote.html`, {
			header: header,
			footer: footer
		},
		function(err, str) {
			res.send(str)
		});
});

cf.load(function(error, fs_error) {
	if (fs_error) {
		throw new Error(fs_error);
	}
	app.listen(3000);
	console.log('Server running.');
});