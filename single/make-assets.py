# عکس‌ها و فایل راهنما را فشرده و به data URI تبدیل می‌کند تا داخل همان فایل HTML قرار بگیرند.
import base64, io, json, os
from PIL import Image
root = os.path.join(os.path.dirname(__file__), "..", "public")
out = {}
for d, _, files in os.walk(os.path.join(root, "images")):
    for f in files:
        p = os.path.join(d, f); key = "/" + os.path.relpath(p, root).replace(os.sep, "/")
        im = Image.open(p).convert("RGB"); im.thumbnail((1100, 1100))
        b = io.BytesIO(); im.save(b, "WEBP", quality=62); out[key] = "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode()
open(os.path.join(os.path.dirname(__file__), "shims", "assets.ts"), "w").write(
    "// ساخته‌شده با make-assets.py\nconst A: Record<string, string> = " + json.dumps(out) + ";\nexport const withBase = (src: string) => A[src] ?? src;\nexport default function imageLoader({ src }: { src: string }) { return withBase(src); }\n")
print(len(out), "assets", sum(map(len, out.values())) // 1024, "KB")
