import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./projectvault.db")
print(f"Connecting to: {DATABASE_URL}")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)

def migrate():
    with engine.connect() as conn:
        try:
            # This is universally compatible for adding a nullable column in both SQLite and Postgres
            conn.execute(text("ALTER TABLE users ADD COLUMN profile_picture_url VARCHAR(500)"))
            print("Successfully added profile_picture_url column to users table.")
        except Exception as e:
            # In SQLite and Postgres, if the column exists, it will throw an error and we just catch it harmlessly
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                print("Column profile_picture_url already exists. Skipping.")
            else:
                print("Error:", e)

        conn.commit()

if __name__ == "__main__":
    migrate()
