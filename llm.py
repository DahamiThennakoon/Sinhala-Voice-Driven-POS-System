import ollama
import json
import re
from Database import get_all_prices

def _extract_json_block(raw):
    """
    Extract JSON array/object from the LLM response.
    """

    raw = raw.strip()

    # Remove markdown code fences
    raw = re.sub(r"```json", "", raw, flags=re.IGNORECASE)
    raw = re.sub(r"```", "", raw)

    # Find JSON array
    match = re.search(r"\[.*\]", raw, re.DOTALL)

    if match:
        return match.group(0)

    # Find JSON object
    match = re.search(r"\{.*\}", raw, re.DOTALL)

    if match:
        return match.group(0)

    return raw

def extract_sale(text):

    # Get products from database
    products = get_all_prices()

    # Create a clean product list for the LLM
    product_list = "\n".join(
        f"- {p['Item']} | Unit: {p['Unit']} | Price: {p['Price']}"
        for p in products
    )

    prompt = f"""
ඔබ ශ්‍රී ලංකාවේ grocery shop POS system එකක Sinhala product matching assistant කෙනෙකි.

Customer විසින් පැවසූ voice transcript එක:

{text}

Database එකේ ඇති products:

{product_list}

ඔබ කළ යුතු දේ:

1. Customer voice transcript එකේ සඳහන් කරන සියලුම විකුණන products හඳුනාගන්න.

2. Product name එක database එකේ ඇති product එකකට match කරන්න.

3. Speech-to-text spelling errors තිබුණත් ඒවා නිවැරදි කර database product එකට match කරන්න.

4. එක product එකක නම වචන කිහිපයකින් සමන්විත නම් ඒ වචන වෙන වෙනම products ලෙස හඳුනා නොගන්න.

උදාහරණය:

"කීරි සම්බු කිලෝ එකයි"

මෙය:
කීරි
සම්බු
එකයි

ලෙස products 3ක් නොවේ.

මෙය එකම product එකකි:

"කීරි සම්බා හාල්"

5. "කීරි සම්බු" වැනි Sinhala pronunciation / spelling error එකක් "කීරි සම්බා" ලෙස match කරන්න.

6. Quantity හඳුනාගන්න.

උදාහරණ:

"කිලෝ එකයි" = 1
"කිලෝ දෙකයි" = 2
"කිලෝ තුනයි" = 3
"පහක්" = 5
"දහයක්" = 10

7. Customer "කිලෝ", "ග්‍රෑම්", "කෑලි", "බෝතල්" වැනි units සඳහන් කළහොත් ඒවා quantity සඳහා භාවිතා කරන්න.

8. Database එකේ product එකට තිබෙන Unit එක output එකේ "unit" ලෙස භාවිතා කරන්න.

9. Database එකේ තිබෙන Price එක product එකේ selling price ලෙස භාවිතා කරන්න.

10. Customer වෙනත් price එකක් explicitly සඳහන් කළහොත් පමණක් එම price එක භාවිතා කරන්න.

11. Database එකේ match කළ නොහැකි product එකක් තිබේ නම් එය invent නොකරන්න.

12. Database එකේ product names පමණක් "item" field එකට භාවිතා කරන්න.

13. සියලුම products වෙන වෙනම JSON objects ලෙස return කරන්න.

14. ONLY valid JSON array එකක් return කරන්න.

මෙම exact format එක භාවිතා කරන්න:

[
  {{
    "item": "database product name",
    "quantity": 1,
    "price": 350.0,
    "unit": "kg"
  }}
]

Customer transcript:

{text}

JSON:
"""

    response = ollama.chat(
        model="gemma2:2b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        options={
            "temperature": 0.0,
            "num_predict": 256
        },
        keep_alive="1h"
    )

    raw = response["message"]["content"]

    print("extract_sale raw:", raw)

    cleaned = _extract_json_block(raw)

    try:
        result = json.loads(cleaned)

        if isinstance(result, dict):
            result = [result]

        if not isinstance(result, list):
            return []

        return result

    except json.JSONDecodeError:
        print("JSON parsing failed:", raw)
        return []

def process_voice_text(text):
    return extract_sale(text)