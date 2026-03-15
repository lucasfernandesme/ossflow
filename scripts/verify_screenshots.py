
import os
from PIL import Image

def verify_images(image_paths):
    requirements = {
        "min_side": 1080,
        "max_side": 7680,
        "max_size_mb": 8,
        "aspect_ratios": [(16, 9), (9, 16)]
    }

    results = []

    for path in image_paths:
        if not os.path.exists(path):
            results.append(f"File not found: {path}")
            continue

        try:
            with Image.open(path) as img:
                width, height = img.size
                format = img.format
                size_mb = os.path.getsize(path) / (1024 * 1024)

                # Check sides
                sides_ok = requirements["min_side"] <= width <= requirements["max_side"] and \
                           requirements["min_side"] <= height <= requirements["max_side"]

                # Check aspect ratio
                # Allow a small tolerance for rounding
                current_ratio = width / height
                ratio_ok = False
                for r_w, r_h in requirements["aspect_ratios"]:
                    target_ratio = r_w / r_h
                    if abs(current_ratio - target_ratio) < 0.01:
                        ratio_ok = True
                        break

                size_ok = size_mb <= requirements["max_size_mb"]

                status = "PASS" if sides_ok and ratio_ok and size_ok else "FAIL"

                results.append({
                    "path": os.path.basename(path),
                    "resolution": f"{width}x{height}",
                    "ratio": f"{width/height:.2f}",
                    "size_mb": f"{size_mb:.2f}MB",
                    "format": format,
                    "status": status,
                    "details": {
                        "sides_ok": sides_ok,
                        "ratio_ok": ratio_ok,
                        "size_ok": size_ok
                    }
                })
        except Exception as e:
            results.append(f"Error processing {path}: {str(e)}")

    return results

if __name__ == "__main__":
    # Update these paths to match the ones found earlier
    paths = [
        r"C:\Users\Lucas\.gemini\antigravity\brain\6ed9fea8-ed86-4f87-b37c-4cea0ac71405\media__1773586911533.png",
        r"C:\Users\Lucas\.gemini\antigravity\brain\6ed9fea8-ed86-4f87-b37c-4cea0ac71405\media__1773586911629.png"
    ]
    report = verify_images(paths)
    for res in report:
        if isinstance(res, dict):
            print(f"--- {res['path']} ---")
            print(f"Status: {res['status']}")
            print(f"Resolution: {res['resolution']} {'(OK)' if res['details']['sides_ok'] else '(FAILED)'}")
            print(f"Aspect Ratio: {res['ratio']} {'(OK)' if res['details']['ratio_ok'] else '(FAILED)'}")
            print(f"File Size: {res['size_mb']} {'(OK)' if res['details']['size_ok'] else '(FAILED)'}")
            print(f"Format: {res['format']}")
        else:
            print(res)
