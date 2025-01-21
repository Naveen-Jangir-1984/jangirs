const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require('cors');
const app = express();
const port = 27001;

app.use(cors());
app.use(bodyParser.json());

app.get('/getData', (req, res) => {
  fs.readFile("./src/database/db.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    res.send({ db: db });
  });
});

app.post('/addNewUser', (req, res) => {
  fs.readFile("./src/database/db.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const newUser = req.body;
    const flag = db.users.find(user => user.username === newUser.username);
    if(flag) {
			res.send({ result: 'duplicate' });
    } else {
			db.users.push(newUser);
			fs.writeFile("./src/database/db.json", JSON.stringify(db, null, 2), (err) => {
				if (err) res.send({ result: 'failed' });
				res.send({ result: 'success' });
			});
    }
  });
});

app.post('/deleteUser', (req, res) => {
  fs.readFile("./src/database/db.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const username = req.body.username;
    db.users = db.users.filter(user => user.username !== username);     
    fs.writeFile("./src/database/db.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send({ result: 'failed' });
      res.send({ result: 'success' });
    });
  });
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});