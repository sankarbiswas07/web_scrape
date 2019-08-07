// file system module to perform file operations
const fs = require("fs");

// Write file
module.exports = {
  // Create File to actual location
  createFile(data, location, fileName, subFolder = { status: false }) {
    // File Path
    let path = "";
    if (subFolder.status) {
      path = `${location}/${fileName.charAt(0)}`;
    }
    //Make sure file exist
    fs.existsSync(path) ? "" : fs.promises.mkdir(path, { recursive: true });

    fs.writeFile(`${path}/${fileName}`, JSON.stringify(data), "utf8", function(
      err
    ) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }
      console.log(`${path}/${fileName} file has been saved.`);
    });
  },

  // Read File
  readFile(location, fileName) {
    fs.readFile(`${location}/${fileName}`, (err, dataRaw) => {
      if (err) throw err;
      let dataObj = JSON.parse(dataRaw);
      console.log(dataObj);
    });
  }
};
