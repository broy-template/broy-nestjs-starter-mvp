Author: Roy Aziz Barera

Github: [https://github.com/forscy](https://github.com/forscy)

Versi: 5.0

Tanggal: 1 Januari 2025

## 🎯 Tujuan Dokumen

Dokumen ini adalah "sumber kebenaran tunggal" ( *single source of truth* ) bagi developer untuk membangun aplikasi yang kokoh dan siap berkembang. Tujuannya adalah untuk:

* **Mempercepat Onboarding:** Developer baru bisa langsung produktif.
* **Menjamin Kualitas & Keamanan:** Menerapkan praktik terbaik sejak awal.
* **Memudahkan Evolusi:** Memastikan arsitektur mudah dikembangkan.
* **Meningkatkan Kolaborasi:** Menyeragamkan gaya kode, logging, dan penanganan error.

## 1. Prinsip Utama

* **Gunakan Fitur Bawaan NestJS:** Selalu prioritaskan modul dan pola bawaan.
* **Single Responsibility Principle (SRP):** Setiap class dan method punya satu tanggung jawab.
* **Don't Repeat Yourself (DRY):** Hindari duplikasi dengan abstraksi.
* **Pragmatis & Evolutif:** Mulai sederhana, lakukan *refactor* secara terencana.

## 2. Standar Respons API JSON

Untuk menjaga konsistensi di seluruh layanan dan memudahkan tim frontend, semua respons API WAJIB mengikuti struktur di bawah ini.

### a. Respons Sukses (200 OK dan 201 Created)

### Data Tunggal (GET by ID, POST)

JSON

`{   "status": "success",   "message": "..."    "data": {     "id": "c6a9b4c0-0e1f-4f3a-8d7b-9c1e0a2d4f6e",     "name": "John Doe",     "email": "john.doe@example.com"   } }`

### Daftar Data (GET List)

JSON

`{   "status": "success",   "message": "...",   "data": [     { "id": "user-1", "name": "John Doe" },     { "id": "user-2", "name": "Jane Smith" }   ] }`

### Daftar Data dengan Paginasi (GET List with Pagination)

Struktur ini memisahkan data aktual (`data`) dari metadata paginasi (`pagination`) untuk kejelasan.

JSON

`{   "status": "success",   "message": "...",     "data": [     { "id": "item-1", "name": "Item Satu" },     { "id": "item-2", "name": "Item Dua" }   ],   "pagination": {     "totalItems": 100,     "itemsPerPage": 10,     "currentPage": 1,     "totalPages": 10,     "nextPage": 2,     "previousPage": null   } }`

### b. Respons Gagal (4xx & 5xx)

Semua error yang tertangkap oleh `AllExceptionsFilter` WAJIB diformat seperti ini.

JSON

`{   "status": "failed",   "message": "User with ID 123 not found.",   "statusCode": 404,   "errorCode": "USER_NOT_FOUND",   "timestamp": "2025-08-18T10:00:00.000Z",   "path": "/api/v1/users/123" }`

* `status`: Kode status berhasil atau tidak untuk mencegah human error saat lupa throw error.
* `message`: Pesan error yang mudah dibaca manusia.
* `statusCode`: Kode status HTTP.
* `errorCode`: Kode error internal yang bisa digunakan frontend untuk logika spesifik (opsional).
* `timestamp`: Waktu terjadinya error (ISO 8601).
* `path`: Endpoint yang diakses.

### c. Respons Sukses untuk DELETE

`{   "status": "success",   "message": "..." }`

## 3. Struktur Proyek

Struktur dirancang untuk kesederhanaan di awal, dengan jalur evolusi yang jelas.

Struktur Awal (Skala MVP)

`src/ ├── common/                   # SATU folder untuk semua hal reusable (guards, decorators) ├── config/                   # Konfigurasi aplikasi (.config.ts) ├── prisma/                   # Schema dan file migrasi Prisma │   └── schema.prisma │ ├── modules/                  # Semua domain bisnis (fitur) │   ├── auth/ │   │   ├── auth.module.ts │   │   ├── auth.controller.ts │   │   ├── auth.service.ts │   │   └── ... │   └── user/ │       ├── user.module.ts │       ├── user.controller.ts │       ├── user.service.ts │       ├── user.entity.ts    # Opsional, untuk definisi tipe kompleks │       └──  dto/ │            └── update-user.dto.ts │ ├── app.module.ts └── main.ts`

## 4. Keamanan: Prioritas Utama 🔐

### a. Autentikasi (Siapa Anda?)

* **Strategi:** Gunakan JSON Web Tokens (JWT) melalui `@nestjs/jwt` dan `@nestjs/passport`.
* **Pelindung Global:** WAJIB terapkan `JwtAuthGuard` secara global.
* **Decorator Publik:** Buat decorator `@Public()` untuk endpoint yang tidak memerlukan autentikasi.

### b. Strategi Refresh Token

* **Tujuan** : Memberikan pengalaman pengguna yang mulus tanpa mengorbankan keamanan. *Access token* harus berumur pendek (15-60 menit), sementara *refresh token* berumur panjang (misalnya, 7 hari).
* **Implementasi** :

1. Saat login, hasilkan *access token* dan  *refresh token* .
2. Simpan *hash* dari *refresh token* di database, terkait dengan user/sesi.
3. Buat endpoint `/auth/refresh` yang dilindungi oleh `RefreshJwtGuard`. Endpoint ini menerima *refresh token* dan mengembalikan *access token* baru.
4. Saat pengguna logout, hapus *refresh token* dari database.

### c. Otorisasi (Apa yang Boleh Anda Lakukan?)

* **Roles Guard:** WAJIB membuat `RolesGuard` untuk memeriksa peran pengguna.
* **Decorator Roles:** Buat decorator `@Roles('admin', 'user')` untuk endpoint.

### d. Otorisasi Ownership (Operasi untuk data dirinya sendiri)

🛡️ **Tambahkan Otorisasi Berbasis Kepemilikan ( *Resource Ownership* )**

* **Saran** : Buatlah untuk mengimplementasikan `Guard` khusus atau melakukan pengecekan di dalam *service* untuk memverifikasi kepemilikan sumber daya.
* **Contoh Logika** : `if (requestedResourceId.ownerId !== currentUser.id) throw new ForbiddenException();`

### e. Penyimpanan Kredensial & Secret

* **Hashing Password:** WAJIB gunakan `bcrypt`.
* **Manajemen Secret:** Gunakan `.env` di  *development* . Di  *production* , Jika memungkinkan gunakan Secret Manager (AWS/GCP/Azure) atau HashiCorp Vault. Jika tidak memungkinkan bisa menyimpan file `.env` di server produksi tapi tidak disarankan.

### f. Keamanan Tambahan (Security Hardening)

* **Rate Limiting:** WAJIB gunakan `nestjs-throttler`.
* **HTTP Headers:** WAJIB gunakan `helmet`.
* **CORS:** Konfigurasikan `app.enableCors()` dengan *origin* spesifik di production.

## 5. Logging (Pencatatan Log) 🪵

* **Standar Modul:** Gunakan `Logger` bawaan NestJS untuk  *development* . Untuk  *production* , gunakan `nestjs-pino`.
* **Praktik Terbaik:**
  * **Gunakan Logging Terstruktur (JSON):** Di  *production* , konfigurasikan logger untuk output JSON.
  * **Sertakan Konteks:** Selalu berikan konteks (`new Logger(UsersService.name)`).
  * **Gunakan Correlation ID:** Teruskan `correlationId` unik di setiap log untuk melacak permintaan.
  * **Gunakan Level Log yang Tepat:**
    * `logger.error()`: Untuk error tak terduga yang butuh perhatian.
    * `logger.warn()`: Untuk potensi masalah (misalnya, penggunaan API  *deprecated* ).
    * `logger.log()`: Untuk event penting (misalnya, `User 'X' created`).
    * `logger.debug()`: Untuk informasi diagnostik selama development.

## 6. Konfigurasi & Dokumentasi API

* **Konfigurasi:** WAJIB gunakan `@nestjs/config` dengan validasi `Joi`. Sertakan file `.env.example`.
* **Dokumentasi API:** WAJIB gunakan `@nestjs/swagger`. Gunakan decorator `@ApiOperation()`, `@ApiResponse()`, `@ApiProperty()`, dan `@ApiBearerAuth()` secara lengkap.

## 7. Konvensi Penamaan

| Elemen            | Case Style           | Contoh                     |
| ----------------- | -------------------- | -------------------------- |
| Nama File         | `kebab-case`       | `user.service.ts`        |
| Class             | `PascalCase`       | `UserService`            |
| Variabel & Method | `camelCase`        | `totalUsers`,`findAll` |
| Konstanta & Enum  | `UPPER_SNAKE_CASE` | `MAX_RETRIES`            |

## 8. DTO, Validasi, & Serialisasi

* **Validasi Input (Request):** Gunakan DTO terpisah (`CreateUserDto`, `UpdateUserDto`). Manfaatkan `PartialType` untuk DTO Update. WAJIB aktifkan `ValidationPipe` secara global.
* **Serialisasi Output (Response):** WAJIB aktifkan `ClassSerializerInterceptor` secara global. Gunakan `@Exclude()` dan `@Expose()` untuk menyembunyikan data sensitif.

## 9. Penanganan Error

* **Spesifik & Semantik:** Tangani error yang dapat diprediksi di dalam Service menggunakan *custom exception* (`UserNotFoundException extends NotFoundException`).
* **Global & Konsisten:** WAJIB buat `AllExceptionsFilter` global untuk menangkap semua error lainnya dan memformatnya sesuai **Standar Respons API** yang telah didefinisikan.

## 10. Praktik Terbaik Prisma

* **PrismaService:** Buat `PrismaService` terpusat.
* **Graceful Shutdown:** Implementasikan `onModuleDestroy` untuk menutup koneksi database.
* **Transaksi:** Gunakan `prisma.$transaction()` untuk operasi atomik.
* **Hindari Over-fetching:** Gunakan `select` atau `include` dengan bijak.

## 11. Pengujian (Testing) 🧪

* **Framework:** WAJIB gunakan Jest.
* **Jenis Tes:** Definisikan ekspektasi untuk Unit, Integration, dan End-to-End (E2E).
* **Code Coverage:** Tetapkan ambang batas minimum (> 80%) dan integrasikan di pipeline CI.
* **Strategi Mocking:** Untuk Unit Test, WAJIB lakukan *mocking* pada semua dependensi eksternal.
* **Strategi Pengujian Database:**
  * **Untuk Tes E2E/Integrasi** , gunakan database terisolasi yang di-reset sebelum setiap tes berjalan. Pendekatan yang direkomendasikan adalah menggunakan  **database di dalam kontainer Docker** .
  * Hindari menjalankan tes pada database development atau production.

## 12. Kualitas Kode & Otomatisasi (CI/CD) 🚀

### a. Linting & Formatting

WAJIB gunakan ESLint dan Prettier, yang diotomatisasi dengan Git Hooks (husky).

### b. Pipeline Pengujian Otomatis (CI)

Setiap *push* atau *merge request* harus memicu:

1. `npm install`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

### c. Strategi Deployment (Continuous Deployment)

* **Containerization** : Aplikasi WAJIB di-*package* sebagai **Docker image** untuk portabilitas dan konsistensi antar lingkungan.
* **Health Check** : Sediakan endpoint `/health` yang mengembalikan status 200 OK jika aplikasi sehat. Ini penting untuk *orchestrator* seperti Kubernetes.

## 13. Standar Git Commit

Untuk menjaga riwayat Git ( *Git history* ) agar bersih, mudah dibaca, dan dapat diotomatisasi, tim WAJIB mengikuti standar  **Conventional Commits** . Standar ini memberlakukan aturan sederhana pada pesan komit yang memungkinkan mesin dan manusia memahaminya dengan mudah.

### Struktur Pesan Komit

Setiap pesan komit harus mengikuti format dasar berikut:

`<type>(<scope>): <subject> <BLANK LINE> <body> <BLANK LINE> <footer>`

* **type** : Jenis perubahan yang dilakukan. (Wajib)
* **scope** : Konteks dari perubahan (misalnya, nama modul atau fitur). (Opsional)
* **subject** : Deskripsi singkat dan jelas tentang perubahan, ditulis dalam bentuk imperatif (misalnya, "tambah" bukan "menambahkan"). (Wajib)
* **body** : Penjelasan lebih detail tentang perubahan, alasan, dan konteksnya. (Opsional)
* **footer** : Digunakan untuk menandai *breaking changes* atau menutup *issue* (misalnya, `Closes #123`). (Opsional)

---

### Jenis Komit (`type`) yang Umum Digunakan

Berikut adalah daftar `type` yang paling sering digunakan:

* **feat** : 🌟 Menambahkan fitur baru untuk pengguna.
* **fix** : 🐞 Memperbaiki bug.
* **chore** : 🧹 Perubahan yang tidak berhubungan dengan kode sumber atau tes (misalnya, update dependencies, konfigurasi CI).
* **docs** : 📖 Perubahan pada dokumentasi (misalnya, `README.md` atau Swagger).
* **style** : 🎨 Perubahan yang tidak memengaruhi arti kode (spasi, format, titik koma, dll).
* **refactor** : ♻️ Perubahan kode yang tidak memperbaiki bug maupun menambah fitur.
* **test** : 🧪 Menambah atau memperbaiki tes yang sudah ada.
* **ci** : 👷 Perubahan pada file dan skrip konfigurasi CI/CD.
* **build** : 📦 Perubahan yang memengaruhi sistem build atau dependensi eksternal (misalnya, `package.json`).
* **perf** : ⚡ Perubahan kode yang meningkatkan performa.

### Contoh Pesan Komit

**1. Komit untuk Fitur Baru**

`feat(auth): add refresh token rotation strategy`

**2. Komit untuk Perbaikan Bug dengan Scope**

`fix(users): prevent duplicate email registration`

**3. Komit dengan Body dan Menutup Issue**

`fix(payment): resolve race condition in transaction processing

The previous implementation did not lock the database row,
allowing multiple requests to process the same transaction
simultaneously, leading to data inconsistency.

This commit introduces a SELECT ... FOR UPDATE to ensure
atomic operations.

Closes: #245`

**4. Komit untuk Chore (tanpa perubahan fungsional)**

`chore: update nestjs dependencies to version 10`

5. Komit yang Mengandung Perubahan Merusak (Breaking Change)

Menandai breaking change sangat penting. Ini dilakukan dengan menambahkan ! setelah type(scope) atau menambahkan BREAKING CHANGE: di footer.

`feat(auth)!: replace passport-jwt with custom JWT implementation

BREAKING CHANGE: The authentication strategy has been completely
overhauled. The old JWT payload structure is no longer supported.
Refer to the new API documentation for details on migrating.`

## 14. Standar Strategi Branching Git (Model Release Branch)

### Definisi Branch

* `main`
  🏆  **Tujuan** : Merepresentasikan kode produksi yang  **100% stabil** . *Branch* ini adalah cerminan dari apa yang sedang berjalan di  *server production* .
  * **Aturan** :
  * **DILARANG KERAS** melakukan *push* langsung ke `main`.
  * `main` hanya dapat di-update dengan me-merge *branch* `staging` yang sudah teruji dan disetujui.
  * Setiap *commit* di `main` yang berasal dari merge rilis **WAJIB** diberi **tag versi** (misalnya, `v1.2.0`).
* `staging/v<versi>` (contoh: `staging/v1.2.0`)
  🔬  **Tujuan** : Sebagai *branch* kandidat rilis ( *Release Candidate* ). *Branch* ini digunakan untuk mengumpulkan semua fitur yang siap, melakukan pengujian akhir (QA), dan stabilisasi sebelum dirilis ke produksi.
  * **Dibuat dari** : `main`
  * **Digabung ke** : `main` (setelah stabil)
  * **Aturan** :
  * Dibuat saat tim memutuskan untuk memulai siklus rilis baru.
  * Hanya menerima *merge* dari *branch* `feature/` yang sudah selesai dan *branch* `fix/` untuk perbaikan bug yang ditemukan selama fase QA.
  * *Branch* ini di-*deploy* secara otomatis ke lingkungan  **Staging** .
* `feature/<module>/<feature-name>`
  ✨  **Tujuan** : Mengembangkan fitur baru secara terisolasi dengan konteks modul yang jelas.
  * **Dibuat dari** : `main`
  * **Digabung ke** : `staging/v<versi>`
  * **Konvensi Penamaan (WAJIB)** : Gunakan format tiga bagian `feature/<module>/<feature-name>` dimana:
  * `<module>`: Nama domain bisnis atau modul utama (misalnya: `auth`, `users`, `products`, `orders`).
  * `<feature-name>`: Deskripsi singkat fitur dalam format `kebab-case`.
  * **Contoh** :
  * `feature/auth/add-google-sso`
  * `feature/products/implement-advanced-search`
  * `feature/orders/generate-pdf-invoice`

### Alur Kerja (Workflow)

### **1. Alur Kerja Pengembangan Fitur Baru**

1. Selalu mulai dari `staging/{version}`yang terbaru: `git checkout staging/{version} && git pull origin staging/{version}`.
2. Buat *branch* fitur baru dengan format yang disepakati
   `git checkout -b feature/auth/login-google`
3. Lakukan pengembangan dan buat *commit* mengikuti standar  **Conventional Commits** .
4. Setelah selesai, dorong ( *push* ) *branch* Anda ke remote. *Branch* ini akan menunggu hingga siklus rilis berikutnya dimulai.

## 15. Manajemen Ketergantungan (Dependencies) 📦

* **Versi Node.js:** Tentukan versi LTS spesifik dalam `.nvmrc` dan `package.json` (`engines`).
* **Gunakan Lock File:** WAJIB *commit* `package-lock.json` atau `yarn.lock`.
* **Audit Keamanan:** Jalankan `npm audit` secara berkala.
