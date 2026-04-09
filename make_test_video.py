"""Generate a synthetic 3-second test video with blank (white) regions."""
import cv2
import numpy as np

fps = 30
duration = 3  # seconds
w, h = 640, 360
out = cv2.VideoWriter("test_input.mp4", cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))

for i in range(fps * duration):
    frame = np.zeros((h, w, 3), dtype=np.uint8)
    # Background gradient
    frame[:] = (30, 30, 30)

    # Animated colored circle
    cx = int(w * 0.25 + (w * 0.5) * (i / (fps * duration)))
    cy = h // 2
    cv2.circle(frame, (cx, cy), 50, (0, 120, 255), -1)

    # Large white (blank) rectangle in upper-right corner
    frame[20:160, w - 220:w - 20] = 255

    # Another blank region bottom-left
    frame[h - 120:h - 20, 20:200] = 255

    out.write(frame)

out.release()
print("test_input.mp4 created")
