import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaTrash } from "react-icons/fa";
import "./productApp.scss";

function ProductApp() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // Hiển thị ảnh xem trước
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (image) {
      formData.append("image", image); // Chỉ thêm ảnh nếu có ảnh mới
    }
  
    try {
      if (editingProductId) {
        // Nếu đang chỉnh sửa, gửi request update
        await axios.put(`http://localhost:5000/product/${editingProductId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        // Sau khi chỉnh sửa, fetch lại danh sách sản phẩm để cập nhật ảnh mới
        const response = await axios.get("http://localhost:5000/products");
        setProducts(response.data);
  
        alert("Product updated successfully");
        setEditingProductId(null);
      } else {
        // Thêm sản phẩm mới
        const response = await axios.post("http://localhost:5000/add-product", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setProducts([...products, response.data]);
        alert("Product added successfully");
      }
  
      // Reset form
      setName("");
      setDescription("");
      setImage(null);
      setPreviewImage(null);
    } catch (error) {
      console.error("Error adding/updating product:", error);
      alert("Error adding/updating product");
    }
  };
  
  

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreviewImage(null);
    }
  };

  // Xử lý khi xóa sản phẩm
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/product/${id}`);
      setProducts(products.filter((product) => product.id !== id));
      alert("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product");
    }
  };

  // Xử lý khi nhấn nút edit
  const handleEdit = (product) => {
    setName(product.name);
    setDescription(product.description);
    setPreviewImage(product.imageUrl); // Hiển thị ảnh cũ
    setImage(null); // Xóa ảnh hiện tại trong input, nhưng vẫn giữ ảnh preview
    setEditingProductId(product.id); // Lưu ID sản phẩm đang chỉnh sửa
  };

  return (
    <div className="products-container">
      {/* Form thêm sản phẩm */}
      <div className="header-products-container">
        <div className="title-header-container">
          <div className="title-main">
            <p>Tree Shop</p>
          </div>
          <div className="title-sub">
            <p>About me</p>
          </div>
        </div>
        <div className="form-input-info-container">
          <div className="image-main-container">
            {previewImage ? (
              <img src={previewImage} alt="Preview" width="200" />
            ) : (
              <p>No image selected</p>
            )}
          </div>
          <div className="form-main-container">
            <div className="title-form-container">
              <p>Tree Shop</p>
            </div>
            <div className="form-details">
              <form onSubmit={handleSubmit}>
                <div className="input-info">
                  <label>Tree Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="input-info">
                  <label>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="image-upload-container">
                  <div className="image-path">
                    <input
                      type="text"
                      value={image ? image.imageUrl : ""} // Không thể hiển thị URL ảnh cũ ở đây
                      placeholder="No file chosen"
                      readOnly
                    />
                  </div>
                  <div className="upload-button">
                    <input
                      type="file"
                      onChange={handleImageChange}
                      id="file-upload"
                      style={{ display: "none" }}
                    />
                    <label htmlFor="file-upload" className="browse-button">
                      Browse
                    </label>
                  </div>
                </div>
                <div className="submit-button-container">
                  <div className="button-submit">
                    <button type="submit">
                      <p>{editingProductId ? "Update" : "Add"}</p> {/* Thay đổi nút từ "Add" sang "Update" */}
                    </button>
                  </div>
                  <div className="button-cancel">
                    <button
                      type="reset"
                      onClick={() => {
                        setName("");
                        setDescription("");
                        setImage(null);
                        setPreviewImage(null);
                        setEditingProductId(null); // Reset trạng thái chỉnh sửa
                      }}
                    >
                      <p>Reset</p>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng hiển thị sản phẩm */}
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Name</th>
            <th>Image</th>
            <th>Description</th>
            <th>Actions</th> {/* Cột cho các thao tác */}
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.id}>
              <td>{index + 1}</td>
              <td>{product.name}</td>
              <td>
                <img
                  src={product.imageUrl} // Hiển thị ảnh từ backend
                  alt={product.name}
                  width="50"
                />
              </td>
              <td>{product.description}</td>
              <td className="edit-delete-icons">
                <FaPencilAlt className="edit-icon" onClick={() => handleEdit(product)} />
                <FaTrash className="delete-icon" onClick={() => handleDelete(product.id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductApp;
