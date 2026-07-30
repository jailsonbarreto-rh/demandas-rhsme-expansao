#!/usr/bin/env bash
set -euo pipefail

dnf install -y \
  alsa-lib \
  atk \
  at-spi2-atk \
  cups-libs \
  libdrm \
  libX11 \
  libXcomposite \
  libXdamage \
  libXext \
  libXfixes \
  libXrandr \
  libxcb \
  libxkbcommon \
  mesa-libgbm \
  nspr \
  nss \
  pango

npx playwright install chromium
CI=1 npm run test:e2e
