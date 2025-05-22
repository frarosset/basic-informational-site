const http = require("node:http");
const fs = require("node:fs");

port = 80;

http
  .createServer((req, res) => {
    console.log("Requesting file:", req.url);

    switch (req.url) {
      case "/":
        // Load the index page and return it
        fs.readFile("./public/index.html", (err, data) => {
          if (err) {
            throw err;
          }

          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        });
        break;
      case "/favicon.ico":
        // Ignore favicon icon request
        console.log("Ignoring favicon request");

        res.writeHead(204); // No Content
        res.end();
        return;
    }
  })
  .listen(port, () => console.log(`Server listening on port ${port}`));
