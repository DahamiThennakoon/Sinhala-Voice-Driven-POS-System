import os
import torch
import io
import soundfile as sf
import numpy as np
import scipy.signal
import sounddevice as sd
from scipy.io.wavfile import write
from transformers import WhisperProcessor, WhisperForConditionalGeneration
from pydub import AudioSegment

torch.set_num_threads(os.cpu_count() or 4)

MODEL_PATH = "./Sinhala_Whisper_Model"

print("Loading Sinhala fine-tuned model...")

processor = WhisperProcessor.from_pretrained(MODEL_PATH)
model = WhisperForConditionalGeneration.from_pretrained(MODEL_PATH)

device = "cuda" if torch.cuda.is_available() else "cpu"

model = model.to(device)
model.eval()

print(f"Model loaded successfully on {device.upper()}!")


class voicerecorder:

    def __init__(self):
        self.fs = 44100
        self.recordtime = 10
        self.channels = 1

    def record_voice(self):

        print("\nStart recording! Speak now...")

        try:
            audio = sd.rec(
                int(self.recordtime * self.fs),
                samplerate=self.fs,
                channels=1,
                device=1
            )

        except Exception as e:

            print(
                f"Device 1 unavailable ({e}), "
                "falling back to default input device"
            )

            audio = sd.rec(
                int(self.recordtime * self.fs),
                samplerate=self.fs,
                channels=1
            )

        sd.wait()

        print("Recording ended!")

        audio = np.asarray(audio, dtype=np.float32)

        peak = np.max(np.abs(audio))

        if peak > 0:
            audio = audio / peak * 0.9

        audio_resampled = scipy.signal.resample(
            audio,
            int(len(audio) * 16000 / self.fs)
        )

        write(
            "output.wav",
            16000,
            audio_resampled
        )


    def get_transcription_from_bytes(self, audio_bytes):

        """
        Browser audio bytes -> Sinhala fine-tuned Whisper

        Audio is converted to:
        - 16 kHz
        - Mono
        - Float32
        """

        try:

            print("Processing audio bytes in memory...")

            # 1. Read browser audio=

            audio_segment = AudioSegment.from_file(
                io.BytesIO(audio_bytes)
            )

            # 2. Convert to 16 kHz mono

            audio_segment = (
                audio_segment
                .set_frame_rate(16000)
                .set_channels(1)
            )

            # 3. Export as WAV in memory

            wav_io = io.BytesIO()

            audio_segment.export(
                wav_io,
                format="wav"
            )

            wav_io.seek(0)

            # 4. Read WAV
            data, sample_rate = sf.read(wav_io)

            # 5. Convert stereo -> mono

            if len(data.shape) > 1:
                data = np.mean(data, axis=1)

            audio_np = data.astype(np.float32)

            # 6. Normalize audio
            peak = np.max(np.abs(audio_np))

            if peak > 0:
                audio_np = audio_np / peak

            # 7. Remove DC offset
            audio_np = audio_np - np.mean(audio_np)

            # 8. Make sure sample rate = 16000

            if sample_rate != 16000:

                audio_np = scipy.signal.resample(
                    audio_np,
                    int(
                        len(audio_np)
                        * 16000
                        / sample_rate
                    )
                )

            # 9. Whisper processor

            inputs = processor(
                audio_np,
                sampling_rate=16000,
                return_tensors="pt"
            )

            input_features = inputs.input_features.to(device)

            # 10. Sinhala Fine-tuned Whisper

            with torch.no_grad():

                predicted_ids = model.generate(
                    input_features,
                    language="sinhala",
                    task="transcribe",
                    max_new_tokens=256,
                    num_beams=5,
                    temperature=0.0,
                    use_cache=True,
                    no_repeat_ngram_size=3,
                )

            # 11. Convert Whisper output -> text

            text = processor.batch_decode(
                predicted_ids,
                skip_special_tokens=True
            )[0]

            print(
                "Whisper Transcribed Text:",
                text
            )

            return text

        except Exception as e:

            print(
                f"Error in transcription: {e}"
            )

            return ""