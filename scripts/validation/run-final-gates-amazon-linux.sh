#!/usr/bin/env bash
set -euo pipefail

npm run check

echo 'Instalando bibliotecas nativas do Chromium no runner temporário...'
dnf install -y \
  nspr \
  nss \
  atk \
  at-spi2-atk \
  cups-libs \
  libdrm \
  libXcomposite \
  libXdamage \
  libXfixes \
  libXrandr \
  mesa-libgbm \
  pango \
  cairo \
  alsa-lib \
  libxkbcommon \
  libX11 \
  libX11-xcb \
  libxcb \
  libXext \
  libxshmfence \
  gtk3 \
  dbus-libs

npx playwright install chromium
npm run test:e2e
