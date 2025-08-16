const CryptoJS = require("crypto-js");
const express = require("express");
const multer = require("multer");
const path = require("path");
const https = require("https");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ limit: "50mb" })); // Increase JSON payload limit
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Increase URL-encoded payload limit
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/videos", express.static(path.join(__dirname, "public/videos")));

require("dotenv").config();
const port = process.env.REACT_APP_PORT;
const secretKey = process.env.REACT_APP_SECRET_KEY;

const options = {
  key: fs.readFileSync("./test.key"),
  cert: fs.readFileSync("./test.crt"),
};

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

const addMember = (tree, id, member, type) => {
  if (!tree) return null;
  if (tree.id === id && type === "child") {
    if (tree.children) {
      tree.children.push(member);
    } else {
      tree.children = [member];
    }
    return tree;
  } else if (tree.id === id && type === "wife") {
    if (tree.wives) {
      tree.wives.push(member);
    } else {
      tree.wives = [member];
    }
    return tree;
  }
  tree.children?.forEach((child) => addMember(child, id, member, type));
  return tree;
};

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
    tree.children = tree.children.map((child) => {
      if (child.id === member.id) {
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
  tree.children?.forEach((child) => editMember(child, member));
  if (tree.wives) {
    tree.wives = tree.wives.map((wife) => {
      if (wife.id === member.id) {
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
  tree.wives?.forEach((wife) => editMember(wife, member));
  return tree;
};

const deleteMemberById = (tree, id) => {
  if (!tree) return null;
  if (tree.children) {
    tree.children = tree.children.filter((child) => child.id !== id);
  }
  tree.children?.forEach((child) => deleteMemberById(child, id));
  if (tree.wives) {
    tree.wives = tree.wives.filter((wife) => wife.id !== id);
  }
  tree.wives?.forEach((wife) => deleteMemberById(wife, id));
  return tree;
};

const jangirsDatabase = path.resolve("./src/database/db.json");

const readDatabase = () => {
  const db = fs.readFileSync(jangirsDatabase, "utf-8");
  return JSON.parse(db);
};

const writeDatabase = (data) => {
  fs.writeFileSync(jangirsDatabase, JSON.stringify(data, null, 2), "utf-8");
};

app.get("/getData", (req, res) => {
  fs.readFile(jangirsDatabase, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const db = JSON.parse(data);
    const remoteAddress = req.socket.remoteAddress.split("::ffff:")[1] + "; " + new Date().toISOString().split("T")[0];
    // if (!db.visitors.includes(remoteAddress)) {
    //   db.visitors = [...db.visitors, remoteAddress];
    //   fs.writeFile(jangirsDatabase, JSON.stringify(db, null, 2), (err) => {
    //     if (err) res.send({ result: "failed" });
    //     // res.send({ result: 'success' });
    //   });
    // }
    const removeAddressSplit = remoteAddress.split(".");
    let flag = true;
    for (const visitor of db.visitors) {
      const visitorSplit = visitor.split(".");
      if (visitorSplit[0] === removeAddressSplit[0] && visitorSplit[1] === removeAddressSplit[1] && visitorSplit[2] === removeAddressSplit[2]) {
        flag = false;
      }
    }
    if (flag) {
      db.visitors = [...db.visitors, remoteAddress];
      fs.writeFile(jangirsDatabase, JSON.stringify(db, null, 2), (err) => {
        if (err) res.send({ result: "failed" });
        // res.send({ result: 'success' });
      });
    }
    res.send(encryptData(db));
  });
});

app.post("/addNewUser", (req, res) => {
  fs.readFile(jangirsDatabase, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const newUser = req.body;
    const flag = db.users.find((user) => user.username === newUser.username);
    if (flag) {
      res.send({ result: "duplicate" });
    } else {
      db.users.push(newUser);
      fs.writeFile(jangirsDatabase, JSON.stringify(db, null, 2), (err) => {
        if (err) res.send({ result: "failed" });
        res.send({ result: "success" });
      });
    }
  });
});

app.post("/deleteUser", (req, res) => {
  fs.readFile(jangirsDatabase, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const username = req.body.username;
    db.users = db.users.filter((user) => user.username !== username);
    fs.writeFile(jangirsDatabase, JSON.stringify(db, null, 2), (err) => {
      if (err) res.send({ result: "failed" });
      res.send({ result: "success" });
    });
  });
});

app.post("/addNewMember", (req, res) => {
  fs.readFile(jangirsDatabase, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const existingMember = req.body.member;
    const newMember = req.body.newMember;
    const type = req.body.type;
    const village = req.body.village;
    if (village === "dulania") {
      db.dulania = db.dulania.map((member) => addMember(member, existingMember.id, newMember, type));
    } else if (village === "moruwa") {
      db.moruwa = db.moruwa.map((member) => addMember(member, existingMember.id, newMember, type));
    } else if (village === "tatija") {
      db.tatija = db.tatija.map((member) => addMember(member, existingMember.id, newMember, type));
    }
    fs.writeFile(jangirsDatabase, JSON.stringify(db, null, 2), (err) => {
      if (err) res.send({ result: "failed" });
      res.send({ result: "success" });
    });
  });
});

app.post("/editMember", (req, res) => {
  fs.readFile(jangirsDatabase, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const existingMember = req.body.member;
    const village = req.body.village;
    if (village === "dulania") {
      db.dulania = db.dulania.map((member) => editMember(member, existingMember));
    } else if (village === "moruwa") {
      db.moruwa = db.moruwa.map((member) => editMember(member, existingMember));
    } else if (village === "tatija") {
      db.tatija = db.tatija.map((member) => editMember(member, existingMember));
    }
    fs.writeFile(jangirsDatabase, JSON.stringify(db, null, 2), (err) => {
      if (err) res.send({ result: "failed" });
      res.send({ result: "success" });
    });
  });
});

app.post("/deleteMember", (req, res) => {
  fs.readFile(jangirsDatabase, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const id = req.body.id;
    const village = req.body.village;
    if (village === "dulania") {
      db.dulania = db.dulania.map((member) => deleteMemberById(member, id));
    } else if (village === "moruwa") {
      db.moruwa = db.moruwa.map((member) => deleteMemberById(member, id));
    } else if (village === "tatija") {
      db.tatija = db.tatija.map((member) => deleteMemberById(member, id));
    }
    fs.writeFile(jangirsDatabase, JSON.stringify(db, null, 2), (err) => {
      if (err) res.send({ result: "failed" });
      res.send({ result: "success" });
    });
  });
});

// ---------- WATSON ----------

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  setInterval(() => {
    fs.readFile("./src/database/watson.json", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      const db = JSON.parse(data);
      const feed = {
        enquiries: db.enquiries,
        posts: db.posts,
        headlines: db.headlines,
        events: db.events,
        posters: db.posters,
        videos: db.videos,
        users: db.users,
      };
      res.write(`data: ${encryptData(feed)}\n\n`);
    });
  }, 10000);
});

const resource = "/api/watson";
app.get(`${resource}/data`, (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const db = JSON.parse(data);
    const remoteAddress = req.socket.remoteAddress.split("::ffff:")[1];
    if (!db.visitors.includes(remoteAddress)) {
      db.visitors = [...db.visitors, remoteAddress];
      fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
        if (err) res.send({ result: "failed" });
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
      if (err) res.send(encryptData({ result: "failed" }));
      res.send(encryptData({ result: "success" }));
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
    db.posts = db.posts.filter((post) => post.id !== id);
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send({ result: "failed" });
      res.send({ result: "success" });
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
      if (err) res.send(encryptData({ result: "failed" }));
      res.send(encryptData({ result: "success" }));
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
    db.events = db.events.filter((event) => event.id !== id);
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send({ result: "failed" });
      res.send({ result: "success" });
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
      if (err) res.send(encryptData({ result: "failed" }));
      res.send(encryptData({ result: "success" }));
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
    db.headlines = db.headlines.filter((headline) => headline.id !== id);
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send({ result: "failed" });
      res.send({ result: "success" });
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
      if (err) res.send(encryptData({ result: "failed" }));
      res.send(encryptData({ result: "success" }));
    });
  });
});

app.post(`${resource}/resetEnquiry`, (req, res) => {
  fs.readFile(c, (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    db.enquiries.map((enquiry) => {
      enquiry.status = "read";
      return enquiry;
    });
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: "failed" }));
      res.send(encryptData({ result: "success" }));
    });
  });
});

app.post(`${resource}/deleteEnquiry`, (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const id = decryptData(req.body.id);
    db.enquiries = db.enquiries.filter((enquiry) => enquiry.id !== id);
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: "failed" }));
      res.send(encryptData({ result: "success" }));
    });
  });
});

app.post(`${resource}/updateTimeTable`, (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const timetable = decryptData(req.body.timetable);
    db.timetables.forEach((tt) => {
      if (tt.id === timetable.id) {
        tt.standard = timetable.standard;
        tt.hours = timetable.hours;
        tt.start = timetable.start;
        tt.startHour = timetable.startHour;
        tt.end = timetable.end;
        tt.endHour = timetable.endHour;
        tt.subjects = timetable.subjects;
      }
      return timetable;
    });
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: "failed" }));
      res.send(encryptData({ result: "success" }));
    });
  });
});

app.post(`${resource}/addTimeTable`, (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const index = decryptData(req.body.index);
    const timetable = decryptData(req.body.timetable);
    db.timetables = [...db.timetables.slice(0, index), timetable, ...db.timetables.slice(index)];
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: "failed" }));
      res.send(encryptData({ result: "success" }));
    });
  });
});

app.post(`${resource}/deleteTimeTable`, (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const id = decryptData(req.body.id);
    db.timetables = db.timetables.filter((timetable) => timetable.id !== id);
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: "failed" }));
      res.send(encryptData({ result: "success" }));
    });
  });
});

// Ensure upload directories exist
const createFolder = (folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
};

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      folder = "public/images/Posters";
    } else if (file.mimetype.startsWith("video/")) {
      folder = "public/videos";
    }
    createFolder(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const folderPathFile = path.join(__dirname, "public/images/Posters");
    const folderPathVideo = path.join(__dirname, "public/videos");
    if (file.mimetype.startsWith("image/")) {
      fs.readdir(folderPathFile, (err, files) => {
        if (err) {
          console.error("Error reading directory:", err);
          return cb(err);
        }
        const fileIds = files.filter((file) => {
          if (file.startsWith("image")) {
            return file.split(".")[0].substring(5);
          }
        });
        let randomId = Math.floor(Math.random() * 1000) + 1;
        while (fileIds.includes(randomId)) {
          randomId = Math.floor(Math.random() * 1000) + 1;
        }
        const extension = path.extname(file.originalname);
        const fileName = `image${randomId}${extension}`;
        cb(null, fileName);
      });
    } else if (file.mimetype.startsWith("video/")) {
      fs.readdir(folderPathVideo, (err, files) => {
        if (err) {
          console.error("Error reading directory:", err);
          return cb(err);
        }
        const fileIds = files.filter((file) => {
          if (file.startsWith("video")) {
            return file.split(".")[0].substring(5);
          }
        });
        let randomId = Math.floor(Math.random() * 1000) + 1;
        while (fileIds.includes(randomId)) {
          randomId = Math.floor(Math.random() * 1000) + 1;
        }
        const extension = path.extname(file.originalname);
        const fileName = `video${randomId}${extension}`;
        cb(null, fileName);
      });
    }
  },
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.post(`${resource}/addPoster`, upload.single("file"), (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    db = JSON.parse(data);
    const filename = req.file.filename;
    const id = Number(filename.split(".")[0].substring(5));
    const newPoster = {
      id: id,
      logo: `/images/Posters/${filename}`,
    };
    db.posters = [newPoster, ...db.posters];
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: "failed" }));
      res.send(encryptData({ result: "success" }));
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
    db.posters = db.posters.filter((poster) => poster.id !== id);
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: "failed" }));
      res.send(encryptData({ result: "success" }));
    });
  });
});

app.post(`${resource}/addVideo`, upload.single("file"), (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    db = JSON.parse(data);
    const filename = req.file.filename;
    const id = Number(filename.split(".")[0].substring(5));
    const newVideo = {
      id: id,
      logo: `/videos/${filename}`,
    };
    db.videos = [newVideo, ...db.videos];
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: "failed" }));
      res.send(encryptData({ result: "success" }));
    });
  });
});

app.post(`${resource}/deleteVideo`, (req, res) => {
  const folderPath = path.join(__dirname, "public/videos");
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).json({ error: "Failed to read directory" });
    }
    const id = decryptData(req.body.id);
    const fileToDelete = files.find((file) => file.startsWith(`video${id}`));
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
    db.videos = db.videos.filter((video) => video.id !== id);
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: "failed" }));
      res.send(encryptData({ result: "success" }));
    });
  });
});

app.post(`${resource}/addUser`, (req, res) => {
  fs.readFile("./src/database/watson.json", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    db = JSON.parse(data);
    const user = decryptData(req.body.user);
    db.users = [...db.users, user];
    fs.writeFile("./src/database/watson.json", JSON.stringify(db, null, 2), (err) => {
      if (err) res.send(encryptData({ result: "failed" }));
      res.send(encryptData({ result: "success" }));
    });
  });
});

// ---------- WATSON ----------

// app.listen(port, () => {
//   console.log(`listening at http://localhost:${port}`);
// });

https.createServer(options, app).listen(port, () => {
  console.log(`listening at https://localhost:${port}`);
});
