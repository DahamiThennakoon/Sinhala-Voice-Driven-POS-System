import re
from difflib import SequenceMatcher
from Database import get_all_prices


# =========================================================
# Sinhala Numbers
# =========================================================

SINHALA_NUMBERS = {
    "එක": 1,
    "එකයි": 1,
    "එකක්": 1,
    "එක්": 1,

    "දෙක": 2,
    "දෙකයි": 2,
    "දෙකක්": 2,
    "දෙ": 2,

    "තුන": 3,
    "තුනයි": 3,
    "තුනක්": 3,

    "හතර": 4,
    "හතරයි": 4,
    "හතරක්": 4,

    "පහ": 5,
    "පහයි": 5,
    "පහක්": 5,

    "හය": 6,
    "හයයි": 6,
    "හයක්": 6,

    "හත": 7,
    "හතයි": 7,
    "හතක්": 7,

    "අට": 8,
    "අටයි": 8,
    "අටක්": 8,

    "නවය": 9,
    "නවයයි": 9,
    "නවයක්": 9,

    "දහය": 10,
    "දහයයි": 10,
    "දහයක්": 10,
}


# =========================================================
# Product Aliases
# =========================================================

ALIASES = {

    # ---------------- Rice ----------------

    "කීරි සම්බු": "කීරි සම්බා හාල්",
    "කීරි සම්බා": "කීරි සම්බා හාල්",
    "කීරි සම්බ": "කීරි සම්බා හාල්",

    "නාඩු": "නාඩු හාල්",

    "සම්බු හාල්": "සම්බා හාල්",
    "සම්බා": "සම්බා හාල්",

    "සුදු කැකුළු": "සුදු කැකුළු හාල්",
    "සුදු කැකුලු": "සුදු කැකුළු හාල්",

    "රතු කැකුළු": "රතු කැකුළු හාල්",
    "රතු කැකුලු": "රතු කැකුළු හාල්",


    # ---------------- Bread ----------------

    "පාන්": "පාන්",


    # ---------------- Onion / Garlic ----------------

    "ලොකු ලූණු": "ලොකු ළූණු",
    "ලොකු ලූනු": "ලොකු ළූණු",
    "ලොකු ළුනු": "ලොකු ළූණු",

    "රතු ලූණු": "රතු ළූණු",
    "රතු ලූනු": "රතු ළූණු",
    "රතු ළුනු": "රතු ළූණු",

    "සුදු ලූණු": "සුදුලූනු",
    "සුදු ලූනු": "සුදුලූනු",
    "සුදු ළූණු": "සුදුලූනු",


    # ---------------- Salt ----------------

    "ලුනු කුඩු": "ලුණු කුඩු",
    "ලුණු කුඩු": "ලුණු කුඩු",

    "ලුනු කැට": "ලුණු කැට",
    "ලුණු කැට": "ලුණු කැට",


    # ---------------- Samaposha ----------------

    "ෂමපෝෂ": "සමපෝෂ",
    "සමපෝශ": "සමපෝෂ",
    "සම්පෝෂ": "සමපෝෂ",


    # ---------------- Marie ----------------

    "මාරි": "මාරි බිස්කට් (Marie)",


    # ---------------- Kottu Mee ----------------

    "කොත්තු මී": "ඉන්ස්ටන්ට් නූඩ්ල්ස්- කොත්තු මී",
    "කොත්තුමි": "ඉන්ස්ටන්ට් නූඩ්ල්ස්- කොත්තු මී",

    "කොත්තු මී සිංගල්": "ඉන්ස්ටන්ට් නූඩ්ල්ස්- කොත්තු මී (Single)",
    "කොත්තුමි සිංගල්": "ඉන්ස්ටන්ට් නූඩ්ල්ස්- කොත්තු මී (Single)",

    "කොත්තු මී ෆැමිලි": "ඉන්ස්ටන්ට් නූඩ්ල්ස් - කොත්තු මී (Family Pack)",
    "කොත්තු මී ෆැමිලි පැක්": "ඉන්ස්ටන්ට් නූඩ්ල්ස් - කොත්තු මී (Family Pack)",
    "කොත්තුමි ෆැමිලි": "ඉන්ස්ටන්ට් නූඩ්ල්ස් - කොත්තු මී (Family Pack)",
    "කොත්තුමි ෆැමිලි පැක්": "ඉන්ස්ටන්ට් නූඩ්ල්ස් - කොත්තු මී (Family Pack)",

    # Whisper can produce these
    "කොත් තුනු": "ඉන්ස්ටන්ට් නූඩ්ල්ස් - කොත්තු මී (Family Pack)",
    "කොත් තුනු ෆැමිලි": "ඉන්ස්ටන්ට් නූඩ්ල්ස් - කොත්තු මී (Family Pack)",
    "කොත් තුනු ෆැමිලි පැක්": "ඉන්ස්ටන්ට් නූඩ්ල්ස් - කොත්තු මී (Family Pack)",


    # ---------------- Sunlight ----------------

    "සන්ලයිට්": "රෙදි සෝදන සබන් කැට/සන්ලයිට්",

    "සන්ලයිට් සබන්": "රෙදි සෝදන සබන් කැට/සන්ලයිට්",
    "සන්ලයිට් කැට": "රෙදි සෝදන සබන් කැට/සන්ලයිට්",


    # ---------------- Cream Cracker ----------------

    "ක්‍රීම් කැකර්": "ක්‍රීම් කැකර් (Cream Cracker)",
    "ක්රීම් කැකර්": "ක්‍රීම් කැකර් (Cream Cracker)",
    "ක්‍රීම කැකර්": "ක්‍රීම් කැකර් (Cream Cracker)",
    "ක්රීම කැකර්": "ක්‍රීම් කැකර් (Cream Cracker)",

    "ක්‍රීම් ක්‍රැකර්": "ක්‍රීම් කැකර් (Cream Cracker)",
    "ක්රීම් ක්රැකර්": "ක්‍රීම් කැකර් (Cream Cracker)",
}


# =========================================================
# Normalize text
# =========================================================

def normalize_text(text):

    if not text:
        return ""

    text = str(text).lower()

    # Remove zero-width characters
    text = text.replace("\u200c", "")
    text = text.replace("\u200d", "")
    text = text.replace("\ufeff", "")

    # Tabs -> spaces
    text = text.replace("\t", " ")

    # Punctuation
    text = re.sub(
        r"[.,!?;:\"'()\[\]{}\-_/]",
        " ",
        text
    )

    # Multiple spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()


# =========================================================
# Clean database product name
# =========================================================

def clean_product_name(name):

    name = normalize_text(name)

    # Remove package size information
    name = re.sub(
        r"\b\d+(?:\.\d+)?\s*g\b",
        "",
        name
    )

    name = re.sub(
        r"\b\d+(?:\.\d+)?\s*kg\b",
        "",
        name
    )

    name = re.sub(
        r"\b\d+(?:\.\d+)?\s*ml\b",
        "",
        name
    )

    name = re.sub(
        r"\b\d+(?:\.\d+)?\s*liter\b",
        "",
        name
    )

    # Remove common package ranges
    name = re.sub(
        r"\b\d+\s*-\s*\d+\b",
        "",
        name
    )

    # Remove tabs/spaces again
    name = re.sub(r"\s+", " ", name)

    return name.strip()


# =========================================================
# Number extraction
# =========================================================

def extract_quantity_from_text(text):

    text = normalize_text(text)

    # Numeric number
    match = re.search(
        r"(\d+(?:\.\d+)?)",
        text
    )

    if match:
        return float(match.group(1))

    words = text.split()

    # Longest first
    for word in sorted(
        SINHALA_NUMBERS.keys(),
        key=len,
        reverse=True
    ):

        if word in words:
            return float(
                SINHALA_NUMBERS[word]
            )

    return 1.0


# =========================================================
# Unit detection
# =========================================================

def detect_unit(text, database_unit):

    text = normalize_text(text)

    if any(x in text for x in [
        "කිලෝ",
        "කීලෝ",
        "කිලෝග්‍රෑම්",
        "kg"
    ]):
        return "kg"

    if any(x in text for x in [
        "ග්‍රෑම්",
        "ග්රෑම්",
        "gram",
        "g"
    ]):
        return "g"

    if any(x in text for x in [
        "ලීටර්",
        "ලිටර්",
        "liter",
        "litre"
    ]):
        return "liter"

    if any(x in text for x in [
        "කෑලි",
        "කැලි",
        "කෑල්ල",
        "කැල්ල"
    ]):
        return "piece"

    return database_unit


# =========================================================
# Similarity
# =========================================================

def similarity(a, b):

    a = normalize_text(a)
    b = normalize_text(b)

    if not a or not b:
        return 0.0

    return SequenceMatcher(
        None,
        a,
        b
    ).ratio()


# =========================================================
# Find product by exact name
# =========================================================

def find_database_product(product_name, products):

    target = clean_product_name(product_name)

    for product in products:

        db_name = clean_product_name(
            product["Item"]
        )

        if db_name == target:
            return product

    return None


# =========================================================
# Alias matching
# =========================================================

def alias_match(text, products):

    text = normalize_text(text)

    # Long aliases first
    aliases = sorted(
        ALIASES.items(),
        key=lambda x: len(
            normalize_text(x[0])
        ),
        reverse=True
    )

    for alias, product_name in aliases:

        alias_normalized = normalize_text(
            alias
        )

        if alias_normalized in text:

            product = find_database_product(
                product_name,
                products
            )

            if product:
                return product

    return None


# =========================================================
# Exact database matching
# =========================================================

def exact_match(text, products):

    text = normalize_text(text)

    for product in products:

        name = clean_product_name(
            product["Item"]
        )

        if not name:
            continue

        if name in text:
            return product

    return None


# =========================================================
# Extract possible product phrase
# =========================================================

def get_product_words(text):

    words = normalize_text(text).split()

    # Remove quantity/unit words
    ignored = {
        "එක",
        "එකයි",
        "එකක්",
        "එක්",
        "දෙක",
        "දෙකයි",
        "දෙකක්",
        "දෙ",
        "තුන",
        "තුනයි",
        "තුනක්",
        "හතර",
        "හතරයි",
        "හතරක්",
        "පහ",
        "පහයි",
        "පහක්",
        "හය",
        "හයයි",
        "හයක්",
        "හත",
        "හතයි",
        "හතක්",
        "අට",
        "අටයි",
        "අටක්",
        "නවය",
        "නවයයි",
        "නවයක්",
        "දහය",
        "දහයයි",
        "දහයක්",

        "කිලෝ",
        "කීලෝ",
        "කිලෝග්‍රෑම්",
        "ග්‍රෑම්",
        "ග්රෑම්",
        "kg",
        "g",
        "කෑලි",
        "කැලි",
        "කෑල්ල",
        "කැල්ල",
        "ලීටර්",
        "ලිටර්",
        "liter",
        "litre",
    }

    return [
        word
        for word in words
        if word not in ignored
    ]


# =========================================================
# STRICT fuzzy matching
# =========================================================

def strict_fuzzy_match(text, products):

    text = normalize_text(text)

    if not text:
        return None

    text_words = get_product_words(text)

    if not text_words:
        return None

    # -----------------------------------------------------
    # Build candidate phrases
    # -----------------------------------------------------

    best_product = None
    best_score = 0.0

    for product in products:

        product_name = clean_product_name(
            product["Item"]
        )

        if not product_name:
            continue

        product_words = product_name.split()

        # -------------------------------------------------
        # Token matching
        # -------------------------------------------------

        common = set(
            text_words
        ).intersection(
            set(product_words)
        )

        token_score = 0.0

        if product_words:

            token_score = (
                len(common)
                / len(product_words)
            )

        # -------------------------------------------------
        # Window matching
        # -------------------------------------------------

        window_score = 0.0

        max_window = min(
            len(product_words) + 2,
            len(text_words)
        )

        for size in range(
            1,
            max_window + 1
        ):

            for i in range(
                len(text_words) - size + 1
            ):

                window = " ".join(
                    text_words[
                        i:i + size
                    ]
                )

                score = similarity(
                    product_name,
                    window
                )

                window_score = max(
                    window_score,
                    score
                )

        # -------------------------------------------------
        # Full similarity
        # -------------------------------------------------

        full_score = similarity(
            product_name,
            " ".join(text_words)
        )

        score = max(
            token_score,
            window_score,
            full_score
        )

        # -------------------------------------------------
        # Strong matching only
        # -------------------------------------------------

        if score > best_score:

            best_score = score
            best_product = product

    # -----------------------------------------------------
    # IMPORTANT:
    # Do NOT return weak random matches.
    # -----------------------------------------------------

    if best_product is None:
        return None

    # Very strict threshold
    if best_score >= 0.72:
        return best_product

    return None


# =========================================================
# Find single product
# =========================================================

def find_product(text, products):

    # 1. Alias
    product = alias_match(
        text,
        products
    )

    if product:
        return product

    # 2. Exact DB name
    product = exact_match(
        text,
        products
    )

    if product:
        return product

    # 3. Strict fuzzy
    return strict_fuzzy_match(
        text,
        products
    )


# =========================================================
# Split multiple products
# =========================================================

def split_product_segments(text, products):

    text = normalize_text(text)

    if not text:
        return []

    words = text.split()

    candidates = []

    # -----------------------------------------------------
    # Database product candidates
    # -----------------------------------------------------

    for product in products:

        name = clean_product_name(
            product["Item"]
        )

        if name:

            candidates.append({
                "name": name,
                "product": product,
                "alias": False
            })

    # -----------------------------------------------------
    # Alias candidates
    # -----------------------------------------------------

    for alias, product_name in ALIASES.items():

        product = find_database_product(
            product_name,
            products
        )

        if product:

            candidates.append({
                "name": normalize_text(alias),
                "product": product,
                "alias": True
            })

    found = []

    # -----------------------------------------------------
    # Search every position
    # -----------------------------------------------------

    for i in range(len(words)):

        best = None

        # Maximum product phrase length
        for length in range(
            1,
            min(7, len(words) - i) + 1
        ):

            window = " ".join(
                words[
                    i:i + length
                ]
            )

            for candidate in candidates:

                candidate_name = candidate["name"]

                # Exact phrase
                if candidate_name == window:

                    score = 1.0

                # Alias substring
                elif (
                    candidate["alias"]
                    and candidate_name in window
                ):

                    score = 0.98

                else:

                    score = similarity(
                        candidate_name,
                        window
                    )

                # Token overlap
                candidate_words = set(
                    candidate_name.split()
                )

                window_words = set(
                    window.split()
                )

                if candidate_words:

                    token_score = (
                        len(
                            candidate_words
                            .intersection(
                                window_words
                            )
                        )
                        /
                        len(candidate_words)
                    )

                    score = max(
                        score,
                        token_score
                    )

                if (
                    best is None
                    or score > best["score"]
                ):

                    best = {
                        "start": i,
                        "end": i + length,
                        "product": candidate["product"],
                        "score": score
                    }

        # -------------------------------------------------
        # IMPORTANT STRICT THRESHOLD
        # -------------------------------------------------

        if best and best["score"] >= 0.72:

            found.append(best)

    # -----------------------------------------------------
    # Remove overlapping matches
    # -----------------------------------------------------

    found.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    selected = []
    used = set()

    for item in found:

        positions = set(
            range(
                item["start"],
                item["end"]
            )
        )

        if positions.intersection(used):
            continue

        selected.append(item)
        used.update(positions)

    selected.sort(
        key=lambda x: x["start"]
    )

    # -----------------------------------------------------
    # Build segments
    # -----------------------------------------------------

    segments = []

    for index, item in enumerate(selected):

        start = item["start"]

        if index + 1 < len(selected):

            end = selected[
                index + 1
            ]["start"]

        else:

            end = len(words)

        segment_text = " ".join(
            words[start:end]
        )

        segments.append({
            "text": segment_text,
            "product": item["product"],
            "score": item["score"]
        })

    return segments


# =========================================================
# MAIN
# =========================================================

def match_product(product_text):

    products = get_all_prices()

    if not products:
        return []

    text = normalize_text(
        product_text
    )

    if not text:
        return []

    # -----------------------------------------------------
    # First check whether this is ONE clear product
    # -----------------------------------------------------

    single_product = find_product(
        text,
        products
    )

    if single_product:

        quantity = extract_quantity_from_text(
            text
        )

        unit = detect_unit(
            text,
            single_product["Unit"]
        )

        price = float(
            single_product["Price"]
        )

        return [{
            "item": single_product["Item"],
            "quantity": quantity,
            "price": price,
            "unit": unit,
            "total": quantity * price
        }]

    # -----------------------------------------------------
    # Multiple products
    # -----------------------------------------------------

    segments = split_product_segments(
        text,
        products
    )

    results = []

    for segment in segments:

        product = segment["product"]

        segment_text = segment["text"]

        quantity = extract_quantity_from_text(
            segment_text
        )

        unit = detect_unit(
            segment_text,
            product["Unit"]
        )

        price = float(
            product["Price"]
        )

        results.append({
            "item": product["Item"],
            "quantity": quantity,
            "price": price,
            "unit": unit,
            "total": quantity * price
        })

    return results

