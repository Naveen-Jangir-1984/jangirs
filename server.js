const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require('cors');
const app = express();
const port = 27001;

app.use(cors());
app.use(bodyParser.json());

const deleteMemberById = (tree, id) => {
  if (!tree) return null;
  if (tree.children) {
    tree.children = tree.children.filter(child => child.id !== id);
  }
  tree.children?.forEach((child) => deleteMemberById(child, id));
  if(tree.wives) {
    tree.wives = tree.wives.filter(wife => wife.id !== id);      
  }
  tree.wives?.forEach((wife) => deleteMemberById(wife, id));
  return tree;
};

app.get('/getData', (req, res) => {
  fs.readFile("./src/database/db.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    res.send({ db });
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

app.post('/deleteMember', (req, res) => {
  fs.readFile("./src/database/db.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const id = req.body.id;
    const village = req.body.village;
    if(village === 'dulania') {
      db.dulania = db.dulania.map(member => deleteMemberById(member, id));
    } else if(village === 'moruwa') {
      db.maruwa = db.maruwa.map(member => deleteMemberById(member, id));
    } else if(village === 'tatija') { 
      db.tatija = db.tatija.map(member => deleteMemberById(member, id));
    } 
    fs.writeFile("./src/database/db.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send({ result: 'failed' });
      res.send({ result: 'success' });
    });
  });
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});