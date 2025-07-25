const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const contentTypes = require("./assets/contentTypes.json");
require("dotenv").config();

const port = process.env.PORT || 8080;
const publicUrl = process.env.PUBLIC_URL || "./public"; // relative to the working directory
const baseUrl = process.env.BASE_URL || "/index.html"; // page to load at url "/"
const errFolderUrl = process.env.ERR_FOLDER_URL || "./views"; // page to load at url "/"

http
  .createServer((req, res) => {
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
        console.log(err);

        // load error page
        const { filePath, returnCode } = getInfoOfErrorFile(err);

        fs.readFile(filePath, (errOnErr, errPage) => {
          if (errOnErr) {
            console.log(errOnErr);
          }

          res.writeHead(returnCode, { "Content-Type": "text/html" });
          res.end(errOnErr ? err : errPage);
        });

        return;
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

  return { filePath: path.join(__dirname, publicUrl, filePath), contentType };
}

function getInfoOfErrorFile(err) {
  const returnCode = err.code === "ENOENT" ? 404 : 500;
  const filePath = path.join(__dirname, errFolderUrl, `${returnCode}.html`);

  return { filePath, returnCode };
}
