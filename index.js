const http = require("http");
const fs = require("fs");
const path = require("path");

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    const htmlPath = path.join(__dirname, "public", "index.html");
    fs.readFile(htmlPath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading page");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
  } else {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>404 - Not Found</h1>");
  }
});

const PORT = process.env.PORT || 8080;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { add, subtract };