#!/usr/bin/env bash
# Resize hub marketing assets for faster LCP (run after adding new PNGs).
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"

resize_dir() {
  local dir="$1" max="$2"
  for f in "$dir"/*.png; do
    [[ -f "$f" ]] || continue
    sips -Z "$max" "$f" --out "${f}.opt" >/dev/null
    mv "${f}.opt" "$f"
    echo "  $(basename "$f") ($(du -h "$f" | cut -f1))"
  done
}

echo "software-hero-phones (max ${1:-280}px)"
resize_dir "$root/public/images/software-hero-phones" "${1:-280}"
echo "service-provider-collage"
resize_dir "$root/public/images/service-provider-collage" "${1:-280}"
echo "cqc-hub mids"
resize_dir "$root/public/images/cqc-hub" "${2:-480}"
sips -Z "${3:-720}" "$root/public/images/cqc-hub/cqc-hero-group.png" --out "$root/public/images/cqc-hub/cqc-hero-group.png.opt" >/dev/null
mv "$root/public/images/cqc-hub/cqc-hero-group.png.opt" "$root/public/images/cqc-hub/cqc-hero-group.png"
sips -Z 640 "$root/public/images/cta-clinic-phone.png" --out "$root/public/images/cta-clinic-phone.png.opt" >/dev/null
mv "$root/public/images/cta-clinic-phone.png.opt" "$root/public/images/cta-clinic-phone.png"
echo "done"
