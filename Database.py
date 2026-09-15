import sqlite3
from datetime import datetime, timedelta

#create sales database
def get_connection():
    conn=sqlite3.connect("sales.db")
    conn.row_factory = sqlite3.Row
    return conn

def migrate_prices_table(conn):
    """Older versions of this app created 'prices' with Item as UNIQUE
    and no Variant column. Upgrade it in place, keeping existing data,
    so set_price()/get_price() (which expect a Variant column) work."""
    cols = [row["name"] for row in conn.execute("PRAGMA table_info(prices)").fetchall()]

    if cols and "Variant" not in cols:
        conn.execute("ALTER TABLE prices RENAME TO prices_old")
        conn.execute("""
            CREATE TABLE prices (
                ID          INTEGER PRIMARY KEY AUTOINCREMENT,
                Item        TEXT NOT NULL,
                Unit        TEXT NOT NULL,
                Variant     TEXT NOT NULL DEFAULT 'default',
                Price       REAL NOT NULL,
                Updated_At  TEXT DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(Item,Variant)
            )
        """)
        conn.execute("""
            INSERT INTO prices (Item, Unit, Variant, Price, Updated_At)
            SELECT Item, Unit, 'default', Price, Updated_At FROM prices_old
        """)
        conn.execute("DROP TABLE prices_old")
        conn.commit()
        print("Migrated 'prices' table to new schema (added Variant column)")

def migrate_price_item_columns(conn):
    """Add Category and CostPrice columns to prices, needed for the
    Items management page (category grouping, profit margin later)."""
    cols = [row["name"] for row in conn.execute("PRAGMA table_info(prices)").fetchall()]
    if "Category" not in cols:
        conn.execute("ALTER TABLE prices ADD COLUMN Category TEXT DEFAULT ''")
    if "CostPrice" not in cols:
        conn.execute("ALTER TABLE prices ADD COLUMN CostPrice REAL DEFAULT 0")
    conn.commit()

#create sales table
def init_db():

    conn=get_connection()
    cursor=conn.cursor() #create a cursor


    cursor.execute("""CREATE TABLE IF NOT EXISTS sales(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Item TEXT NOT NULL,
        Quantity INTEGER NOT NULL,
        UnitPrice REAL NOT NULL,
        Total REAL NOT NULL,
        Date TEXT DEFAULT CURRENT_TIMESTAMP
        ); 
    """)

    #create expense table
    cursor.execute("""CREATE TABLE IF NOT EXISTS expense(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Category TEXT NOT NULL,
        Amount REAL NOT NULL,
        Note TEXT,
        Date TEXT DEFAULT CURRENT_TIMESTAMP
        ); 
    """)

    #create stock table
    cursor.execute("""CREATE TABLE IF NOT EXISTS stock(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Item TEXT UNIQUE NOT NULL,
        Quantity REAL NOT NULL,
        Threshold REAL NOT NULL,
        Created_At TEXT DEFAULT CURRENT_TIMESTAMP
        ); 
    """)

    #create alerts table
    cursor.execute("""CREATE TABLE IF NOT EXISTS alerts(
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Item TEXT NOT NULL,
        Message TEXT,
        IS_seen INTEGER NOT NULL DEFAULT 0,
        Date TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)

    #create price table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS prices (
        ID          INTEGER PRIMARY KEY AUTOINCREMENT,
        Item        TEXT NOT NULL,
        Unit        TEXT NOT NULL,
        Variant TEXT NOT NULL DEFAULT 'default',
        Price       REAL NOT NULL,
        Updated_At  TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(Item,Variant)
    );
    """)

    conn.execute('''
        CREATE TABLE IF NOT EXISTS Settings (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            ShopName TEXT,
            OwnerName TEXT,
            Currency TEXT DEFAULT 'LKR (Rs.)',
            LowStockThreshold INTEGER DEFAULT 10,
            Language TEXT DEFAULT 'Sinhala + English',
            Updated_At TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    migrate_prices_table(conn)
    migrate_price_item_columns(conn)

    try:
        conn.commit() #save changes 
        print("tables created successfully")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        #close database
        conn.close()

def insert_sale(item,quantity, price, date):
    total=quantity*price

    conn=get_connection()
    conn.execute("""INSERT INTO sales(Item,Quantity,UnitPrice,Total,Date) VALUES(?,?,?,?,?)""", (item,quantity,price,total,date))

    conn.commit()
    conn.close()

    decrease_stock(item, quantity)

def insert_expense(category,amount,note,date):
    conn=get_connection()
    conn.execute("""INSERT INTO expense(Category,Amount,Note,Date) VALUES(?,?,?,?)""",(category,amount,note,date))

    conn.commit()
    conn.close()

def get_daily_report(date):

    conn=get_connection()
    result=conn.execute("""SELECT SUM(Total) FROM sales WHERE Date=?""",(date,)).fetchone()

    income=result[0] or 0

    result=conn.execute("""SELECT SUM(Amount) FROM expense WHERE Date=?""",(date,)).fetchone()

    expense=result[0] or 0

    profit=income-expense

    rows = conn.execute(
        "SELECT ID, Item, Quantity, UnitPrice, Total, Date FROM sales WHERE Date=? ORDER BY ID DESC",
        (date,)
    ).fetchall()
    sales = [
        {
            "id": r["ID"],
            "date": r["Date"],
            "item": r["Item"],
            "quantity": r["Quantity"],
            "price": r["UnitPrice"],
            "total": r["Total"],
        }
        for r in rows
    ]

    conn.close()

    return{
        "date":date,
        "income":income,
        "expense":expense,
        "profit":profit,
        "sales":sales
    }

def set_stock(item,quantity,threshold):
    conn=get_connection()

    conn.execute("""INSERT INTO stock(Item,Quantity,Threshold)VALUES(?,?,?)
                    ON CONFLICT (Item) DO UPDATE SET
                    Quantity=excluded.Quantity,
                    Threshold=excluded.Threshold""",(item,quantity,threshold))
    
    conn.commit()
    conn.close()

    check_low_stock(item)

def decrease_stock(item, quantity):
    """Reduce stock quantity after a sale. If the item isn't tracked in
    stock yet, this silently does nothing (not every sold item needs
    stock tracking, e.g. items without a threshold set)."""
    conn = get_connection()
    row = conn.execute("SELECT Quantity FROM stock WHERE Item=?", (item,)).fetchone()

    if row is None:
        conn.close()
        return

    new_quantity = row["Quantity"] - quantity
    conn.execute("UPDATE stock SET Quantity=? WHERE Item=?", (new_quantity, item))
    conn.commit()
    conn.close()

    check_low_stock(item)

def check_low_stock(item):
    """If an item's stock has fallen to/below its threshold, create an
    alert - but only if there isn't already an unseen alert for that
    item, so we don't spam duplicate alerts on every sale."""
    conn = get_connection()
    row = conn.execute(
        "SELECT Quantity, Threshold FROM stock WHERE Item=?", (item,)
    ).fetchone()

    if row is None:
        conn.close()
        return

    if row["Quantity"] <= row["Threshold"]:
        existing = conn.execute(
            "SELECT ID FROM alerts WHERE Item=? AND IS_seen=0", (item,)
        ).fetchone()

        if existing is None:
            message = f"{item} stock low: {row['Quantity']} left (threshold {row['Threshold']})"
            conn.execute(
                "INSERT INTO alerts(Item, Message, IS_seen) VALUES(?,?,0)",
                (item, message)
            )
            conn.commit()

    conn.close()

def get_all_stock():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM stock ORDER BY Item").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_top_sellers(limit=5, date=None):
    """Best-selling items by revenue. Pass date='YYYY-MM-DD' to scope to
    one day, or leave it None for an all-time ranking."""
    conn = get_connection()
    if date:
        rows = conn.execute("""
            SELECT Item, SUM(Quantity) AS TotalQuantity, SUM(Total) AS TotalRevenue
            FROM sales WHERE Date=?
            GROUP BY Item
            ORDER BY TotalRevenue DESC
            LIMIT ?
        """, (date, limit)).fetchall()
    else:
        rows = conn.execute("""
            SELECT Item, SUM(Quantity) AS TotalQuantity, SUM(Total) AS TotalRevenue
            FROM sales
            GROUP BY Item
            ORDER BY TotalRevenue DESC
            LIMIT ?
        """, (limit,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def mark_alert_seen(alert_id):
    conn = get_connection()
    conn.execute("UPDATE alerts SET IS_seen=1 WHERE ID=?", (alert_id,))
    conn.commit()
    conn.close()

def get_unseen_alerts():
    conn=get_connection()

    rows=conn.execute("SELECT * FROM alerts WHERE IS_seen=0").fetchall()
    conn.close()

    return [dict(row) for row in rows]

def set_price(item, price, unit="unit", variant="default", category=None, cost_price=None):
    conn = get_connection()
    # keep existing Category/CostPrice if not provided, instead of
    # wiping them back to blank/0 on every price-only update
    existing = conn.execute(
        "SELECT Category, CostPrice FROM prices WHERE Item=? AND Variant=?", (item, variant)
    ).fetchone()
    final_category = category if category is not None else (existing["Category"] if existing else "")
    final_cost_price = cost_price if cost_price is not None else (existing["CostPrice"] if existing else 0)

    conn.execute("""
        INSERT INTO prices (Item, Variant, Price, Unit, Category, CostPrice)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(Item,Variant) DO UPDATE SET
            Price = excluded.Price,
            Unit = excluded.Unit,
            Category = excluded.Category,
            CostPrice = excluded.CostPrice,
            Updated_At = CURRENT_TIMESTAMP
    """, (item, variant, price, unit, final_category, final_cost_price))
    conn.commit()
    conn.close()

def get_price(item,Variant="default"):
    conn = get_connection()
    row = conn.execute(
        "SELECT Price, Unit FROM prices WHERE Item = ? AND Variant=?", (item, Variant)
    ).fetchone()
    conn.close()
    if row:
        return {"price": row["Price"], "unit": row["Unit"]}
    return None

def get_price_by_id(item_id):
    conn = get_connection()
    row = conn.execute("SELECT * FROM prices WHERE ID=?", (item_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def delete_price(item_id):
    conn = get_connection()
    conn.execute("DELETE FROM prices WHERE ID=?", (item_id,))
    conn.commit()
    conn.close()

def get_all_prices():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM prices ORDER BY Item").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_stock_by_id(stock_id):
    conn = get_connection()
    row = conn.execute("SELECT * FROM stock WHERE ID=?", (stock_id,)).fetchone()
    conn.close()
    return dict(row) if row else None

def delete_stock(item):
    conn = get_connection()
    conn.execute("DELETE FROM stock WHERE Item=?", (item,))
    conn.commit()
    conn.close()

def get_expenses():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM expense ORDER BY ID DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_expense(expense_id):
    conn = get_connection()
    conn.execute("DELETE FROM expense WHERE ID=?", (expense_id,))
    conn.commit()
    conn.close()

def update_expense(expense_id, category, amount, note, date):
    conn = get_connection()
    conn.execute(
        "UPDATE expense SET Category=?, Amount=?, Note=?, Date=? WHERE ID=?",
        (category, amount, note, date, expense_id)
    )
    conn.commit()
    conn.close()

def get_sales():
    conn = get_connection()
    rows = conn.execute("SELECT * FROM sales ORDER BY ID DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_settings():
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    row = conn.execute('SELECT * FROM Settings WHERE ID = 1').fetchone()
    conn.close()
    if row is None:
        return None
    return {
        "shopName": row["ShopName"],
        "ownerName": row["OwnerName"],
        "currency": row["Currency"],
        "lowStockThreshold": row["LowStockThreshold"],
        "language": row["Language"],
    }


def update_settings(shop_name, owner_name, currency, low_stock_threshold, language):
    conn = get_connection()
    existing = conn.execute('SELECT ID FROM Settings WHERE ID = 1').fetchone()

    if existing is None:
        conn.execute('''
            INSERT INTO Settings (ID, ShopName, OwnerName, Currency, LowStockThreshold, Language)
            VALUES (1, ?, ?, ?, ?, ?)
        ''', (shop_name, owner_name, currency, low_stock_threshold, language))
    else:
        conn.execute('''
            UPDATE Settings
            SET ShopName = ?, OwnerName = ?, Currency = ?, LowStockThreshold = ?, Language = ?,
                Updated_At = CURRENT_TIMESTAMP
            WHERE ID = 1
        ''', (shop_name, owner_name, currency, low_stock_threshold, language))

    conn.commit()
    conn.close()

def get_weekly_report(reference_date=None):
    """Daily sales/expense totals for the Mon-Sun week containing
    reference_date (defaults to today). Every day of the week is included
    even if it has no sales/expenses (shows as 0), so the chart always
    has all 7 bars instead of only the days that happen to have data."""
    if reference_date is None:
        reference_date = datetime.now().strftime("%Y-%m-%d")
    ref = datetime.strptime(reference_date, "%Y-%m-%d")
    monday = ref - timedelta(days=ref.weekday())
    date_strs = [(monday + timedelta(days=i)).strftime("%Y-%m-%d") for i in range(7)]

    conn = get_connection()
    placeholders = ",".join("?" * 7)
    sales_rows = conn.execute(
        f"SELECT Date, SUM(Total) as total FROM sales WHERE Date IN ({placeholders}) GROUP BY Date",
        date_strs
    ).fetchall()
    expense_rows = conn.execute(
        f"SELECT Date, SUM(Amount) as total FROM expense WHERE Date IN ({placeholders}) GROUP BY Date",
        date_strs
    ).fetchall()
    conn.close()

    sales_by_date = {r["Date"]: r["total"] or 0 for r in sales_rows}
    expense_by_date = {r["Date"]: r["total"] or 0 for r in expense_rows}

    day_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return [
        {
            "day": day_labels[i],
            "date": ds,
            "sales": sales_by_date.get(ds, 0),
            "expenses": expense_by_date.get(ds, 0),
        }
        for i, ds in enumerate(date_strs)
    ]

def get_monthly_report(reference_date=None):
    if reference_date is None:
        reference_date = datetime.now().strftime("%Y-%m-%d")
    
    year_month = reference_date[:7] 

    conn = get_connection()
    
    sales_res = conn.execute(
        "SELECT SUM(Total) FROM sales WHERE Date LIKE ?", 
        (f"{year_month}%",)
    ).fetchone()
    monthly_income = sales_res[0] or 0

    expense_res = conn.execute(
        "SELECT SUM(Amount) FROM expense WHERE Date LIKE ?", 
        (f"{year_month}%",)
    ).fetchone()
    monthly_expenses = expense_res[0] or 0

    conn.close()

    monthly_profit = monthly_income - monthly_expenses

    return {
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "monthly_profit": monthly_profit,
        "monthlyIncome": monthly_income,
        "income": monthly_income
    }

def get_voice_products():
    conn = get_connection()

    rows = conn.execute("""
        SELECT
            ID,
            Item,
            Unit,
            Price,
            Category
        FROM prices
        ORDER BY Item
    """).fetchall()

    conn.close()

    return [dict(row) for row in rows]

def print_voice_products():
    conn = get_connection()

    rows = conn.execute("""
        SELECT ID, Item, Unit, Price
        FROM prices
        ORDER BY Item
    """).fetchall()

    for row in rows:
        print(
            f"ID={row['ID']} | "
            f"Item={row['Item']} | "
            f"Unit={row['Unit']} | "
            f"Price={row['Price']}"
        )

    conn.close()