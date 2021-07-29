const express = require("express"),
	bodyParser = require("body-parser"),
	ejs = require("ejs"),
	sharp = require("sharp"),
	multer = require("multer"),
	path = require("path"),
	mongoose = require("mongoose"),
	fs = require("fs"),
	{
		info: info
	} = require("console"),
	storage = multer.memoryStorage(),
	upload = multer({
		storage: storage
	}),
	app = express();
app.use(express.static("public")), app.set("view engine", "ejs"), app.use(bodyParser.urlencoded({
	extended: !0
}));
var x = "no";
mongoose.connect("mongodb+srv://npss:npss@cluster0.squbj.mongodb.net/npss?retryWrites=true&w=majority", {
	useNewUrlParser: !0,
	useUnifiedTopology: !0,
	useCreateIndex: !0,
	useFindAndModify: !1
}).then(() => {
	x = "yes", console.log("connection to database established")
}).catch(e => {
	console.log(`db error ${e.message}`), x = "no"
});
const boardSchema = {
		name: String,
		board: String,
		location: String,
		fb: String,
		insta: String,
		twitter: String
	},
	Board = new mongoose.model("Board", boardSchema),
	feedbackSchema = {
		name: String,
		email: String,
		message: String
	},
	Feedback = new mongoose.model("Feedback", feedbackSchema),
	sponsorsSchema = {
		name: String,
		location: String
	},
	Sponsors = new mongoose.model("Sponsors", sponsorsSchema),
	gallerySchema = {
		location: String
	},
	Gallery = new mongoose.model("Gallery", gallerySchema),
	eventsSchema = {
		name: String,
		eventinfo: String,
		location: String
	},
	Events = new mongoose.model("Events", eventsSchema);
app.get("/", function (e, n) {
	"no" == x && n.redirect("error"), Sponsors.find({}, function (e, o) {
		e ? console.log(e) : o && Gallery.find({}, function (e, r) {
			Events.find({}, function (e, t) {
				n.render("home", {
					foundevent: t,
					foundgallery: r,
					foundsponsors: o
				})
			}).sort({
				location: -1
			})
		}).sort({
			location: -1
		})
	})
}), app.get("/events", function (e, n) {
	"no" == x && n.redirect("error"), Events.find({}, function (e, o) {
		e ? console.log(e) : o && n.render("events", {
			foundevent: o
		})
	}).sort({
		location: -1
	})
}), app.get("/board", function (e, n) {
	"no" == x && n.redirect("error"), Board.find({}, function (e, o) {
		e ? console.log(e) : o && n.render("board", {
			foundboard: o
		})
	})
}), app.get("/error", function (e, n) {
	n.render("error")
}), app.get("/admin", function (e, n) {
	"no" == x ? n.render("error") : n.render("admin")
}), app.get("/delete", function (e, n) {
	let o = e.query;
	if (o.gallery) {
		let o = e.query.gallery;
		Gallery.deleteOne({
			_id: o
		}, function (e) {
			e ? n.redirect("/") : n.redirect("/admin")
		})
	} else if (o.sponsor) {
		e.query.sponsor;
		Sponsors.find({}, function (e, n) {
			e && console.log(e)
		})
	} else if (o.event) {
		let o = e.query.event;
		Events.deleteOne({
			_id: o
		}, function (e) {
			e ? n.redirect("/") : n.redirect("/admin")
		})
	} else n.redirect("/error")
}), app.post("/admin", function (e, n) {
	let o = e.body.name,
		r = e.body.password;
	"npssvit" == o && "npssvit" == r ? Sponsors.find({}, function (e, o) {
		e ? console.log(e) : o && Board.find({}, function (e, r) {
			Gallery.find({}, function (e, t) {
				Events.find({}, function (e, i) {
					n.render("adminpage", {
						foundevent: i,
						foundgallery: t,
						foundboard: r,
						foundsponsors: o
					})
				}).sort({
					location: -1
				})
			}).sort({
				location: -1
			})
		})
	}) : n.redirect("/admin")
}), app.post("/message", function (e, n) {
	let o = e.body.name,
		r = e.body.email,
		t = e.body.message;
	new Feedback({
		name: o,
		email: r,
		message: t
	}).save(function (e) {
		e ? console.log(e) : n.redirect("/")
	})
}), app.post("/editsponsors", upload.single("file"), async function (e, n) {
	let o = String(e.body.name) + ".jpg",
		r = "./sponsor/" + o;
	await sharp(e.file.buffer).resize({
		width: 750,
		height: 750
	}).toFile("./public/sponsor/" + o), new Sponsors({
		name: e.body.name,
		location: r
	}).save(function (e) {
		e ? console.log(e) : n.redirect("/admin")
	})
}), app.post("/editboard", upload.single("file"), async function (e, n) {
	let o = e.body.name,
		r = e.body.board,
		t = e.body.fb,
		i = e.body.insta,
		s = e.body.twitter,
		a = String(r) + ".jpg",
		l = "./board/" + a;
	await sharp(e.file.buffer).resize({
		width: 750,
		height: 750
	}).toFile("./public/board/" + a), Board.updateOne({
		board: r
	}, {
		$set: {
			name: o,
			fb: t,
			insta: i,
			twitter: s,
			location: l
		}
	}, function (e) {
		e ? console.log(e) : n.redirect("/admin")
	})
}), app.post("/editgallery", upload.single("file"), async function (e, n) {
	await fs.readdir("./public/gallery", async (o, r) => {
		var t = r.length + 1;
		let i = "gallery" + String(t) + ".jpg",
			s = "./gallery/" + i;
		await sharp(e.file.buffer).resize({
			width: 3840,
			height: 2160
		}).toFile("./public/gallery/" + i), new Gallery({
			location: s
		}).save(function (e) {
			e ? console.log(e) : n.redirect("/admin")
		})
	})
}), app.post("/editevent", upload.single("file"), async function (e, n) {
	await fs.readdir("./public/events", async (o, r) => {
		let t = e.body.ename,
			i = e.body.eventinfo;
		var s = r.length + 1;
		let a = "events" + String(s) + ".jpg",
			l = "./events/" + a;
		await sharp(e.file.buffer).resize({
			width: 750,
			height: 750
		}).toFile("./public/events/" + a), new Events({
			name: t,
			eventinfo: i,
			location: l
		}).save(function (e) {
			e ? console.log(e) : n.redirect("/admin")
		})
	})
});

app.get("/exboard", function (req, res) {
	var year = req.query.year;
	res.render("exboard", {
		year: year
	})
});

app.listen(process.env.PORT || 3e3, function () {
	console.log("http://localhost:3000/")
});