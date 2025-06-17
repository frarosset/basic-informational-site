const express = require("express");
const path = require("node:path");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 8080;
const publicUrl = process.env.PUBLIC_URL || "./public"; // relative to the working directory
const indexUrl = process.env.BASE_URL || "/index.html"; // page to load at url "/"
const errFolderUrl = process.env.ERR_FOLDER_URL || "./views"; // page to load at url "/"

// Middleware to handle user navigation requests to indexUrl (redirect to "/")
app.get([indexUrl, getUrlWithoutExt(indexUrl)], (req, res) => {
  res.redirect(301, "/");
});

// Middleware to handle user navigation requests to public files
app.use((req, res, next) => {
  const secFetchMode = req.get("sec-fetch-mode");
  const ext = path.extname(req.path);

  if (secFetchMode == "navigate" && ext != "") {
    if (ext == ".html") {
      const redirectPath = getUrlWithoutExt(req.path);

      res.redirect(301, redirectPath);
    } else {
      const err = new Error("File not found");
      err.code = "ENOENT";

      throw err;
    }
  } else {
    next();
  }
});

// Serve static files (HTML, CSS, JS)
const absPublicUrl = path.join(__dirname, publicUrl);
app.use(
  express.static(absPublicUrl, { extensions: ["html"], index: indexUrl })
);

// Ignore favicon icon / ... request
app.get(
  ["/favicon.ico", "/.well-known/appspecific/com.chrome.devtools.json"],
  (req, res) => {
    console.log(`Ignoring request of ${req.path}`);
    res.sendStatus(204); // No Content
  }
);

// catch-all route throwing an ENOENT error (404 error)
// see https://stackoverflow.com/questions/34696848/correct-way-to-handle-404-and-500-errors-in-express
app.use((req, res, next) => {
  const err = new Error("File not found");
  err.code = "ENOENT";
  throw err;
});

// Error handling (404, 500)
// see https://stackoverflow.com/questions/34696848/correct-way-to-handle-404-and-500-errors-in-express
app.use((err, req, res, next) => {
  console.log(err);

  // load error page (and handle possible errors on reading files)
  const { filePath, returnCode } = getInfoOfErrorFile(err);

  res
    .status(returnCode)
    .sendFile(path.join(__dirname, errFolderUrl, filePath), (errOnErr) => {
      if (errOnErr) res.sendStatus(returnCode);
    });
});

app.listen(port, () => console.log(`Server listening on port ${port}`));

function getInfoOfErrorFile(err) {
  const returnCode = err.code === "ENOENT" ? 404 : 500;
  const filePath = `/${returnCode}.html`;

  return { filePath, returnCode };
}

function getUrlWithoutExt(url) {
  return url.slice(0, url.length - path.extname(url).length);
}
