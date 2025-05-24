const http = require("node:http");
const fs = require("node:fs");

const port = 80;
const publicUrl = "./public";

http
  .createServer((req, res) => {
    console.log("Requesting file:", req.url);
    let filepath = req.url;
    let returnCode = 200;
    let contentType = "text/plain";

    switch (req.url) {
      case "/":
        filepath = "/index.html";
        contentType = "text/html";
        break;
      case "/about":
        filepath = "/about.html";
        contentType = "text/html";
        break;
      case "/styles/styles.css":
        contentType = "text/css";
        break;
      case "/js/loadDailyData.js":
        contentType = "text/javascript";
        break;
      case "/svg/astro.svg":
        contentType = "image/svg+xml";
        break;
      case "/favicon.ico":
        // Ignore favicon icon request
        console.log("Ignoring favicon request");

        res.writeHead(204); // No Content
        res.end();
        return;
    }

    // Load the relative path and return it
    fs.readFile(publicUrl + filepath, (err, data) => {
      if (err) {
        throw err;
      }

      res.writeHead(returnCode, { "Content-Type": contentType });
      res.end(data);
    });
  })
  .listen(port, () => console.log(`Server listening on port ${port}`));
