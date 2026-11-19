# Dynamic Island Music

Overlay pemutar musik bergaya Dynamic Island untuk Windows 10/11. Island selalu di atas jendela lain, mengecil menjadi logo saat kursor jauh, dan memanjang menjadi pemutar musik saat kursor masuk.

Dibangun sesuai `PRD - Dynamic Island Desktop (Musik).pdf` dengan Electron + Vite + React + TypeScript + Tailwind CSS + Motion + Zustand. Tanpa backend dan tanpa biaya operasional.

## Fitur versi 1

- **Island adaptif** — Collapsed / Expanded dengan animasi spring, hover area 72×56 px, dan timer mengecil yang bisa diatur 2–30 detik.
- **Click-through** — area transparan di sekitar island meneruskan klik ke aplikasi di bawahnya.
- **Pemutar lengkap** — play/pause, sebelumnya/berikutnya, seek, volume, antrean otomatis, cover, judul, artis, dan marquee untuk teks panjang.
- **Pencarian & populer** — daftar trending langsung saat island dibuka, pencarian dengan debounce 400 ms, cache memori 10 menit, dan pesan error yang jelas.
- **Dua sumber musik gratis**:
  - **Audius** — aktif langsung tanpa kunci (API key opsional).
  - **Jamendo** — perlu `Client ID` gratis dari devportal Jamendo.
- **Pengaturan lokal** — durasi mengecil, posisi vertikal, sumber musik, kunci API, volume terakhir, dan auto-start Windows. Disimpan dengan `electron-store`.
- **Tray icon** — tampilkan/sembunyikan island, buka pengaturan, keluar. Satu instance saja.
- **Tombol media keyboard** — play/pause, next, previous lewat global shortcut dan Media Session API.
- **Kredit artis** — nama artis dan tautan sumber ditampilkan di pemutar dan setiap baris lagu.

## Menjalankan

Prasyarat: Node.js 20+ dan Windows 10/11.

```bash
npm install
npm run dev
```

Build produksi:

```bash
npm run build
npm start
```

Membuat installer NSIS:

```bash
npm run dist
```

Installer ada di folder `dist/`. Installer tidak ditandatangani secara digital (code signing berbayar), jadi Windows SmartScreen dapat menampilkan peringatan. Ini normal untuk pemakaian pribadi.

## Konfigurasi API

### Audius (default, langsung jalan)

Endpoint publik Audius dapat dipakai tanpa kunci. Jika ingin memakai API key dari halaman paket API Audius, tempel di **Pengaturan → Kunci API → Audius API Key**. Kunci hanya dikirim ke `api.audius.co` sebagai parameter `api_key`.

### Jamendo

1. Daftar gratis di <https://devportal.jamendo.com>.
2. Buat aplikasi, salin `client_id`.
3. Buka **Pengaturan → Kunci API → Jamendo Client ID**, tempel, lalu **Simpan**.
4. Pilih sumber **Jamendo** di Pengaturan.

Kunci API disimpan lokal lewat `electron-store` di folder user data aplikasi (bukan di repositori). Aplikasi tidak punya backend.

Endpoint yang dipakai (diverifikasi November 2026):

| Sumber | Kegunaan | Endpoint |
| --- | --- | --- |
| Jamendo | Populer | `GET https://api.jamendo.com/v3.0/tracks/?client_id=...&order=popularity_week&audioformat=mp32` |
| Jamendo | Cari | `GET .../tracks/?client_id=...&search=kata+kunci&boost=popularity_month&audioformat=mp32` |
| Audius | Populer | `GET https://api.audius.co/v1/tracks/trending?app_name=DynamicIslandMusic&time=week` |
| Audius | Cari | `GET https://api.audius.co/v1/tracks/search?query=kata+kunci&app_name=DynamicIslandMusic` |
| Audius | Stream | `GET https://api.audius.co/v1/tracks/{id}/stream?app_name=DynamicIslandMusic` |

Keduanya mengirim header CORS `access-control-allow-origin: *`, jadi aman dipanggil dari renderer Electron. URL audio diputar langsung oleh elemen `<audio>` (streaming, bukan unduhan).

## Struktur proyek

```text
src/
  main/                 # jendela transparan, tray, settings, auto-start, media keys
  preload/              # jembatan IPC aman (contextBridge)
  renderer/
    src/
      components/       # Island, PlayerBar, LibraryPanel, SettingsPanel, dll.
      hooks/            # audio engine, click-through, hover/timer
      services/         # jamendo.ts, audius.ts, cache, error
      store/            # Zustand: island, player, settings, library
      assets/           # logo
  shared/               # tipe Track, AppSettings, kontrak IPC
build/                  # icon aplikasi + tray
assets/                 # logo sumber
```

## Perilaku penting

- Saat **Collapsed**, tidak ada request API; daftar lagu baru dimuat ketika island memanjang.
- Timer mengecil berhenti selama kursor berada di island, saat menggeser progress/volume, atau saat kolom pencarian/pengaturan sedang fokus.
- Area transparan memakai `setIgnoreMouseEvents(true, { forward: true })`. Karena Windows tidak selalu meneruskan `mousemove` ke jendela click-through, main process membaca posisi kursor OS tiap 50 ms lalu mengirimkannya ke renderer. Renderer menguji apakah kursor berada di atas permukaan island dan mengaktifkan klik hanya di area itu.
- Volume terakhir dipulihkan saat aplikasi dibuka.
- Jika lagu gagal dimuat, pemutar berpindah ke lagu berikutnya dan menampilkan notifikasi singkat. Jika offline, pemutaran berhenti dengan pesan yang jelas.
- Cache HTTP Chromium dibatasi dan dibersihkan saat mulai/keluar agar tidak menyimpan file musik/gambar ke disk.

## Skrip

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Jalankan aplikasi dengan hot reload |
| `npm run build` | Build main, preload, dan renderer |
| `npm start` | Jalankan hasil build |
| `npm run typecheck` | Pemeriksaan tipe Node + renderer |
| `npm test` | Unit test Vitest |
| `npm run dist` | Build + installer NSIS |
| `npm run dist:dir` | Build tanpa installer (folder) |

## Batasan versi 1

Sesuai non-tujuan PRD: belum ada file shelf, pemutaran file lokal, kontrol Spotify/YouTube, akun/login, dukungan macOS/Linux, favorit, atau deteksi fullscreen. Katalog mengikuti musik independen yang tersedia di Jamendo/Audius.
