#!/usr/bin/env bash
set -euo pipefail

dnf install -y \
  alsa-lib atk at-spi2-atk cups-libs libdrm libX11 libXcomposite libXdamage \
  libXext libXfixes libXrandr libxcb libxkbcommon mesa-libgbm pango nspr nss

npx playwright install chromium
npx playwright test tests/e2e/user-facing-information.spec.ts
