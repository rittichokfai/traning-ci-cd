const http = require("http");

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`
    <h1>🚀 สวัสดีครับ! CI/CD สำเร็จแล้ว!</h1>
    <p>แอปนี้ deploy อัตโนมัติด้วย GitHub Actions สู่ Google Cloud Run</p>
    <p>ตัวอย่างการคำนวณ: 2 + 3 = ${add(2, 3)}</p>
    <p>ตัวอย่างการคำนวณ: 10 - 4 = ${subtract(10, 4)}</p>
  `);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { add, subtract };