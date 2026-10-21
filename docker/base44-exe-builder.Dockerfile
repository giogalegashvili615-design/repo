# Packaging image for the Windows .exe of cloud-ai-agent/ (compose service
# `exe-builder`). It is the shared toolchain image plus Wine, because
# electron-builder compiles and stamps Windows binaries (makensis, the
# uninstaller step) by running them through Wine when packaging on Linux.
#
# Only the exe-builder service uses this; the preview service keeps the lean
# base44-node-bun image.
FROM base44-node-bun

RUN dpkg --add-architecture i386 \
 && apt-get update \
 && apt-get install -y --no-install-recommends \
      wine \
      wine64 \
      wine32:i386 \
 && rm -rf /var/lib/apt/lists/*
