import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./projectvault.db")
print(f"Connecting to: {DATABASE_URL}")

# SQLite needs special args, Postgres doesn't
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)

def migrate():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255)"))
            print("Added reset_token column.")
        except Exception as e:
            print("reset_token Error:", e)

        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP"))
            print("Added reset_token_expires column.")
        except Exception as e:
            print("reset_token_expires Error:", e)
            
        try:
            # Different syntax for Postgres vs SQLite for unique index if needed, but this is usually safe
            conn.execute(text("CREATE UNIQUE INDEX ix_users_reset_token ON users (reset_token)"))
            print("Added index to reset_token.")
        except Exception as e:
            print("index Error:", e)

        conn.commit()

if __name__ == "__main__":
    migrate()
