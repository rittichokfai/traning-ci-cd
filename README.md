# 🌐 คู่มือการตั้งค่า Google Cloud แบบละเอียด (Step-by-Step)

ยินดีต้อนรับสู่คู่มือการเซ็ตอัพ Google Cloud สำหรับระบบ CI/CD ครับ คู่มือนี้จะบอก "ทุกคลิก" ที่คุณต้องกด เพื่อให้ระบบทำงานได้สมบูรณ์

---

## �️ ขั้นตอนที่ 1: เปิดใช้งาน API ที่จำเป็น

ก่อนเริ่ม เราต้องบอก Google Cloud ให้เปิด "ฟีเจอร์" ที่เราจะใช้ก่อนครับ

1. เข้าไปที่หน้า **[Google Cloud Console](https://console.cloud.google.com/)**
2. ที่ช่องค้นหาด้านบน (Search) พิมพ์คำว่า **"Artifact Registry API"** แล้วกดเลือก
3. หากปุ่มเป็นสีฟ้าชื่อ **"ENABLE"** ให้กดเปิดใช้งาน (ถ้ารันอยู่แล้วจะขึ้นว่า API Enabled)
4. ทำซ้ำแบบเดิมกับ **"Cloud Run API"** ครับ

---

## 📦 ขั้นตอนที่ 2: ตั้งค่าที่เก็บโค้ด (Artifact Registry)

นี่คือ "โกดัง" ที่จะเก็บแอปของเราที่ถูกแพ็คแล้วครับ

1. กดที่เมนูสามขีด (มุมซ้ายบน) -> เลื่อนหา **[Artifact Registry]** -> **[Repositories]**
2. คลิกปุ่ม **"+ CREATE REPOSITORY"** ที่แถบเมนูด้านบน
3. **การตั้งค่า:**
   - **Name:** พิมพ์ชื่อ `my-repo` (ต้องตัวเล็กหมด)
   - **Format:** เลือก `Docker`
   - **Mode:** เลือก `Standard`
   - **Location Type:** เลือก `Region`
   - **Region:** หาคำว่า `asia-southeast1 (Singapore)`
4. เลื่อนลงไปด้านล่างสุด คลิกปุ่มสีฟ้า **"CREATE"**
5. รอสักครู่ คุณจะเห็น `my-repo` ปรากฏขึ้นในรายการครับ

---

## 👤 ขั้นตอนที่ 3: สร้างไอดีให้ GitHub (Service Account)

เราต้องสร้าง "กุญแจ" ให้ GitHub เข้ามาสั่งงานแทนเราได้ครับ

### 3.1 สร้างบัญชีรายชื่อ

1. ไปที่เมนู (สามขีด) -> **[IAM & Admin]** -> **[Service Accounts]**
2. คลิกปุ่ม **"+ CREATE SERVICE ACCOUNT"**
3. **Service account name:** พิมพ์ว่า `github-deployer`
4. คลิกปุ่ม **"CREATE AND CONTINUE"** (ไม่ต้องกรอก ID มันจะขึ้นให้เอง)

### 3.2 มอบสิทธิ์ (สำคัญมาก!)

ในข้อ **Grant this service account access to project**, คลิกที่ช่อง **Select a role** แล้วเลือกทีละอย่างดังนี้:

1. พิมพ์ค้นหา `Cloud Run Admin` -> กดเลือก
2. คลิกปุ่ม **"+ ADD ANOTHER ROLE"**
3. พิมพ์ค้นหา `Storage Admin` -> กดเลือก
4. คลิกปุ่ม **"+ ADD ANOTHER ROLE"**
5. พิมพ์ค้นหา `Artifact Registry Writer` -> กดเลือก
6. เมื่อได้ครบ 3 สิทธิ์แล้ว คลิกปุ่ม **"CONTINUE"** แล้วกด **"DONE"**

---

## 🔑 ขั้นตอนที่ 4: สร้างไฟล์กุญแจ (JSON Key)

1. ในหน้า Service Accounts หาชื่อ **`github-deployer@...`** ที่เพิ่งสร้าง แล้วคลิกที่ชื่อนั้น
2. คลิกแถบเมนูข้างบนชื่อ **"KEYS"** (อยู่ระหว่าง Permissions และ Metrics)
3. คลิกปุ่ม **"ADD KEY"** -> เลือก **"Create new key"**
4. เลือกรูปแบบเป็น **"JSON"** แล้วคลิกปุ่ม **"CREATE"**
5. **รอดูผล:** จะมีไฟล์ชื่อยาวๆ ลงท้ายด้วย `.json` โหลดลงคอมพิวเตอร์ของคุณ
   - **คำเตือน:** ห้ามส่งไฟล์นี้ให้ใคร และห้าม Push ขึ้น GitHub นะครับ!

---

## 🛡️ ขั้นตอนที่ 5: วิธีแก้ปัญหาหากกดสร้าง Key ไม่ได้

หากคุณกด Add Key แล้วขึ้น Error สีแดงว่าถูกบล็อกด้วยนโยบาย (Organization Policy):

1. ไปที่เมนู **[IAM & Admin]** -> **[Organization Policies]**
2. ในช่อง Filter พิมพ์คำว่า: `disableServiceAccountKeyCreation`
3. คลิกที่ชื่อนโยบายที่ปรากฏขึ้น
4. คลิกปุ่ม **"EDIT POLICY"** ที่แถบด้านบน
5. ในส่วน **Applies to**, เลือก **"Customize"**
6. ใต้คำว่า **Policy rules**, ถ้ามีกฎอยู่แล้วให้กดแก้ไข หรือกด **"Add a rule"**
7. เลือก **Enforcement** เป็น **"Off"** แล้วกด **"Done" และ "SAVE"**
8. รอประมาณ 1 นาที แล้วกลับไปทำ **ขั้นตอนที่ 4** อีกครั้งครับ

---

## 🚀 ขั้นตอนที่ 6: เอาไปใส่ใน GitHub

1. เปิดไฟล์ `.json` ที่โหลดมาด้วย Notepad หรือ VS Code แล้วก๊อปปี้เนื้อหาทั้งหมด
2. ไปที่ GitHub Repo -> **Settings** -> **Secrets and variables** -> **Actions**
3. สร้าง **New repository secret** ชื่อ `GCP_SA_KEY` แล้ววางค่าที่ก๊อปมาลงไปครับ

---

### 🎉 เสร็จสมบูรณ์!

ตอนนี้ Google Cloud ของคุณพร้อมที่จะรับคำสั่งจาก GitHub แล้วครับ! คุณสามารถลอง `git push` เพื่อดูอาคมนี้ทำงานได้เลย!
