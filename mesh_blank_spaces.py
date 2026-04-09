#!/usr/bin/env python3
"""
mesh_blank_spaces.py — Fill blank/empty regions in a video with a mesh overlay.

Usage:
    python mesh_blank_spaces.py input.mp4 output.mp4 [options]

Options:
    --threshold INT     Brightness threshold to detect blank pixels (0-255, default: 240)
    --mesh-size INT     Mesh grid cell size in pixels (default: 20)
    --mesh-color R G B  Mesh line color (default: 180 180 180)
    --mesh-alpha FLOAT  Mesh line opacity 0.0-1.0 (default: 0.6)
    --min-area INT      Minimum blank region area in pixels to mesh (default: 500)
    --mode STR          Detection mode: 'bright' | 'dark' | 'both' (default: bright)
"""

import argparse
import sys
import cv2
import numpy as np


def detect_blank_mask(frame: np.ndarray, threshold: int, mode: str) -> np.ndarray:
    """Return a binary mask of blank (empty) regions in the frame."""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    if mode == "bright":
        _, mask = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY)
    elif mode == "dark":
        _, mask = cv2.threshold(gray, 255 - threshold, 255, cv2.THRESH_BINARY_INV)
    else:  # both
        _, bright = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY)
        _, dark = cv2.threshold(gray, 255 - threshold, 255, cv2.THRESH_BINARY_INV)
        mask = cv2.bitwise_or(bright, dark)

    # Remove small noise blobs
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    return mask


def build_mesh_overlay(shape: tuple, mesh_size: int, color: tuple) -> np.ndarray:
    """Build a full-frame mesh grid image (BGR)."""
    h, w = shape[:2]
    overlay = np.zeros((h, w, 3), dtype=np.uint8)
    for y in range(0, h, mesh_size):
        cv2.line(overlay, (0, y), (w, y), color, 1)
    for x in range(0, w, mesh_size):
        cv2.line(overlay, (x, 0), (x, h), color, 1)
    return overlay


def apply_mesh_to_frame(
    frame: np.ndarray,
    mask: np.ndarray,
    mesh_overlay: np.ndarray,
    alpha: float,
    min_area: int,
) -> np.ndarray:
    """Apply mesh overlay only to blank regions above min_area."""
    result = frame.copy()

    # Filter out small regions
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    region_mask = np.zeros_like(mask)
    for cnt in contours:
        if cv2.contourArea(cnt) >= min_area:
            cv2.drawContours(region_mask, [cnt], -1, 255, thickness=cv2.FILLED)

    if region_mask.max() == 0:
        return result  # Nothing to mesh

    # Blend mesh into blank regions
    mask_3ch = cv2.merge([region_mask, region_mask, region_mask])
    mask_float = mask_3ch.astype(np.float32) / 255.0

    blended = (
        frame.astype(np.float32) * (1 - alpha * mask_float)
        + mesh_overlay.astype(np.float32) * alpha * mask_float
    )
    result = np.clip(blended, 0, 255).astype(np.uint8)

    # Draw a faint contour around each meshed region for visibility
    cv2.drawContours(result, contours, -1, (120, 120, 200), 1)
    return result


def process_video(
    input_path: str,
    output_path: str,
    threshold: int,
    mesh_size: int,
    mesh_color: tuple,
    alpha: float,
    min_area: int,
    mode: str,
) -> None:
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(f"Error: cannot open '{input_path}'", file=sys.stderr)
        sys.exit(1)

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    mesh_overlay = build_mesh_overlay((height, width), mesh_size, mesh_color)

    print(f"Processing: {width}x{height} @ {fps:.1f}fps  ({total_frames} frames)")
    meshed_frames = 0

    for i in range(total_frames):
        ret, frame = cap.read()
        if not ret:
            break

        mask = detect_blank_mask(frame, threshold, mode)
        has_blank = mask.max() > 0

        if has_blank:
            frame = apply_mesh_to_frame(frame, mask, mesh_overlay, alpha, min_area)
            meshed_frames += 1

        out.write(frame)

        pct = (i + 1) / total_frames * 100
        print(f"\r  Frame {i+1}/{total_frames}  ({pct:.0f}%)  meshed={meshed_frames}", end="", flush=True)

    print()
    cap.release()
    out.release()
    print(f"Done. Meshed regions found in {meshed_frames}/{total_frames} frames.")
    print(f"Output saved to: {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fill blank regions in a video with a mesh overlay.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("input", help="Input video file (e.g. clip.mp4)")
    parser.add_argument("output", help="Output video file (e.g. output.mp4)")
    parser.add_argument(
        "--threshold", type=int, default=240,
        help="Brightness threshold for blank detection (default: 240)",
    )
    parser.add_argument(
        "--mesh-size", type=int, default=20,
        help="Mesh grid cell size in pixels (default: 20)",
    )
    parser.add_argument(
        "--mesh-color", type=int, nargs=3, default=[180, 180, 180],
        metavar=("R", "G", "B"),
        help="Mesh line color in RGB (default: 180 180 180)",
    )
    parser.add_argument(
        "--mesh-alpha", type=float, default=0.6,
        help="Mesh opacity 0.0-1.0 (default: 0.6)",
    )
    parser.add_argument(
        "--min-area", type=int, default=500,
        help="Minimum blank region area in px² to mesh (default: 500)",
    )
    parser.add_argument(
        "--mode", choices=["bright", "dark", "both"], default="bright",
        help="Which blank regions to detect (default: bright)",
    )

    args = parser.parse_args()

    # Convert RGB → BGR for OpenCV
    r, g, b = args.mesh_color
    mesh_color_bgr = (b, g, r)

    process_video(
        input_path=args.input,
        output_path=args.output,
        threshold=args.threshold,
        mesh_size=args.mesh_size,
        mesh_color=mesh_color_bgr,
        alpha=args.mesh_alpha,
        min_area=args.min_area,
        mode=args.mode,
    )


if __name__ == "__main__":
    main()
