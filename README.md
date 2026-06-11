# 🏨 LuxuryHotel — Website Quản Lý Khách Sạn

Hệ thống quản lý khách sạn đầy đủ chức năng, xây dựng theo kiến trúc **MVC phân lớp** với **Node.js + Express + EJS + MySQL**.

Hỗ trợ **3 vai trò**: Khách hàng · Lễ tân · Quản trị viên.

---

## ✨ Chức năng chính

### 👤 Khách hàng
- Trang chủ sang trọng, xem danh sách phòng (lọc giá/sức chứa, sắp xếp, phân trang)
- Chi tiết phòng: gallery ảnh, tiện nghi, đánh giá
- **Đặt phòng trực tuyến**: chọn ngày, dịch vụ thêm, mã khuyến mãi, tính tiền trực tiếp
- Đăng ký / đăng nhập, hồ sơ cá nhân, đổi mật khẩu, đổi ảnh đại diện
- Xem & hủy đơn đặt phòng, **đánh giá** sau khi trả phòng
- Trang dịch vụ, khuyến mãi, giới thiệu, liên hệ

### 🛎️ Lễ tân (Staff)
- Dashboard tổng quan công việc trong ngày
- Quản lý đặt phòng: xác nhận → **check-in** → **check-out** → hủy
- **Đặt phòng tại quầy** (walk-in) cho khách vãng lai
- Gán phòng cụ thể cho đơn
- **Sơ đồ trạng thái phòng** theo tầng, cập nhật trạng thái
- **Lập & in hóa đơn**, thu tiền

### 🛡️ Quản trị viên (Admin)
- Dashboard: doanh thu, công suất phòng, biểu đồ (Chart.js)
- CRUD: loại phòng (kèm tiện nghi & gallery), phòng, tiện nghi, dịch vụ, khuyến mãi
- Quản lý toàn bộ đặt phòng & thanh toán
- Quản lý người dùng (khóa/mở, phân quyền)
- Kiểm duyệt đánh giá, hộp thư liên hệ
- **Thống kê & báo cáo** doanh thu theo tháng/năm

---

## 🧱 Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Backend | Node.js, Express 4 (MVC) |
| View | EJS + express-ejs-layouts |
| CSDL | MySQL (mysql2) |
| Auth | express-session, bcryptjs |
| Khác | multer (upload), connect-flash, method-override, dayjs, dotenv |
| Frontend | Bootstrap 5, Font Awesome 6, Chart.js (CDN) |

---

## 📁 Cấu trúc thư mục

```
quanlykhachsan/
├── server.js                 # Điểm khởi động
├── app.js                    # Cấu hình Express
├── database/
│   ├── schema.sql            # Tạo CSDL & bảng
│   └── seed.js               # Tạo dữ liệu mẫu
└── src/
    ├── config/               # app.config, db (pool), session
    ├── constants/            # roles, trạng thái, messages
    ├── controllers/          # admin/ · staff/ · client/
    ├── services/             # Logic nghiệp vụ (booking, invoice, statistics...)
    ├── models/               # Truy vấn MySQL
    ├── middlewares/          # auth, role, upload, locals, error...
    ├── validators/           # Kiểm tra dữ liệu đầu vào
    ├── utils/                # format, pagination, hash, helpers
    ├── routes/               # admin/ · staff/ · client/
    ├── views/                # layouts/ · partials/ · client/ · admin/ · staff/
    └── public/               # css/ · js/ · images/ · uploads/
```

---

## 🚀 Hướng dẫn cài đặt & chạy

### 1. Yêu cầu
- Node.js 16+ và MySQL 8 (hoặc MariaDB 10+)

### 2. Cài đặt
```bash
cd quanlykhachsan
npm install
```

### 3. Cấu hình môi trường
Sao chép `.env.example` thành `.env` và sửa thông tin MySQL:
```bash
copy .env.example .env      # Windows
# cp .env.example .env       # macOS/Linux
```
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hotel_management
```

### 4. Tạo cơ sở dữ liệu
Chạy file `database/schema.sql` (bằng MySQL Workbench, phpMyAdmin, hoặc CLI):
```bash
mysql -u root -p < database/schema.sql
```

### 5. Tạo dữ liệu mẫu
```bash
npm run seed
```

### 6. Khởi động
```bash
npm run dev      # chế độ phát triển (nodemon)
# hoặc
npm start
```
Mở trình duyệt: **http://localhost:3000**

---

## 🔑 Tài khoản demo

> Mật khẩu chung: **`123456`**

| Vai trò | Email | Trang sau đăng nhập |
|---|---|---|
| Quản trị viên | `admin@hotel.com` | `/admin` |
| Lễ tân | `letan@hotel.com` | `/staff` |
| Khách hàng | `khach@gmail.com` | `/` |

---

## 🗺️ Một số đường dẫn

| Khu vực | URL |
|---|---|
| Trang chủ | `/` |
| Danh sách phòng | `/phong` |
| Đăng nhập | `/login` |
| Tài khoản của tôi | `/tai-khoan` |
| Trang quản trị | `/admin` |
| Trang lễ tân | `/staff` |

---

## 📝 Ghi chú
- Ảnh phòng dùng nguồn Unsplash (cần Internet để hiển thị); ảnh tải lên lưu tại `src/public/uploads/`.
- Mọi mật khẩu được mã hóa bằng **bcrypt**.
- Dữ liệu mẫu có thể tạo lại bất cứ lúc nào bằng `npm run seed`.

*Dự án phục vụ mục đích học tập môn Công nghệ Web.*
