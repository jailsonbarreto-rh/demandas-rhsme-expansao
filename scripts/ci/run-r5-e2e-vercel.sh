#!/usr/bin/env bash
set -euo pipefail

if command -v dnf >/dev/null 2>&1; then
  dnf install -y \
    alsa-lib atk at-spi2-atk cairo cups-libs dbus-libs expat fontconfig freetype \
    glib2 gtk3 libX11 libXcomposite libXcursor libXdamage libXext libXfixes \
    libXi libXrandr libXrender libXtst libdrm libxcb libxkbcommon mesa-libgbm \
    nspr nss pango >/tmp/r5-e2e-dnf.log 2>&1 || {
      cat /tmp/r5-e2e-dnf.log
      exit 1
    }
fi

npx playwright install chromium
CI=1 npm run test:e2e -- --workers=1
mkdir -p dist
printf '<!doctype html><title>R5-1 E2E aprovado</title>' > dist/index.html
