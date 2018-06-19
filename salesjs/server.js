/*eslint no-console: 0, no-shadow: 0, new-cap: 0, quotes: 0, no-unused-vars: 0*/

var express = require("express");
var app = express();

var xsenv = require("@sap/xsenv");
var hdbext = require("@sap/hdbext");
var xssec = require("@sap/xssec");
var passport = require("passport");

var hanaOptions = xsenv.getServices({
	hana: {
		tag: "hana"
	}
});

app.use(
	hdbext.middleware(hanaOptions.hana)
);

passport.use("JWT", new xssec.JWTStrategy(xsenv.getServices({
	uaa: {
		tag: "xsuaa"
	}
}).uaa));

app.use(
	passport.initialize()
);

app.use(
	passport.authenticate("JWT", {
		session: false
	})
);

app.get('/js/database', function(req, res) {

	if (req.authInfo.checkScope("$XSAPPNAME.USER")) {
		req.db.exec('select SYSTEM_ID, DATABASE_NAME, HOST, VERSION, USAGE from M_DATABASE', function(err, results) {
			if (err) {
				res.type("text/plain").status(500).send("ERROR: " + err.toString());
				return;
			}
			res.status(200).json(results);
		});
	} else {
		res.type("text/plain").status(403).send("Forbidden");
	}
});

app.get('/js/session', function(req, res) {
	if (req.authInfo.checkScope("$XSAPPNAME.USER")) {
		req.db.exec('select SESSION_USER, CURRENT_SCHEMA from DUMMY', function(err, results) {
			if (err) {
				res.type("text/plain").status(500).send("ERROR: " + err.toString());
				return;
			}
			res.status(200).json(results);
		});
	} else {
		res.type("text/plain").status(403).send("Forbidden");
	}
});

app.get('/js/sales', function(req, res) {
	if (req.authInfo.checkScope("$XSAPPNAME.USER")) {
		req.db.exec('select * from "SalesApp.db::tables.Sales"', function(err, results) {
			if (err) {
				res.type("text/plain").status(500).send("ERROR: " + err.toString());
				return;
			}
			res.status(200).json(results);
		});
	} else {
		res.type("text/plain").status(403).send("Forbidden");
	}
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.info("Listening on port: " + port);
});