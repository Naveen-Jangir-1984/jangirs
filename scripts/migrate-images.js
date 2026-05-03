/**
 * Migration script to copy member images from src/images to public/images/Members
 * Run this once to migrate existing images to server-served directory
 *
 * Usage: node scripts/migrate-images.js
 */
const fs = require("fs");
const path = require("path");

const SOURCE_DIR = path.join(__dirname, "..", "src", "images");
const DEST_DIR = path.join(__dirname, "..", "public", "images", "Members");

// Files to exclude (non-member images)
const EXCLUDE_FILES = ["add.png", "addMember.png", "bgd.jpg", "birth.png", "close.png", "death.png", "delete.png", "editMember.png", "email.png", "female.png", "male.png", "mata-mandir.jpg", "member.png", "minus.png", "mobile.jpg", "plus.png", "signout.png", "sms.png", "user.png", "upload.svg"];

const migrateImages = () => {
  console.log("Starting image migration...");
  console.log(`Source: ${SOURCE_DIR}`);
  console.log(`Destination: ${DEST_DIR}`);

  // Ensure destination directory exists
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
    console.log("Created destination directory");
  }

  // Read source directory
  const files = fs.readdirSync(SOURCE_DIR);

  let copied = 0;
  let skipped = 0;

  files.forEach((file) => {
    // Skip non-image files and excluded files
    if (EXCLUDE_FILES.includes(file)) {
      console.log(`Skipping: ${file} (excluded)`);
      skipped++;
      return;
    }

    // Only copy files that look like member IDs (numeric filenames)
    const baseName = path.basename(file, path.extname(file));
    if (!/^\d+$/.test(baseName)) {
      console.log(`Skipping: ${file} (non-numeric name)`);
      skipped++;
      return;
    }

    const sourcePath = path.join(SOURCE_DIR, file);
    const destPath = path.join(DEST_DIR, file);

    // Skip if already exists in destination
    if (fs.existsSync(destPath)) {
      console.log(`Skipping: ${file} (already exists)`);
      skipped++;
      return;
    }

    // Copy file
    fs.copyFileSync(sourcePath, destPath);
    console.log(`Copied: ${file}`);
    copied++;
  });

  console.log("\n--- Migration Complete ---");
  console.log(`Copied: ${copied} files`);
  console.log(`Skipped: ${skipped} files`);
  console.log("\nMember images are now served from: /images/Members/");
};

migrateImages();
