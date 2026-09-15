try:
    print("step 1: importing...")
    from Voice import voicerecorder
    print("step 2: class imported")
    
    recorder = voicerecorder()
    print("step 3: recorder created")
    
    result = recorder.record_and_transcribe()
    print("step 4: transcription done")
    
    print("Transcribed text:", result)

except Exception as e:
    print("ERROR:", e)
    import traceback
    traceback.print_exc()