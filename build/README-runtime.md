# Bundled runtime files

This source archive intentionally excludes generated and third-party Windows binaries:

- `build/local-runtime/llama/`
- `build/local-runtime/whisper/`
- `build/volume-helper.exe`
- `build/context-helper.exe`

The helper source files are available under `native/`. Restore the runtime files before running the packaged Electron build. Keep the third-party license notices in `build/THIRD-PARTY-NOTICES.md` and distribute large runtime binaries through GitHub Releases or Git LFS rather than normal Git history.
