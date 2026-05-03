const CryptoJS = require("crypto-js");
const express = require("express");
const multer = require("multer");
const sarvamai = require("sarvamai");
const path = require("path");
const https = require("https");
const fs = require("fs");
const fsPromises = fs.promises;
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/videos", express.static(path.join(__dirname, "public/videos")));

require("dotenv").config();
const port = process.env.REACT_APP_PORT;
const secretKey = process.env.REACT_APP_SECRET_KEY;
const saravamaiApiKey = process.env.REACT_APP_SARVAMAI_API_KEY;

const options = {
  key: fs.readFileSync("./test.key"),
  cert: fs.readFileSync("./test.crt"),
};

// ==================== UTILITY FUNCTIONS ====================

const encryptData = (data) => CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
const decryptData = (encryptedData) => JSON.parse(CryptoJS.AES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8));

// Database paths
const JANGIRS_DB = path.resolve("./src/database/db.json");
const WATSON_DB = path.resolve("./src/database/watson.json");

// Generic database read/write helpers
const readDb = async (dbPath) => JSON.parse(await fsPromises.readFile(dbPath, "utf-8"));
const writeDb = async (dbPath, data) => fsPromises.writeFile(dbPath, JSON.stringify(data, null, 2), "utf-8");

// Generic database operation wrapper
const dbOperation = async (res, dbPath, operation, encrypt = false) => {
  try {
    const db = await readDb(dbPath);
    const result = await operation(db);
    if (result !== false) {
      await writeDb(dbPath, db);
    }
    res.send(encrypt ? encryptData({ result: "success" }) : { result: "success" });
  } catch (err) {
    console.error(err);
    res.send(encrypt ? encryptData({ result: "failed" }) : { result: "failed" });
  }
};

// Translation helper using Sarvam AI
let sarvamClient = null;
const getSarvamClient = () => {
  if (!sarvamClient) {
    sarvamClient = new sarvamai.SarvamAIClient({ apiSubscriptionKey: saravamaiApiKey });
  }
  return sarvamClient;
};

async function translateToHindi(text) {
  try {
    const response = await getSarvamClient().text.transliterate({
      input: text,
      source_language_code: "en-IN",
      target_language_code: "hi-IN",
      spoken_form: true,
    });
    return response.transliterated_text;
  } catch (e) {
    console.error("Translation error:", e);
    return text;
  }
}

// Translate and add to englishToHindi if not exists
async function translateAndStore(db, value, type) {
  if (!value) return;
  const key = value.toLowerCase();
  const mapping = db.englishToHindi[type];
  if (mapping && !mapping[key]) {
    mapping[key] = await translateToHindi(key);
  }
}

// Apply translations for member fields
async function applyMemberTranslations(db, member) {
  await Promise.all([translateAndStore(db, member.name, "names"), translateAndStore(db, member.village, "villages"), translateAndStore(db, member.gotra, "gotras")]);
}

// Village-based tree operation helper
const VILLAGES = ["dulania", "moruwa", "tatija"];
const applyToVillageTree = (db, village, operation) => {
  if (VILLAGES.includes(village)) {
    db[village] = db[village].map(operation);
  }
};

// ==================== TREE MANIPULATION FUNCTIONS ====================

const addMember = (tree, id, member, type) => {
  if (!tree) return null;
  if (tree.id === id) {
    const key = type === "child" ? "children" : type === "wife" ? "wives" : null;
    if (key) {
      tree[key] = tree[key] ? [...tree[key], member] : [member];
    }
    return tree;
  }
  tree.children?.forEach((child) => addMember(child, id, member, type));
  return tree;
};

const updateMemberFields = (target, source) => {
  const fields = ["name", "gender", "isAlive", "dob", "dod", "village", "gotra", "email", "mobile"];
  fields.forEach((field) => (target[field] = source[field]));
};

const editMember = (tree, member) => {
  if (!tree) return null;
  if (tree.id === member.id) updateMemberFields(tree, member);
  tree.children?.forEach((child) => {
    if (child.id === member.id) updateMemberFields(child, member);
    editMember(child, member);
  });
  tree.wives?.forEach((wife) => {
    if (wife.id === member.id) updateMemberFields(wife, member);
    editMember(wife, member);
  });
  return tree;
};

const deleteMemberById = (tree, id) => {
  if (!tree) return null;
  if (tree.children) tree.children = tree.children.filter((child) => child.id !== id);
  tree.children?.forEach((child) => deleteMemberById(child, id));
  if (tree.wives) tree.wives = tree.wives.filter((wife) => wife.id !== id);
  tree.wives?.forEach((wife) => deleteMemberById(wife, id));
  return tree;
};

// ==================== JANGIRS ENDPOINTS ====================

app.get("/getData", async (req, res) => {
  try {
    const db = await readDb(JANGIRS_DB);
    const remoteAddress = req.socket.remoteAddress?.split("::ffff:")[1] + "; " + new Date().toISOString().split("T")[0];
    const addressParts = remoteAddress.split(".");

    const isNewVisitor = !db.visitors.some((visitor) => {
      const parts = visitor.split(".");
      return parts[0] === addressParts[0] && parts[1] === addressParts[1] && parts[2] === addressParts[2];
    });

    if (isNewVisitor) {
      db.visitors.push(remoteAddress);
      await writeDb(JANGIRS_DB, db);
    }
    res.send(encryptData(db));
  } catch (err) {
    console.error(err);
    res.send({ result: "failed" });
  }
});

app.post("/addNewUser", async (req, res) => {
  try {
    const db = await readDb(JANGIRS_DB);
    const newUser = req.body;
    if (db.users.find((user) => user.username === newUser.username)) {
      return res.send({ result: "duplicate" });
    }
    db.users.push(newUser);
    await writeDb(JANGIRS_DB, db);
    res.send({ result: "success" });
  } catch (err) {
    console.error(err);
    res.send({ result: "failed" });
  }
});

app.post("/deleteUser", (req, res) => {
  dbOperation(res, JANGIRS_DB, (db) => {
    db.users = db.users.filter((user) => user.username !== req.body.username);
  });
});

app.post("/addNewMember", async (req, res) => {
  try {
    const db = await readDb(JANGIRS_DB);
    const { member: existingMember, newMember, type, village } = req.body;

    await applyMemberTranslations(db, newMember);
    applyToVillageTree(db, village, (m) => addMember(m, existingMember.id, newMember, type));

    await writeDb(JANGIRS_DB, db);
    res.send({ result: "success" });
  } catch (err) {
    console.error(err);
    res.send({ result: "failed" });
  }
});

app.post("/editMember", async (req, res) => {
  try {
    const db = await readDb(JANGIRS_DB);
    const { member: existingMember, village } = req.body;

    await applyMemberTranslations(db, existingMember);
    applyToVillageTree(db, village, (m) => editMember(m, existingMember));

    await writeDb(JANGIRS_DB, db);
    res.send({ result: "success" });
  } catch (err) {
    console.error(err);
    res.send({ result: "failed" });
  }
});

app.post("/deleteMember", (req, res) => {
  dbOperation(res, JANGIRS_DB, (db) => {
    const { id, village } = req.body;
    applyToVillageTree(db, village, (m) => deleteMemberById(m, id));
  });
});

// ==================== WATSON ENDPOINTS ====================

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const FEED_FIELDS = ["enquiries", "posts", "headlines", "events", "posters", "videos", "users"];
  setInterval(async () => {
    try {
      const db = await readDb(WATSON_DB);
      const feed = FEED_FIELDS.reduce((acc, key) => ({ ...acc, [key]: db[key] }), {});
      res.write(`data: ${encryptData(feed)}\n\n`);
    } catch (err) {
      console.error(err);
    }
  }, 10000);
});

const resource = "/api/watson";

app.get(`${resource}/data`, async (req, res) => {
  try {
    const db = await readDb(WATSON_DB);
    const remoteAddress = req.socket.remoteAddress?.split("::ffff:")[1];
    if (remoteAddress && !db.visitors.includes(remoteAddress)) {
      db.visitors.push(remoteAddress);
      await writeDb(WATSON_DB, db);
    }
    res.send(encryptData(db));
  } catch (err) {
    console.error(err);
    res.send({ result: "failed" });
  }
});

// Generic add/delete handlers for Watson collections
const watsonAddItem = (collection, bodyKey) => (req, res) => {
  dbOperation(
    res,
    WATSON_DB,
    (db) => {
      db[collection] = [decryptData(req.body[bodyKey]), ...db[collection]];
    },
    true,
  );
};

const watsonDeleteItem =
  (collection, useDecrypt = false) =>
  (req, res) => {
    dbOperation(
      res,
      WATSON_DB,
      (db) => {
        const id = useDecrypt ? decryptData(req.body.id) : req.body.id;
        db[collection] = db[collection].filter((item) => item.id !== id);
      },
      useDecrypt,
    );
  };

app.post(`${resource}/addFeedback`, watsonAddItem("posts", "feedback"));
app.post(`${resource}/deleteFeedback`, watsonDeleteItem("posts", false));
app.post(`${resource}/addEvent`, watsonAddItem("events", "event"));
app.post(`${resource}/deleteEvent`, watsonDeleteItem("events", false));
app.post(`${resource}/addHeadline`, watsonAddItem("headlines", "headline"));
app.post(`${resource}/deleteHeadline`, watsonDeleteItem("headlines", false));
app.post(`${resource}/addEnquiry`, watsonAddItem("enquiries", "enquiry"));
app.post(`${resource}/deleteEnquiry`, watsonDeleteItem("enquiries", true));

app.post(`${resource}/resetEnquiry`, (req, res) => {
  dbOperation(
    res,
    WATSON_DB,
    (db) => {
      db.enquiries.forEach((enquiry) => (enquiry.status = "read"));
    },
    true,
  );
});

app.post(`${resource}/updateTimeTable`, (req, res) => {
  dbOperation(
    res,
    WATSON_DB,
    (db) => {
      const timetable = decryptData(req.body.timetable);
      const existing = db.timetables.find((tt) => tt.id === timetable.id);
      if (existing) {
        Object.assign(existing, timetable);
      }
    },
    true,
  );
});

app.post(`${resource}/addTimeTable`, (req, res) => {
  dbOperation(
    res,
    WATSON_DB,
    (db) => {
      const index = decryptData(req.body.index);
      const timetable = decryptData(req.body.timetable);
      db.timetables.splice(index, 0, timetable);
    },
    true,
  );
});

app.post(`${resource}/deleteTimeTable`, (req, res) => {
  dbOperation(
    res,
    WATSON_DB,
    (db) => {
      const id = decryptData(req.body.id);
      db.timetables = db.timetables.filter((tt) => tt.id !== id);
    },
    true,
  );
});

// ==================== FILE UPLOAD CONFIGURATION ====================

const UPLOAD_PATHS = {
  image: { folder: "public/images/Posters", prefix: "image", logoPath: "/images/Posters" },
  video: { folder: "public/videos", prefix: "video", logoPath: "/videos" },
};

const createFolder = (folder) => {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
};

const generateUniqueFilename = async (folderPath, prefix, extension) => {
  const files = await fsPromises.readdir(folderPath);
  const existingIds = new Set(files.filter((f) => f.startsWith(prefix)).map((f) => parseInt(f.split(".")[0].substring(prefix.length))));
  let randomId;
  do {
    randomId = Math.floor(Math.random() * 1000) + 1;
  } while (existingIds.has(randomId));
  return `${prefix}${randomId}${extension}`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = file.mimetype.startsWith("image/") ? "image" : "video";
    const folder = UPLOAD_PATHS[type].folder;
    createFolder(folder);
    cb(null, folder);
  },
  filename: async (req, file, cb) => {
    try {
      const type = file.mimetype.startsWith("image/") ? "image" : "video";
      const { folder, prefix } = UPLOAD_PATHS[type];
      const folderPath = path.join(__dirname, folder);
      const extension = path.extname(file.originalname);
      const fileName = await generateUniqueFilename(folderPath, prefix, extension);
      cb(null, fileName);
    } catch (err) {
      cb(err);
    }
  },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Generic media add handler
const addMedia = (collection, type) => (req, res) => {
  dbOperation(
    res,
    WATSON_DB,
    (db) => {
      const filename = req.file.filename;
      const id = Number(filename.split(".")[0].substring(UPLOAD_PATHS[type].prefix.length));
      const newMedia = { id, logo: `${UPLOAD_PATHS[type].logoPath}/${filename}` };
      db[collection] = [newMedia, ...db[collection]];
    },
    true,
  );
};

// Generic media delete handler
const deleteMedia = (collection, type) => async (req, res) => {
  try {
    const id = decryptData(req.body.id);
    const folderPath = path.join(__dirname, UPLOAD_PATHS[type].folder);
    const files = await fsPromises.readdir(folderPath);
    const fileToDelete = files.find((f) => f.startsWith(`${UPLOAD_PATHS[type].prefix}${id}`));

    if (fileToDelete) {
      await fsPromises.unlink(path.join(folderPath, fileToDelete));
    }

    const db = await readDb(WATSON_DB);
    db[collection] = db[collection].filter((item) => item.id !== id);
    await writeDb(WATSON_DB, db);

    res.send(encryptData({ result: "success" }));
  } catch (err) {
    console.error(err);
    res.send(encryptData({ result: "failed" }));
  }
};

app.post(`${resource}/addPoster`, upload.single("file"), addMedia("posters", "image"));
app.post(`${resource}/deletePoster`, deleteMedia("posters", "image"));
app.post(`${resource}/addVideo`, upload.single("file"), addMedia("videos", "video"));
app.post(`${resource}/deleteVideo`, deleteMedia("videos", "video"));

app.post(`${resource}/addUser`, (req, res) => {
  dbOperation(
    res,
    WATSON_DB,
    (db) => {
      db.users.push(decryptData(req.body.user));
    },
    true,
  );
});

// ==================== SERVER STARTUP ====================

https.createServer(options, app).listen(port, () => {
  console.log(`Server running at https://localhost:${port}`);
});
