const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(express.json());

require("dotenv").config();

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Cấu hình Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    project_id: process.env.FIREBASE_PROJECT_ID,
  }),
  storageBucket: "nodejs-crud-61f88.appspot.com",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
const collection = db.collection("products");

// Cấu hình Multer để lưu tạm ảnh trên server trước khi upload lên Firebase

// 1. Thêm sản phẩm (POST /add-product)
app.post("/add-product", async (req, res) => {
  try {
    const { name, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    const fileName = `${uuidv4()}-${file.originalname}`;

    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.mimetype,
    });

    blobStream.on("error", (err) => {
      console.error("Error uploading file:", err);
      res.status(500).send({ message: "Error uploading image" });
    });

    blobStream.on("finish", async () => {
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      await blob.makePublic();

      // Lưu sản phẩm vào 'products'
      const docRef = await db.collection("products").add({
        name,
        description,
        imageUrl,
      });

      res.status(201).send({ id: docRef.id, name, description, imageUrl });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).send("Error creating product: " + error.message);
  }
});

// 2. Lấy tất cả sản phẩm (GET /products)
app.get("/products", async (req, res) => {
  try {
    const snapshot = await collection.get();
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).send("Error getting products: " + error.message);
  }
});

// 3. Lấy sản phẩm theo ID (GET /product/:id)
app.get("/product/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const productDoc = await collection.doc(productId).get();
    if (!productDoc.exists) {
      return res.status(404).send("Product not found");
    }
    return res.status(200).json({ id: productDoc.id, ...productDoc.data() });
  } catch (error) {
    return res.status(500).send("Error getting product: " + error.message);
  }
});

// 4. Sửa sản phẩm (PUT /product/:id)

// 4. Sửa sản phẩm (PUT /product/:id)
app.put("/product/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, description } = req.body;
    const file = req.file;
    let imageUrl;

    // Lấy thông tin sản phẩm hiện tại từ Firestore để xóa ảnh cũ
    const productDoc = await db.collection("products").doc(req.params.id).get();
    if (!productDoc.exists) {
      return res.status(404).send("Product not found");
    }
    const currentData = productDoc.data();
    const oldImageUrl = currentData.imageUrl;

    if (file) {
      const fileName = `${uuidv4()}-${file.originalname}`;

      // Tạo blob stream để tải file lên Firebase Storage
      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
      });

      blobStream.on("error", (err) => {
        console.error("Error uploading file:", err);
        return res.status(500).send({ message: "Error uploading image" });
      });

      blobStream.on("finish", async () => {
        imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        await blob.makePublic();

        // Xóa ảnh cũ trong Firebase Storage nếu có
        if (oldImageUrl) {
          const oldFileName = oldImageUrl.split("/").pop();
          await bucket.file(oldFileName).delete();
        }

        // Cập nhật URL ảnh mới trong Firestore
        const updatedData = { name, description, imageUrl };
        await db.collection("products").doc(req.params.id).update(updatedData);
        return res
          .status(200)
          .send({ message: "Product updated successfully", imageUrl });
      });

      blobStream.end(file.buffer);
    } else {
      // Nếu không có file mới, chỉ cập nhật tên và mô tả
      const updatedData = { name, description };
      await db.collection("products").doc(req.params.id).update(updatedData);
      return res.status(200).send({ message: "Product updated successfully" });
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).send("Error updating product: " + error.message);
  }
});

// 5. Xóa sản phẩm (DELETE /product/:id)
app.delete("/product/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    await collection.doc(productId).delete();
    return res.status(200).send("Product deleted successfully");
  } catch (error) {
    return res.status(500).send("Error deleting product: " + error.message);
  }
});
// API đơn giản để kiểm tra xem ứng dụng có chạy hay không
app.get("/", (req, res) => {
  res.status(200).send("Docker is running and the backend is working!");
});

// Lắng nghe trên cổng 5000
const port = 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
