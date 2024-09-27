# Sử dụng Node.js để build và chạy React
FROM node:14

# Tạo thư mục làm việc
WORKDIR /usr/src/app

# Copy package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose cổng 3000
EXPOSE 3000

# Chạy ứng dụng React ở chế độ phát triển
CMD ["npm", "start"]
