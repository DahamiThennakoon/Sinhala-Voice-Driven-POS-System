import Database as db

# shop items and prices
prices = [
    ("සහල්",   200.0, "kg"),
    ("පාන්",    50.0,  "piece"),
    ("සීනි",   180.0, "kg"),
    ("තේ",     800.0, "kg"),
    ("පොල්",   80.0,  "piece"),
    ("දෙහි",   15.0,  "piece"),
    ("කිරි",   120.0, "liter"),
]

for item, price, unit in prices:
    db.set_price(item, price, unit)
    print(f"Added: {item} - Rs.{price}/{unit}")

print("Done!")