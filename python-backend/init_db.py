import MySQLdb
from db import get_db_connection

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(200) NOT NULL
        )
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("Database initialized (MySQL)")

if __name__ == "__main__":
    init_db()
