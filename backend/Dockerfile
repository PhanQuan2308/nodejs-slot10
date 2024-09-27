# Sử dụng image Node.js chính thức
FROM node:14

# Tạo thư mục làm việc trong container
WORKDIR /usr/src/app

# Copy package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose cổng mà ứng dụng sẽ chạy
EXPOSE 5000

# Chạy ứng dụng
CMD ["node", "app.js"]
