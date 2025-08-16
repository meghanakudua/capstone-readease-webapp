from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os
from db import get_db_connection
from dotenv import load_dotenv

load_dotenv()
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name, email, password = data.get('name'), data.get('email'), data.get('password')

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"message": "User already exists"}), 400

    hashed_password = generate_password_hash(password)
    cur.execute("INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
                (name, email, hashed_password))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "User created successfully"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email, password = data.get('email'), data.get('password')

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, email, password FROM users WHERE email=%s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user or not check_password_hash(user[3], password):
        return jsonify({"message": "Invalid credentials"}), 401

    token = jwt.encode({
        "id": user[0],
        "email": user[2],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }, os.getenv("JWT_SECRET"), algorithm="HS256")

    return jsonify({
        "token": token,
        "user": {"id": user[0], "name": user[1], "email": user[2]}
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # No real JWT invalidation unless you use a blacklist
    return jsonify({"message": "Logged out"}), 200

