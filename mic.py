"""
Quick diagnostic: lists audio devices, records 5 seconds from device=1
(same as Voice.py), and reports whether real sound was actually captured.

Run this directly:  python mic_diagnostic.py
"""
import sounddevice as sd
import numpy as np
from scipy.io.wavfile import write

print("=" * 60)
print("AVAILABLE AUDIO DEVICES")
print("=" * 60)
print(sd.query_devices())
print()

default_in = sd.default.device[0]
print(f"Windows default INPUT device index: {default_in}")
print(f"Voice.py is currently hardcoded to use device index: 1")
print()

fs = 44100
recordtime = 5

print(f"Recording {recordtime}s from device=1 ... SPEAK NOW!")
try:
    audio = sd.rec(int(recordtime * fs), samplerate=fs, channels=1, device=1)
    sd.wait()
    used_device = 1
except Exception as e:
    print(f"device=1 failed ({e}), falling back to default device")
    audio = sd.rec(int(recordtime * fs), samplerate=fs, channels=1)
    sd.wait()
    used_device = default_in

print("Recording finished.")
print()

audio = np.array(audio)
max_amp = np.max(np.abs(audio))
mean_amp = np.mean(np.abs(audio))

print("=" * 60)
print("RESULTS")
print("=" * 60)
print(f"Device actually used : {used_device} ({sd.query_devices(used_device)['name']})")
print(f"Max amplitude         : {max_amp:.5f}  (0.0 = pure silence, 1.0 = max possible)")
print(f"Mean abs amplitude    : {mean_amp:.5f}")

if max_amp < 0.01:
    print()
    print("!! WARNING: This looks like SILENCE. The mic did not capture real")
    print("   sound. Likely causes: wrong device index, muted mic, mic")
    print("   volume set to 0 in Windows, or another app has exclusive")
    print("   control of the microphone.")
elif max_amp < 0.05:
    print()
    print("!! WARNING: Very quiet signal. Whisper models often hallucinate")
    print("   random text (English words, other scripts, gibberish) on")
    print("   near-silent audio. Try speaking louder / closer to the mic,")
    print("   or increase mic input volume in Windows sound settings.")
else:
    print()
    print("Signal level looks reasonable - real audio was captured.")
    print("If transcription is still wrong, the issue is likely model")
    print("accuracy rather than the microphone.")

write("mic_diagnostic_output.wav", fs, audio)
print()
print("Saved recording to mic_diagnostic_output.wav - play this file to")
print("listen to exactly what the model received.")