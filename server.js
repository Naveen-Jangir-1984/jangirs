const CryptoJS = require("crypto-js");
const express = require("express");
const multer = require('multer');
const path = require("path");
const https = require("https");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" })); // Increase JSON payload limit
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Increase URL-encoded payload limit
app.use("/images", express.static(path.join(__dirname, "public/images")));

require("dotenv").config();
const port = process.env.REACT_APP_PORT;
const secretKey = process.env.REACT_APP_SECRET_KEY;

const options = {
  key: fs.readFileSync("./server.key"),
  cert: fs.readFileSync("./server.cert"),
};

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
}

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

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
    tree.dod = member.dod;
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
        child.dod = member.dod;
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
        wife.dod = member.dod;
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
    res.send(encryptData(db));
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

// ---------- WATSON ----------

const resource = '/api/watson';
app.get(`${resource}/data`, (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const db = JSON.parse(data);
    const remoteAddress = req.socket.remoteAddress.split('::ffff:')[1];
    if(!db.visitors.includes(remoteAddress)) {
      db.visitors = [...db.visitors, remoteAddress];
      fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
        if (err) res.send({ result: 'failed' });
        // res.send({ result: 'success' });
      });      
    }
    res.send(encryptData(db));
  });
});

app.post(`${resource}/addFeedback`, (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const feedback = req.body.feedback;
    db.posts = [decryptData(feedback), ...db.posts];
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: 'failed' }));
      res.send(encryptData({ result: 'success' }));
    });
  });
});

app.post(`${resource}/deleteFeedback`, (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const id = req.body.id;
    db.posts = db.posts.filter(post => post.id !== id);
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send({ result: 'failed' });
      res.send({ result: 'success' });
    });
  });
});

app.post(`${resource}/addEvent`, (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const event = req.body.event;
    db.events = [decryptData(event), ...db.events];
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: 'failed' }));
      res.send(encryptData({ result: 'success' }));
    });
  });
});

app.post(`${resource}/deleteEvent`, (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const id = req.body.id;
    db.events = db.events.filter(event => event.id !== id);
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send({ result: 'failed' });
      res.send({ result: 'success' });
    });
  });
});

app.post(`${resource}/addHeadline`, (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const headline = req.body.headline;
    db.headlines = [decryptData(headline), ...db.headlines];
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: 'failed' }));
      res.send(encryptData({ result: 'success' }));
    });
  });
});

app.post(`${resource}/deleteHeadline`, (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const id = req.body.id;
    db.headlines = db.headlines.filter(headline => headline.id !== id);
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send({ result: 'failed' });
      res.send({ result: 'success' });
    });
  });
});

app.post(`${resource}/addEnquiry`, (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const enquiry = req.body.enquiry;
    db.enquiries = [decryptData(enquiry), ...db.enquiries];
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: 'failed' }));
      res.send(encryptData({ result: 'success' }));
    });
  });
});

// Configure Multer
const storage = multer.diskStorage({
  destination: "public/images/Posters",
  filename: (req, file, cb) => {
    const folderPath = path.join(__dirname, "public/images/Posters");

    fs.readdir(folderPath, (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return cb(err);
      }

      const fileIds = files.filter(file => {
        if(file.startsWith('image')) {
          return file.split('.')[0].substring(5);
        }
      });
      let randomId = Math.floor(Math.random() * 1000) + 1;
      while(fileIds.includes(randomId)) {
        randomId = Math.floor(Math.random() * 1000) + 1;
      };
      const extension = path.extname(file.originalname);
      const fileName = `image${randomId}${extension}`;

      cb(null, fileName);
    });
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.post(`${resource}/addPoster`, upload.single('file'), (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    
    db = JSON.parse(data);
    const filename = req.file.filename;
    const id = Number(filename.split('.')[0].substring(5));
    const newPoster = {
      id: id,
      logo: `/images/Posters/${filename}`,
      isSelected: false
    };
    db.posters.images = [newPoster, ...db.posters.images];
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: 'failed' }));
      res.send(encryptData({ result: 'success' }));
    });
  });
});

app.post(`${resource}/deletePoster`, (req, res) => {
  const folderPath = path.join(__dirname, "public/images/Posters");
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).json({ error: "Failed to read directory" });
    }
    const id = decryptData(req.body.id);
    const fileToDelete = files.find((file) => file.startsWith(`image${id}`));
    const filePath = path.join(folderPath, fileToDelete);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return res.status(500).json({ error: "Failed to delete file" });
      }
    });
  });
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const id = decryptData(req.body.id);
    db = JSON.parse(data);
    db.posters.images = db.posters.images.filter(image => image.id !== id);
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: 'failed' }));
      res.send(encryptData({ result: 'success' }));
    });
  });
});

// ---------- WATSON ----------

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});

// https.createServer(options, app).listen(port, () => {
//   console.log(`listening at https://localhost:${port}`);
// });