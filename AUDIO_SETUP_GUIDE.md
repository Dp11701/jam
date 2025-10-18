# Hướng dẫn thay thế âm thanh nền

## Tổng quan
Hệ thống âm thanh đã được cập nhật để hỗ trợ cả âm thanh được tạo tự động và âm thanh từ file bên ngoài. Bạn có thể dễ dàng thay thế âm thanh nền bằng âm thanh từ YouTube hoặc bất kỳ file âm thanh nào khác.

## Cách sử dụng

### 1. Sử dụng âm thanh từ file bên ngoài

#### Bước 1: Tải âm thanh từ YouTube
Có nhiều cách để tải âm thanh từ YouTube:

**Cách 1: Sử dụng yt-dlp (khuyến nghị)**
```bash
# Cài đặt yt-dlp
pip install yt-dlp

# Tải âm thanh từ YouTube
yt-dlp -x --audio-format mp3 "https://www.youtube.com/watch?v=INYxwW06nAk"
```

**Cách 2: Sử dụng công cụ trực tuyến**
- Truy cập các trang web như yt1s.com, y2mate.com
- Dán link YouTube: `https://www.youtube.com/watch?v=INYxwW06nAk`
- Tải file MP3 về máy

#### Bước 2: Đặt file âm thanh vào project
1. Tạo thư mục `public` trong thư mục gốc của project (nếu chưa có)
2. Đặt file âm thanh vào thư mục `public` (ví dụ: `public/bgm.mp3`)

#### Bước 3: Cập nhật code
Mở file `App.tsx` và tìm hàm `handleInteraction()`. Bỏ comment dòng sau:

```typescript
const handleInteraction = () => {
  if (!hasInteracted.current) {
    hasInteracted.current = true;
    audioManager.init();
    
    // Bỏ comment dòng này và thay đổi đường dẫn
    audioManager.setExternalBGM('/bgm.mp3'); // Đường dẫn tương đối từ thư mục public
    
    audioManager.startBGM();
  }
};
```

### 2. Sử dụng URL trực tiếp

Nếu bạn có file âm thanh trên CDN hoặc server khác:

```typescript
audioManager.setExternalBGM('https://your-cdn.com/audio.mp3');
```

### 3. Quay lại âm thanh được tạo tự động

Nếu muốn sử dụng âm thanh được tạo tự động (như ban đầu):

```typescript
audioManager.useGeneratedBGM();
```

## Các định dạng âm thanh được hỗ trợ

- MP3
- WAV
- OGG
- AAC
- M4A

## Lưu ý quan trọng

1. **Bản quyền**: Đảm bảo bạn có quyền sử dụng âm thanh từ YouTube hoặc các nguồn khác
2. **Kích thước file**: File âm thanh quá lớn có thể làm chậm việc tải trang
3. **Định dạng**: Sử dụng MP3 để đảm bảo tương thích tốt nhất
4. **Đường dẫn**: Sử dụng đường dẫn tương đối từ thư mục `public` (bắt đầu bằng `/`)

## API Reference

### AudioManager Methods

```typescript
// Thiết lập âm thanh nền từ file bên ngoài
audioManager.setExternalBGM(audioPath: string): void

// Sử dụng âm thanh được tạo tự động
audioManager.useGeneratedBGM(): void

// Khởi tạo audio context
audioManager.init(): void

// Bắt đầu phát âm thanh nền
audioManager.startBGM(): Promise<void>

// Dừng âm thanh nền
audioManager.stopBGM(): void

// Bật/tắt tiếng
audioManager.toggleMute(): void

// Phát âm thanh hiệu ứng
audioManager.play(sound: string): void
```

## Xử lý lỗi

Nếu file âm thanh không tải được, hệ thống sẽ tự động chuyển về âm thanh được tạo tự động và hiển thị lỗi trong console.

## Ví dụ hoàn chỉnh

```typescript
import { audioManager } from './utils/audio';

// Thiết lập âm thanh nền
audioManager.setExternalBGM('/my-background-music.mp3');

// Khởi tạo và bắt đầu
audioManager.init();
audioManager.startBGM();

// Xử lý lỗi
try {
  await audioManager.startBGM();
} catch (error) {
  console.error('Không thể tải âm thanh:', error);
  // Hệ thống sẽ tự động chuyển về âm thanh mặc định
}
```
