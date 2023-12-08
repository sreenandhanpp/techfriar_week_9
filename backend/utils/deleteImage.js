const fs = require("fs");
const path = require("path");

function deleteImage(filename) {
  const imagePath = path.join(__dirname, "../uploads", filename);
  fs.unlink(imagePath, (err) => {});
}

module.exports = deleteImage;
