# Sinhala Voice Driven POS System 🎙️🧾

# SinhalaPOS 🎙️🧾

A Sinhala-language, voice-enabled Point of Sale (POS) system built for small shops and retail businesses. Speak a sale in Sinhala, and it gets transcribed, understood, and added straight to the cart.

## Features

- 🎤 **Voice-based sales entry** — speak item names, quantities, and prices in Sinhala
- 🧠 **AI-powered extraction** — Whisper (fine-tuned for Sinhala) + a local LLM (Ollama `gemma2:2b`) turn speech into structured cart items
- 📦 Product & inventory management
- 💰 Sales history and expense tracking
- 📊 Reports and dashboard analytics
- 🔐 Role-based access (owner vs. staff/cashier)
- 🇱🇰 Built for the South Asian market (currency: Rs.)

## Tech Stack

**Frontend:** React + Vite, Tailwind CSS, React Router v6, Recharts, Lucide Icons

**Backend:** Flask, SQLite

**AI/ML:** OpenAI Whisper (fine-tuned on Sinhala audio), Ollama (`gemma2:2b`) for intent/text extraction, custom fuzzy product matcher

**Audio processing:** FFmpeg, pydub, soundfile

## Project Structure

```
├── app.py                # Main Flask app
├── Database.py           # SQLite database logic
├── llm.py                # LLM (Ollama) integration for extracting sale items
├── mic.py                # Microphone/audio capture helpers
├── product_matcher.py    # Fuzzy matching for product names
├── add_prices.py         # Utility script for pricing
├── requirements.txt      # Python dependencies
└── frontend/             # React + Vite frontend
    ├── src/
    └── public/
```

## Getting Started

### Backend

```bash
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

You'll also need [Ollama](https://ollama.com) running locally with the `gemma2:2b` model pulled:

```bash
ollama pull gemma2:2b
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Copy `.env.example` to `.env` inside the `frontend/` folder and fill in any required values.

## How It Works

1. User records audio in the browser (WebM)
2. Audio is converted to WAV using FFmpeg/pydub
3. Whisper transcribes the Sinhala speech to text
4. The local LLM (`gemma2:2b`) extracts structured item data (name, quantity, price) as JSON
5. Extracted items are fuzzy-matched against the product database
6. Matched items are added to the active cart on the POS screen

## Status

✅ Completed as a university mini project. All core features — voice pipeline, POS, inventory, sales, expenses, reports, settings, and auth — are implemented and functional.

## License

This project is for educational/portfolio purposes.
