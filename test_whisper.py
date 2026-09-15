import traceback
import sys

print("Python:", sys.version)

try:
    import ctranslate2
    print("ctranslate2:", ctranslate2.__version__)
except Exception as e:
    print("ctranslate2 import failed:", e)
    traceback.print_exc()

try:
    from faster_whisper import WhisperModel
    print("faster_whisper imported ok")
    print("loading model...")
    m = WhisperModel("small", device="cpu", compute_type="float32")
    print("model loaded ok")
except Exception as e:
    print("ERROR:", e)
    traceback.print_exc()
finally:
    print("done")