@echo OFF
FOR %%x IN (*.webm) DO ffmpeg.exe -i "%%x" "%%x_audio.ogg" 
FOR %%y IN (*.m4a) DO ffmpeg.exe -i "%%y" "%%y_audio.ogg" 
FOR %%z IN (*.mkv) DO ffmpeg.exe -i "%%z" "%%z_audio.ogg" 
FOR %%a IN (*.mp4) DO ffmpeg.exe -i "%%a" "%%a_audio.ogg" 
FOR %%b IN (*.mp3) DO ffmpeg.exe -i "%%b" "%%b_audio.ogg" 
PAUSE