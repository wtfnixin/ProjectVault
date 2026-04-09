import sqlite3

def run():
    conn = sqlite3.connect("projectvault.db")
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE projects ADD COLUMN readme TEXT;")
        conn.commit()
        print("Success adding readme column")
    except sqlite3.OperationalError as e:
        print(f"Error: {e}")
    conn.close()

if __name__ == "__main__":
    run()
