function importAll(r) {
  return r.keys().map(key => {
    const fileName = key.replace("./", ""); // e.g. "1.jpg"
    return {
      id: Number(fileName.split(".")[0]), // 1
      src: require(`../images/${fileName}`) // require each image
    };
  });
}

// Scan images folder for jpg/png/webp
export const IMAGES = importAll(
  require.context("../images", false, /\.(png|jpe?g|webp)$/)
);