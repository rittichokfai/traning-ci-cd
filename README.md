# 📖 คู่มือ CI/CD: GitHub Actions → Google Cloud Run (ฉบับสมบูรณ์)

คู่มือนี้สอนการตั้งค่าระบบ CI/CD ตั้งแต่เริ่มต้นจนถึง Deploy อัตโนมัติ ทดสอบจริงแล้วใช้งานได้ 100%

---

## ⚡ สรุปภาพรวม

เมื่อคุณ `git push` → GitHub จะ **ทดสอบโค้ด** → **แพ็คเป็น Docker** → **ส่งขึ้น Google Cloud** → **แจ้งเตือน Discord** พร้อมลิงก์เว็บ

---

## 🔵 ตอนที่ 1: เปิด API ใน Google Cloud Console (4 ตัว)

ไปที่ [Google Cloud Console](https://console.cloud.google.com) แล้วเปิด API ทุกตัวข้างล่างนี้:

1. ที่ช่อง Search ด้านบน พิมพ์ชื่อ API → กดเข้าไป → กดปุ่ม **"ENABLE"**

| #   | ชื่อ API                                | ทำไมต้องเปิด              |
| --- | --------------------------------------- | ------------------------- |
| 1   | **Artifact Registry API**               | เก็บ Docker Image         |
| 2   | **Cloud Run Admin API**                 | รันแอปบน Cloud            |
| 3   | **IAM Service Account Credentials API** | ให้ GitHub คุยกับ GCP ได้ |
| 4   | **Cloud Resource Manager API**          | จัดการ Project            |

---

## 📦 ตอนที่ 2: สร้างที่เก็บ Docker Image (Artifact Registry)

1. เมนูสามขีด (ซ้ายบน) → **Artifact Registry** → **Repositories**
2. กดปุ่ม **"+ CREATE REPOSITORY"**
3. ตั้งค่า:
   - **Name:** `my-repo`
   - **Format:** `Docker`
   - **Mode:** `Standard`
   - **Location Type:** `Region`
   - **Region:** `asia-southeast1 (Singapore)`
4. กดปุ่ม **"CREATE"**

---

## 👤 ตอนที่ 3: สร้าง Service Account ให้ GitHub

### 3.1 สร้างบัญชี

1. เมนูสามขีด → **IAM & Admin** → **Service Accounts**
2. กด **"+ CREATE SERVICE ACCOUNT"**
3. ตั้งชื่อ: `github-deployer` → กด **"CREATE AND CONTINUE"**

### 3.2 มอบสิทธิ์ (ต้องครบ 4 อย่าง!)

กด **Select a role** แล้วเลือกทีละอย่าง (กด **"+ ADD ANOTHER ROLE"** เพื่อเพิ่ม):

| #   | Role                         | หน้าที่           |
| --- | ---------------------------- | ----------------- |
| 1   | **Cloud Run Admin**          | จัดการ Deploy     |
| 2   | **Storage Admin**            | อัปโหลดไฟล์       |
| 3   | **Artifact Registry Writer** | Push Docker Image |
| 4   | **Service Account User**     | สิทธิ์ Run ตัวเอง |

กด **"CONTINUE"** → **"DONE"**

---

## 🔑 ตอนที่ 4: สร้างไฟล์กุญแจ (JSON Key)

1. ในหน้า Service Accounts คลิกที่ชื่อ **`github-deployer`**
2. คลิกแถบ **"KEYS"** ด้านบน
3. กด **"ADD KEY"** → **"Create new key"** → เลือก **"JSON"** → กด **"CREATE"**
4. ไฟล์ `.json` จะโหลดลงเครื่อง

> ⚠️ **ถ้ากดสร้าง Key แล้วขึ้น Error:**
> ไปที่ **IAM & Admin** → **Organization Policies** → ค้นหา `disableServiceAccountKeyCreation`
> → กด **EDIT POLICY** → **Customize** → ตั้ง Enforcement เป็น **Off** → **SAVE**
> → รอ 1 นาที แล้วกลับมาสร้าง Key ใหม่

> ⚠️ **สำคัญ:** ห้าม commit ไฟล์ `.json` ขึ้น GitHub เด็ดขาด! Google จะ Revoke Key อัตโนมัติ!

---

## 🟢 ตอนที่ 5: ตั้งค่า GitHub Secrets

1. ไปที่ GitHub Repository → **Settings** → **Secrets and variables** → **Actions**
2. กดปุ่ม **"New repository secret"** แล้วเพิ่ม 3 ค่า:

| Name              | Value                                          |
| ----------------- | ---------------------------------------------- |
| `GCP_PROJECT_ID`  | ไอดีโปรเจกต์ (ดูได้ที่หน้า GCP Console)        |
| `GCP_SA_KEY`      | เปิดไฟล์ `.json` แล้ว Copy เนื้อหาทั้งหมดมาวาง |
| `DISCORD_WEBHOOK` | ลิงก์ Webhook จากห้อง Discord                  |

> 💡 **Tip:** ใช้ GitHub CLI จะง่ายกว่าด้วยคำสั่ง:
>
> ```bash
> cat ชื่อไฟล์.json | gh secret set GCP_SA_KEY --repo ชื่อ-repo
> ```

---

## 🛠️ ตอนที่ 6: เตรียมไฟล์โค้ดในโปรเจกต์

### 6.1 Dockerfile

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD [ "node", "index.js" ]
```

### 6.2 index.js (ต้องมี Web Server!)

```javascript
const http = require("http");
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end("<h1>สวัสดีครับ! CI/CD สำเร็จแล้ว!</h1>");
});
const PORT = process.env.PORT || 8080;
if (require.main === module) {
  server.listen(PORT);
}
module.exports = {
  /* export ฟังก์ชันต่างๆ */
};
```

> ⚠️ **สำคัญ:** ต้องใช้ `require.main === module` เพื่อไม่ให้ Jest ค้างตอนรัน Test

### 6.3 .gitignore (ป้องกัน Key หลุด)

```
node_modules
project-*.json
```

---

## 🚀 ตอนที่ 7: ทดสอบระบบ

```bash
git add .
git commit -m "deploy to cloud run"
git push
```

### ดูผลลัพธ์ได้ 3 ที่:

1. **Discord** — บอทจะส่งลิงก์มาให้กดเปิด
2. **GitHub → Actions** → คลิก Run ล่าสุด → ดู Job `deploy`
3. **Google Cloud → Cloud Run** → คลิก Service `my-node-app` → ดู URL

---

## ❓ สรุปปัญหาที่พบบ่อยและวิธีแก้

| ปัญหา                     | สาเหตุ                                  | วิธีแก้                             |
| ------------------------- | --------------------------------------- | ----------------------------------- |
| Invalid JWT Signature     | Key ถูก Commit ไป GitHub แล้วถูก Revoke | สร้าง Key ใหม่ + เพิ่ม `.gitignore` |
| SERVICE_DISABLED (403)    | ยังไม่เปิด API                          | เปิด API ตาม ตอนที่ 1               |
| Permission actAs denied   | ขาดสิทธิ์ Service Account User          | เพิ่ม Role ตาม ตอนที่ 3.2           |
| Container failed to start | ไม่มี Web Server ฟัง Port 8080          | เพิ่ม HTTP Server ตาม ตอนที่ 6.2    |
| Jest hangs                | Server ค้าง                             | ใส่ `require.main === module`       |
