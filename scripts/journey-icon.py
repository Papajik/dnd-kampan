"""Convert a generated ink drawing on parchment into a journey map icon.

Usage: python3 scripts/journey-icon.py <input.png> <output-base> [height]

Writes <output-base>.png (transparent, sepia ink, `height` px tall, default 100)
and <output-base>.svg wrapping a 2x version of the same image.
Requires Pillow.
"""

import base64
import io
import sys

from PIL import Image

INK = (0x37, 0x22, 0x13)


def ink_alpha(image: Image.Image) -> Image.Image:
    """Turn darkness relative to the parchment into opacity and crop to the drawing."""
    gray = image.convert("L")
    values = sorted(gray.get_flattened_data())
    paper = values[int(len(values) * 0.9)] - 8
    ink = values[int(len(values) * 0.02)]
    scale = 255 / max(1, paper - ink)
    alpha = gray.point(lambda v: max(0, min(255, int((paper - v) * scale))))
    return alpha.crop(alpha.point(lambda v: 255 if v > 60 else 0).getbbox())


def render(alpha: Image.Image, height: int) -> Image.Image:
    resized = alpha.resize((round(alpha.width * height / alpha.height), height), Image.LANCZOS)
    icon = Image.new("RGBA", resized.size, INK + (0,))
    icon.putalpha(resized)
    return icon


def main() -> None:
    source, output, height = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 100
    alpha = ink_alpha(Image.open(source))

    icon = render(alpha, height)
    icon.save(f"{output}.png", optimize=True)

    buffer = io.BytesIO()
    render(alpha, height * 2).save(buffer, "PNG", optimize=True)
    data = base64.b64encode(buffer.getvalue()).decode()
    width, height = icon.size
    with open(f"{output}.svg", "w", encoding="utf-8") as svg:
        svg.write(
            '<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">\n'
            f'  <image width="{width}" height="{height}" href="data:image/png;base64,{data}"/>\n'
            "</svg>\n"
        )
    print(f"{output}.png/.svg {width}x{height}")


if __name__ == "__main__":
    main()
