# 🎵 Hướng dẫn nhanh - Sử dụng file MP3 làm nhạc nền

## ✅ Đã cấu hình xong!

File MP3 `jiglr - Odyssey.mp3` của bạn đã được cấu hình để sử dụng làm nhạc nền cho game.

### 🎮 Cách chạy game:

1. **Chạy development server:**
   ```bash
   npm run dev
   # hoặc
   yarn dev
   ```

2. **Mở trình duyệt** và truy cập địa chỉ được hiển thị (thường là `http://localhost:5173`)

3. **Click vào game** để bắt đầu - nhạc nền sẽ tự động phát!

### 🔧 Tùy chỉnh âm thanh:

**Để sử dụng nhạc nền khác:**
1. Đặt file MP3 mới vào thư mục `assets/`
2. Mở file `App.tsx`
3. Tìm dòng 336 và thay đổi đường dẫn:
   ```typescript
   audioManager.setExternalBGM('./assets/ten-file-moi.mp3');
   ```

**Để tắt nhạc nền và sử dụng âm thanh được tạo tự động:**
1. Mở file `App.tsx`
2. Comment dòng 336 và uncomment dòng 339:
   ```typescript
   // audioManager.setExternalBGM('./assets/jiglr - Odyssey.mp3');
   audioManager.useGeneratedBGM();
   ```

### 🎛️ Điều khiển âm thanh:

- **Tắt/bật tiếng:** Click vào nút âm thanh trong game
- **Dừng nhạc nền:** Sẽ tự động dừng khi kết thúc game

### 🐛 Xử lý lỗi:

Nếu nhạc nền không phát:
1. Kiểm tra console browser (F12) để xem lỗi
2. Đảm bảo file MP3 có định dạng đúng
3. Hệ thống sẽ tự động chuyển về âm thanh mặc định nếu có lỗi

### 📁 Cấu trúc file:

```
untangle-ropes-puzzle/
├── assets/
│   ├── bg.png
│   └── jiglr - Odyssey.mp3  ← File nhạc nền của bạn
├── App.tsx                  ← Đã cấu hình sử dụng file MP3
└── utils/
    └── audio.ts            ← Hệ thống âm thanh mới
```

**Chúc bạn chơi game vui vẻ! 🎮🎵**
