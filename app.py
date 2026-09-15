import os
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import Database as db
from Voice import voicerecorder
from llm import process_voice_text
import difflib
from product_matcher import match_product

os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"
warnings.filterwarnings("ignore")

from transformers import logging
logging.set_verbosity_error()

app = Flask(__name__)
CORS(app)
db.init_db()

def find_closest_item(predicted_item):
    if not predicted_item or predicted_item == "unknown":
        return "unknown"
    all_prices = db.get_all_prices()
    db_items = [p["Item"] for p in all_prices]
    if not db_items:
        return predicted_item
    matches = difflib.get_close_matches(predicted_item, db_items, n=1, cutoff=0.4)
    if matches:
        return matches[0]
    return predicted_item

@app.route("/api/report")
def daily_report():
    date = request.args.get("date")
    if not date:
        date = datetime.now().strftime("%Y-%m-%d")

    daily_data = db.get_daily_report(date)
    monthly_data = db.get_monthly_report(date)

    return jsonify({
        "todayIncome": daily_data["income"],
        "todayExpense": daily_data["expense"],
        "todayProfit": daily_data["profit"],
        "monthlyIncome": monthly_data["monthly_income"],
        "monthlyExpense": monthly_data["monthly_expenses"],
        "monthlyProfit": monthly_data["monthly_profit"],
        "sales": daily_data["sales"]
    })

@app.route("/api/reports/weekly")
def weekly_report():
    date = request.args.get("date")
    return jsonify(db.get_weekly_report(date))

@app.route("/api/stock", methods=["POST"])
def update_stock():
    data = request.json
    db.set_stock(data["item"], data["quantity"], data["threshold"])
    return jsonify({"status": "ok"})

@app.route("/api/stock", methods=["GET"])
def list_stock():
    return jsonify(db.get_all_stock())

@app.route("/api/top-sellers", methods=["GET"])
def top_sellers():
    limit = request.args.get("limit", default=5, type=int)
    date = request.args.get("date")
    return jsonify(db.get_top_sellers(limit=limit, date=date))

@app.route("/api/alerts", methods=["GET"])
def list_alerts():
    return jsonify(db.get_unseen_alerts())

@app.route("/api/alerts/<int:alert_id>/seen", methods=["POST"])
def seen_alert(alert_id):
    db.mark_alert_seen(alert_id)
    return jsonify({"status": "ok"})

@app.route("/api/prices", methods=["GET"])
def get_prices():
    return jsonify(db.get_all_prices())

@app.route("/api/prices", methods=["POST"])
def set_price():
    d = request.json
    db.set_price(d["item"], d["price"], d.get("unit", "unit"))
    return jsonify({"status": "ok"})

@app.route("/api/items", methods=["GET"])
def list_items():
    prices = db.get_all_prices()
    stock_by_item = {s["Item"]: s for s in db.get_all_stock()}
    items = []
    for p in prices:
        s = stock_by_item.get(p["Item"], {})
        items.append({
            "id": p["ID"], "name": p["Item"], "category": p.get("Category") or "",
            "costPrice": p.get("CostPrice") or 0, "sellingPrice": p["Price"],
            "unit": p["Unit"], "stock": s.get("Quantity", 0), "lowStockThreshold": s.get("Threshold", 0),
        })
    return jsonify(items)

@app.route("/api/items", methods=["POST"])
def create_item():
    d = request.json
    db.set_price(
        d["name"], d["sellingPrice"], d.get("unit", "unit"),
        category=d.get("category", ""), cost_price=d.get("costPrice", 0)
    )
    db.set_stock(d["name"], d.get("stock", 0), d.get("lowStockThreshold", 0))
    return jsonify({"status": "ok"})

@app.route("/api/sales", methods=["GET"])
def list_sales():
    return jsonify(db.get_sales())

@app.route("/api/sales", methods=["POST"])
def create_sale_route():
    d = request.json
    today = datetime.now().strftime("%Y-%m-%d")
    price = d.get("price")
    if price is None:
        price_data = db.get_price(d["item"])
        price = price_data["price"] if price_data else 0
    db.insert_sale(d["item"], d["quantity"], price, d.get("date", today))
    return jsonify({"status": "ok"})

@app.route("/api/expenses", methods=["GET"])
def list_expenses():
    return jsonify(db.get_expenses())

@app.route("/api/voice", methods=["POST"])
def voice_transcribe():

    if "audio" not in request.files:
        return jsonify({
            "error": "No audio file received"
        }), 400

    try:
        # 1. Get audio file

        audio_file = request.files["audio"]
        audio_bytes = audio_file.read()

        if not audio_bytes:
            return jsonify({
                "error": "Empty audio file"
            }), 400

        # 2. Speech -> Sinhala text
        vr = voicerecorder()

        text = vr.get_transcription_from_bytes(audio_bytes)

        print("Transcribed text:", text)

        if not text or not text.strip():
            return jsonify({
                "error": "Could not recognize speech",
                "transcript": "",
                "type": "sale",
                "items": [],
                "total": 0
            }), 200

        # 3. Sinhala transcript - Multiple products

        detected_items = match_product(text)

        print("Matched products:", detected_items)

        # 4. Make sure result is always a list

        if detected_items is None:
            detected_items = []

        elif isinstance(detected_items, dict):
            detected_items = [detected_items]

        # 5. Calculate grand total

        grand_total = 0

        for item in detected_items:

            try:
                item["quantity"] = float(item.get("quantity", 1))
                item["price"] = float(item.get("price", 0))
                item["total"] = float(
                    item["quantity"] * item["price"]
                )

                grand_total += item["total"]

            except (ValueError, TypeError):
                continue

        # 6. Send result to React
        
        response = {
            "transcript": text,
            "type": "sale",
            "items": detected_items,
            "total": grand_total
        }

        print("Final voice response:", response)

        return jsonify(response), 200

    except Exception as e:

        print("Voice processing error:", str(e))

        return jsonify({
            "error": "Voice processing failed",
            "message": str(e)
        }), 500

@app.route('/api/settings', methods=['GET'])
def get_settings_route():
    settings = db.get_settings()
    if settings is None:
        return jsonify({"shopName": "", "ownerName": "", "currency": "LKR (Rs.)", "lowStockThreshold": 10, "language": "Sinhala + English"})
    return jsonify(settings)

@app.route('/api/settings', methods=['POST'])
def update_settings_route():
    data = request.json
    db.update_settings(
        data['shopName'], data['ownerName'], data['currency'],
        data['lowStockThreshold'], data['language']
    )
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(port=5000, debug=True)