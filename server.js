const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const contentTypes = require("./assets/contentTypes.json");

const port = 80;
const publicUrl = "./public"; // relative to the working directory
const baseUrl = "/index.html"; // page to load at url "/"

http
  .createServer((req, res) => {
    console.log("Requesting file:", req.url);

    // Ignore favicon icon request
    if (req.url == "/favicon.ico") {
      console.log("Ignoring favicon request");

      res.writeHead(204); // No Content
      res.end();
      return;
    }

    const { filePath, contentType } = getInfoOfFileToGet(req.url);

    // Load the file at the path (relative the the working directory) and return it
    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      }

      res.writeHead(200, { "Content-Type": contentType }); // OK
      res.end(data);
    });
  })
  .listen(port, () => console.log(`Server listening on port ${port}`));

function getInfoOfFileToGet(reqUrl) {
  const url = reqUrl === "/" ? baseUrl : reqUrl;

  const urlExt = path.extname(url);
  const fileExt = urlExt || ".html"; // default extension is .html

  const filePath = urlExt == "" ? url + fileExt : url;

  const contentType = contentTypes[fileExt];

  return { filePath: publicUrl + filePath, contentType };
}
