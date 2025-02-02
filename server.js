const cryptojs = require("crypto-js");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require('cors');
const app = express();
const port = 27001;

app.use(cors());
app.use(bodyParser.json());

const addMember = (tree, id, member, type) => {
  if (!tree) return null;
  if (tree.id === id && type === 'child') {
    if (tree.children) {
      tree.children.push(member);
    } else {
      tree.children = [member];
    }
    return tree;
  }
  else if(tree.id === id && type === 'wife') {
    if (tree.wives) {
      tree.wives.push(member);
    } else {
      tree.wives = [member]
    }
    return tree;
  }
  tree.children?.forEach(child => addMember(child, id, member, type));
  return tree;
}

const editMember = (tree, member) => {
  if (!tree) return null;
  if (tree.id === member.id) {
    tree.name = member.name;
    tree.gender = member.gender;
    tree.isAlive = member.isAlive;
    tree.dob = member.dob;
    tree.village = member.village;
    tree.gotra = member.gotra;
    tree.email = member.email;
    tree.mobile = member.mobile;
  }
  if (tree.children) {
    tree.children = tree.children.map(child => {
      if(child.id === member.id) {
        child.name = member.name;
        child.gender = member.gender;
        child.isAlive = member.isAlive;
        child.dob = member.dob;
        child.village = member.village;
        child.gotra = member.gotra;
        child.email = member.email;
        child.mobile = member.mobile;
      }
      return child;
    });
  }
  tree.children?.forEach(child => editMember(child, member));
  if(tree.wives) {
    tree.wives = tree.wives.map(wife => {
      if(wife.id === member.id) {
        wife.name = member.name;
        wife.gender = member.gender;
        wife.isAlive = member.isAlive;
        wife.dob = member.dob;
        wife.village = member.village;
        wife.gotra = member.gotra;
        wife.email = member.email;
        wife.mobile = member.mobile;
      }
      return wife;
    });      
  }
  tree.wives?.forEach(wife => editMember(wife, member));
  return tree;
};

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
    const db = JSON.parse(data);
    res.send({db});
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

app.post('/addNewMember', (req, res) => {
  fs.readFile("./src/database/db.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const existingMember = req.body.member;
    const newMember = req.body.newMember;
    const type = req.body.type;
    const village = req.body.village;
    if(village === 'dulania') {
      db.dulania = db.dulania.map(member => addMember(member, existingMember.id, newMember, type));
    } else if(village === 'moruwa') {
      db.moruwa = db.moruwa.map(member => addMember(member, existingMember.id, newMember, type));
    } else if(village === 'tatija') { 
      db.tatija = db.tatija.map(member => addMember(member, existingMember.id, newMember, type));
    } 
    fs.writeFile("./src/database/db.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send({ result: 'failed' });
      res.send({ result: 'success' });
    });
  });
});

app.post('/editMember', (req, res) => {
  fs.readFile("./src/database/db.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const existingMember = req.body.member;
    const village = req.body.village;
    if(village === 'dulania') {
      db.dulania = db.dulania.map(member => editMember(member, existingMember));
    } else if(village === 'moruwa') {
      db.moruwa = db.moruwa.map(member => editMember(member, existingMember));
    } else if(village === 'tatija') { 
      db.tatija = db.tatija.map(member => editMember(member, existingMember));
    } 
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
      db.moruwa = db.moruwa.map(member => deleteMemberById(member, id));
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