from flask import Flask
from flask_cors import CORS
from auth_routes import auth_bp
from upload_routes import upload_bp

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(upload_bp, url_prefix="/api")

if __name__ == '__main__':
    app.run(port=5000, debug=True)
