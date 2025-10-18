// Example: How to use the new audio system with external BGM
import { audioManager } from "./utils/audio";

// Method 1: Set external BGM before starting the game
// Replace 'path/to/your/audio.mp3' with the actual path to your audio file
audioManager.setExternalBGM("path/to/your/audio.mp3");

// Method 2: Use generated BGM (default behavior)
// audioManager.useGeneratedBGM();

// Initialize and start BGM
audioManager.init();
audioManager.startBGM();

// To stop BGM
// audioManager.stopBGM();

// To toggle mute
// audioManager.toggleMute();

/* 
INSTRUCTIONS FOR USING YOUTUBE AUDIO:

1. Download the audio from the YouTube video:
   - Use a tool like yt-dlp: `yt-dlp -x --audio-format mp3 "https://www.youtube.com/watch?v=INYxwW06nAk"`
   - Or use online YouTube to MP3 converters
   - Save the file as 'bgm.mp3' in your project's public folder

2. Place the audio file in your project:
   - Create a 'public' folder in your project root if it doesn't exist
   - Place your audio file there (e.g., 'public/bgm.mp3')

3. Update your App.tsx to use external BGM:
   ```typescript
   import { audioManager } from './utils/audio';
   
   // In your App component, before starting the game:
   audioManager.setExternalBGM('/bgm.mp3'); // Path relative to public folder
   audioManager.init();
   audioManager.startBGM();
   ```

4. Alternative: Use a CDN or external URL:
   ```typescript
   audioManager.setExternalBGM('https://your-cdn.com/audio.mp3');
   ```

NOTE: Make sure the audio file is in a format supported by the Web Audio API (MP3, WAV, OGG, etc.)
*/
