// file system module to perform file operations
const fs = require("fs");
const puppeteer = require("puppeteer");
const { createFile } = require("./lib");
const { rawTableData } = require("./lib/drill");
process.setMaxListeners(Infinity); // <== Important line
let bookingUrl = "https://www.omniglot.com/language/numbers/index.htm";
(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 926 });
    await page.goto(bookingUrl);

    // Get all available page links
    if (!fs.existsSync(`./bin/index.json`)) {
      let numeralLinks = await page.evaluate(() => {
        let links = [];

        let numeralLinks = document.querySelectorAll("ol p a[href]");

        numeralLinks.forEach(langElement => {
          links.push(langElement.href);
        });
        return links;
      });
      await createFile({ links: numeralLinks }, "./bin", "index.json");
    } else {
      console.log(
        "\x1b[33m%s\x1b[0m",
        `./bin/index.json already exists, processing next step`
      );
    }

    // Fetch each links data
    await fetchEachLangRawData("./bin", "index.json");
  } catch (err) {
    console.log(err);
  }
})();

// Fetch each Language data from ./bin/index.json
function fetchEachLangRawData(location, fileName) {
  try {
    if (`${location}/${fileName}` === undefined)
      throw `${location}/${fileName} is not exist !`;
    fs.readFile(`${location}/${fileName}`, async (err, dataRaw) => {
      if (err) throw err;
      let dataObj = JSON.parse(dataRaw);
      // console.log(dataObj.links);
      console.log("fetchEachLangRawData() fired !");
      // Fetch one link and get html
      for (let i = 0; i < dataObj.links.length; i++) {
        let exactName = `${
          dataObj.links[i]
            .split("/")
            [dataObj.links[i].split("/").length - 1].split(".")[0]
        }`;

        let exactPatch = `./bin/raw_data/${exactName.charAt(
          0
        )}/${exactName}.json`;
        if (!["z"].includes(exactName.charAt(0))) continue; // Get languages starts with d
        // if (fs.existsSync(exactPatch)) {
        //   // Continue if file exists
        //   console.log("\x1b[2m", `${exactPatch} exist !`);
        //   continue;
        // }

        // console.log(`Trying to get data from  ${dataObj.links[i]} `);
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 926 });
        await page.goto(dataObj.links[i], { waitUntil: "domcontentloaded" });

        // Get Each Page data
        let eachPage = await page
          .evaluate(() => {
            // Return rawTableData(document.querySelectorAll("table"));

            var table = document.querySelectorAll("table");
            if (table[0].rows !== undefined) {
              var data = [];
              var headers = [];
              for (var i = 0; i < table[0].rows[0].cells.length; i++) {
                headers[i] = table[0].rows[0].cells[i].innerHTML
                  .toLowerCase()
                  .replace(/ /gi, "");
              }
              for (var i = 1; i < table[0].rows.length; i++) {
                var tableRow = table[0].rows[i];
                var rowData = {};
                for (var j = 0; j < tableRow.cells.length; j++) {
                  rowData[headers[j]] = tableRow.cells[j].innerHTML
                    .replace("&nbsp;", "")
                    .replace(/[,\/]/g, "")
                    .split(" ")[0]
                    .split("(")[0];
                }
                data.push(rowData);
              }
              return data;
            } else {
              console.log("Broken link");
              return false;
            }
          })
          .catch(err => console.log(err.message));
        // check if eachPage has data
        if (eachPage) {
          await createFile(
            { data: eachPage },
            "./bin/raw_data",
            `${
              dataObj.links[i]
                .split("/")
                [dataObj.links[i].split("/").length - 1].split(".")[0]
            }.json`,
            { status: true }
          );
        } else {
          console.log("Not writing anything as the link is broken");
        }
        await page.close();
      }
      console.log("-------------- END-------------");
    });
  } catch (err) {
    console.log(
      "------------------------------------------------------Throw error !!"
    );
    throw err;
  }
}
