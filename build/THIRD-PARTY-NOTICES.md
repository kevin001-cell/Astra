# Third-Party Runtime Notices

Astra Desktop includes unmodified Windows x64 CPU runtime binaries from these official projects:

- llama.cpp `b10472`, copyright the llama.cpp contributors, MIT License.
- whisper.cpp `v1.9.2`, copyright the whisper.cpp contributors, MIT License.
- Microsoft Visual C++ x64 runtime components (`MSVCP140.dll`, `VCRUNTIME140.dll`, `VCRUNTIME140_1.dll`), copyright Microsoft Corporation.

Source projects:

- `https://github.com/ggml-org/llama.cpp`
- `https://github.com/ggml-org/whisper.cpp`

The bundled runtime does not include language, vision, or speech model weights. Users must explicitly select compatible model files and are responsible for the model license.
