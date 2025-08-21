from flask import Blueprint, request, jsonify, send_from_directory
import os
import pdfplumber
import docx
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import re

load_dotenv()

upload_bp = Blueprint('upload', __name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'.pdf', '.docx'}

# Characters per "page" in frontend pagination
CHARS_PER_PAGE = 2000  

def allowed_file(filename):
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

def format_text_to_html(text):
    """
    Converts plain text into HTML:
    - Preserves paragraphs
    - Keeps bullet points intact
    - Adds <br> where needed
    """
    paragraphs = text.split("\n")
    html_paragraphs = []

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        # Bullet points detection
        if re.match(r"^[-•*]\s", para):
            html_paragraphs.append(f"<li>{para[1:].strip()}</li>")
        else:
            html_paragraphs.append(f"<p>{para}</p>")

    # Wrap <li> items inside <ul>
    html_output = []
    inside_list = False

    for line in html_paragraphs:
        if line.startswith("<li>") and not inside_list:
            html_output.append("<ul>")
            inside_list = True

        if not line.startswith("<li>") and inside_list:
            html_output.append("</ul>")
            inside_list = False

        html_output.append(line)

    if inside_list:
        html_output.append("</ul>")

    return "".join(html_output)

def paginate_text(full_text, chars_per_page=CHARS_PER_PAGE):
    """
    Splits HTML-friendly text into page chunks without breaking words.
    """
    words = full_text.split()
    pages = []
    current_page = ""

    for word in words:
        if len(current_page) + len(word) + 1 <= chars_per_page:
            current_page += word + " "
        else:
            pages.append(current_page.strip())
            current_page = word + " "

    if current_page.strip():
        pages.append(current_page.strip())

    return pages

@upload_bp.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF and DOCX files allowed"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    ext = os.path.splitext(filename)[1].lower()

    try:
        extracted_text = ""

        # Handle PDF extraction
        if ext == '.pdf':
            with pdfplumber.open(filepath) as pdf:
                if len(pdf.pages) > 5:
                    os.remove(filepath)
                    return jsonify({"error": "PDF exceeds 5 page limit"}), 400

                full_text = "\n".join((page.extract_text() or "") for page in pdf.pages)
                extracted_text = format_text_to_html(full_text)

        # Handle DOCX extraction
        elif ext == '.docx':
            doc = docx.Document(filepath)
            lines = [p.text for p in doc.paragraphs if p.text.strip()]
            approx_pages = len(lines) // 40
            if approx_pages > 5:
                os.remove(filepath)
                return jsonify({"error": "DOCX exceeds 5 page limit"}), 400

            full_text = "\n".join(lines)
            extracted_text = format_text_to_html(full_text)

        # Paginate HTML content
        paginated_content = paginate_text(extracted_text)

        return jsonify({
            "message": "File uploaded successfully",
            "fileName": filename,
            "fileUrl": f"http://localhost:5000/uploads/{filename}",
            "content": paginated_content  # HTML per page
        })

    except Exception as e:
        os.remove(filepath)
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500

@upload_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)
