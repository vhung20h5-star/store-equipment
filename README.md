# HomeNest - Store Equipment

Dự án thương mại điện tử chuyên cung cấp thiết bị gia dụng và đồ dùng gia đình thông minh (Smart Home, Nhà bếp, Vệ sinh, Không khí & Làm mát).

---

## 1. Tổng quan & Cấu trúc Monorepo

Dự án được cấu trúc dưới dạng **Monorepo** phân tách rõ ràng giữa Frontend và Backend:

```text
store-equipment/
├── .github/
│   └── workflows/
│       └── ci.yml             # CI tự động chạy lint, build frontend & test backend
├── backend/                   # Ứng dụng Spring Boot 3.4.3 (Java 21+)
│   ├── src/main/java/com/homenest/
│   │   ├── auth/              # Xác thực, tài khoản User, JWT
│   │   ├── catalog/           # Sản phẩm, danh mục, thư viện ảnh
│   │   ├── cart/              # Giỏ hàng database, đồng bộ giỏ
│   │   ├── order/             # Đặt hàng, tra cứu, thanh toán
│   │   ├── promotion/         # Khuyến mãi, flash sale, voucher
│   │   ├── content/           # Newsletter và đánh giá khách hàng
│   │   ├── security/          # Cấu hình Spring Security & JWT filter
│   │   ├── config/            # Cấu hình CORS WebMvc
│   │   ├── common/            # DTO dùng chung (ApiResponse, PageResponse)
│   │   └── exception/         # Xử lý lỗi tập trung GlobalExceptionHandler
│   ├── src/main/resources/
│   │   ├── db/migration/      # 6 bản migration Flyway (V1 -> V6)
│   │   └── application.yml
│   ├── src/test/              # 42+ integration tests tự động
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
├── frontend/                  # Ứng dụng React 19 + Vite 8 (TypeScript)
│   ├── src/
│   │   ├── app/               # Khởi tạo App, Routes, Providers
│   │   ├── pages/             # Các trang (Home, About, Docs, Blog, Pricing)
│   │   ├── features/          # auth, catalog, cart, checkout, orders, promotions, wishlist
│   │   └── shared/            # HTTP client, UI components, layout, types, styles
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── vercel.json
├── vercel.json                # Cấu hình triển khai Vercel từ root monorepo
├── .gitignore
└── README.md
```

### Công nghệ sử dụng:
- **Frontend (`/frontend`)**: [React 19](https://react.dev/), [Vite 8](https://vitejs.dev/), [TypeScript 5](https://www.typescriptlang.org/), [HeroUI v3](https://heroui.com), [Tailwind CSS v4](https://tailwindcss.com), [Lucide React](https://lucide.dev/), `npm`.
- **Backend (`/backend`)**: [Spring Boot 3.4.3](https://spring.io/projects/spring-boot), Java 21+, Spring Data JPA, Hibernate, PostgreSQL 16 (dev/prod), H2 (in-memory test), [Flyway](https://flywaydb.org/), Spring Security + JWT, Maven Wrapper.

---

## 2. Yêu cầu môi trường (Prerequisites)

Trước khi chạy dự án, hãy đảm bảo máy tính đã cài đặt:

| Công cụ | Phiên bản khuyến nghị | Phiên bản đã kiểm tra | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.x` | `v24.14.0` | Dùng để chạy Frontend |
| **npm** | `>= 10.x` | `11.9.0` | Đi kèm sẵn khi cài Node.js |
| **Java JDK** | `>= 21` | `24.0.1` | Dùng để chạy Backend Spring Boot |
| **Maven** | Đã tích hợp | Wrapper `3.9.9` | Sử dụng sẵn file `mvnw` / `mvnw.cmd` |
| **Docker** | Bất kỳ | Mới nhất | Dùng để chạy database PostgreSQL cục bộ |

---

## 3. Cấu hình môi trường (Environment Configuration)

### 3.1. Frontend
File cấu hình frontend là `.env` đặt tại thư mục `frontend/`. Bạn có thể sao chép từ file mẫu:

```bash
# Trên Linux/macOS
cp frontend/.env.example frontend/.env

# Trên Windows (PowerShell)
Copy-Item frontend\.env.example frontend\.env
```

Nội dung biến môi trường trong `frontend/.env`:
```env
# URL gốc trỏ tới Backend API
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 3.2. Backend
Backend được cấu hình tại `backend/src/main/resources/application.yml`. Các biến môi trường mặc định tương thích với Docker cục bộ:
- `SPRING_DATASOURCE_URL`: Chuỗi kết nối JDBC (mặc định: `jdbc:postgresql://localhost:5432/homenest`)
- `SPRING_DATASOURCE_USERNAME`: Tên người dùng database (mặc định: `postgres`)
- `SPRING_DATASOURCE_PASSWORD`: Mật khẩu database (mặc định: `postgrespassword`)
- `CORS_ALLOWED_ORIGINS`: Danh sách URL frontend (mặc định: `http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000`)

---

## 4. Hướng dẫn cài đặt và khởi chạy từ bản checkout mới

Thực hiện tuần tự theo các bước sau:

### Bước 1: Khởi chạy Database (PostgreSQL)
Mở một cửa sổ dòng lệnh và chạy:

```bash
cd backend
docker compose up -d
```

> **Ghi chú**: Container PostgreSQL sẽ khởi động trên cổng `5432`. Khi Backend khởi động, **Flyway** sẽ tự động chạy 5 bản migration để tạo bảng và nạp dữ liệu mẫu.

### Bước 2: Khởi chạy Backend (Spring Boot API)
Mở cửa sổ dòng lệnh trong thư mục `backend`:

- **Trên Windows (PowerShell / CMD)**:
  ```powershell
  cd backend
  .\mvnw.cmd spring-boot:run
  ```
- **Trên Linux / macOS**:
  ```bash
  cd backend
  ./mvnw spring-boot:run
  ```

Backend sẽ khởi động tại:
- Base URL: `http://localhost:8080`
- API Endpoint: `http://localhost:8080/api/v1`

### Bước 3: Khởi chạy Frontend (React + Vite)
Mở một cửa sổ dòng lệnh riêng trong thư mục `frontend`:

```bash
cd frontend

# 1. Cài đặt các gói phụ thuộc
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev
```

Truy cập ứng dụng tại:
- **`http://localhost:5173`**

---

## 5. Dữ liệu mẫu kiểm thử (Test Data)

Hệ thống có sẵn dữ liệu mẫu sau khi nạp Flyway migration:

### 5.1. Tài khoản mẫu
- **Khách hàng (`ROLE_USER`)**:
  - Email: `demo@homenest.vn`
  - Mật khẩu: `Password@123`
  - Họ tên: `Nguyễn Văn An`
  - Số điện thoại: `0912345678`
- **Quản trị viên (`ROLE_ADMIN`)**:
  - Email: `admin@homenest.vn`
  - Mật khẩu: `Admin@123`
  - Họ tên: `Quản Trị Viên HomeNest`
  - Quyền hạn: Xem toàn bộ đơn hàng, lọc/tìm kiếm, chuyển trạng thái vòng đời đơn (`CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`), hủy đơn & hoàn kho tự động.
- Bạn cũng có thể đăng ký tài khoản mới trực tiếp trên giao diện thông qua form Đăng nhập / Đăng ký.

### 5.2. Mã giảm giá (Vouchers) mẫu
- `HOMENEST30`: Giảm 30% (tối đa 500.000 VNĐ)
- `HOMENEST10`: Giảm 10% (tối đa 50.000 VNĐ)
- `FLASH20`: Giảm 20% (tối đa 150.000 VNĐ, đơn tối thiểu 200.000 VNĐ)

---

## 6. Hướng dẫn kiểm tra tự động (Automated Testing)

### 6.1. Kiểm tra Backend (38 tests)
Backend sở hữu bộ test tích hợp toàn diện sử dụng CSDL in-memory H2, không yêu cầu bật Docker:

- **Trên Windows**:
  ```powershell
  cd backend
  .\mvnw.cmd test
  ```
- **Trên Linux / macOS**:
  ```bash
  cd backend
  ./mvnw test
  ```

### 6.2. Kiểm tra Frontend (Build & Lint)
Từ thư mục `frontend`:

```bash
cd frontend

# Kiểm tra cú pháp và định dạng code
npm run lint

# Tự động sửa lỗi định dạng nếu có
npm run lint:fix

# Kiểm tra biên dịch TypeScript và đóng gói Vite
npm run build
```

---

## 7. Triển khai trên Vercel (Vercel Deployment)

Dự án hỗ trợ 2 cách triển khai trên [Vercel](https://vercel.com):

* **Cách 1: Triển khai Monorepo tự động (Khuyến nghị)**
  * Repository đã chứa sẵn file [`vercel.json`](./vercel.json) ở thư mục gốc. Vercel sẽ tự động phát hiện lệnh cài đặt `npm --prefix frontend install`, lệnh build `npm --prefix frontend run build` và thư mục output `frontend/dist`.
* **Cách 2: Cấu hình Root Directory trên Vercel Dashboard**
  * Trong phần cấu hình dự án trên Vercel (Project Settings > General > Root Directory), chọn thư mục `frontend`.
  * Thư mục `frontend/` đã có sẵn file [`frontend/vercel.json`](./frontend/vercel.json) để xử lý Single Page Application rewrites.
