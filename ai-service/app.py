import os
from flask import Flask, request, jsonify
import google.generativeai as genai
from parser_utils import extract_text
import json

app = Flask(__name__)

# --- CONFIGURATION ---

GOOGLE_API_KEY = "AIzaSyBN2V64Gt399lF8ew1B1Bk4ggmKRoOqwHQ" 
genai.configure(api_key=GOOGLE_API_KEY)

@app.route('/process', methods=['POST'])
def process_resume():
    print("\n--- 🟢 New Request Incoming ---")
    
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    filename = file.filename
    print(f"📄 Analyzing file: {filename}")
    
    # 1. Extract Raw Text
    try:
        text = extract_text(file, filename)
        if not text:
            raise ValueError("File appears empty.")
        print(f"✅ Text extracted ({len(text)} chars)")
    except Exception as e:
        print(f"❌ EXTRACT ERROR: {str(e)}")
        return jsonify({"error": f"Extraction failed: {str(e)}"}), 500

    # 2. Query Gemini
    try:
        print("🤖 Sending to Gemini...")
        
        # FIX: We list models first to find a valid one, then use it.
        # This prevents the '404 model not found' error.
        available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        print(f"ℹ️ Available models: {available_models}")
        
        # Select the best available model dynamically
        model_name = 'models/gemini-1.5-flash'
        if 'models/gemini-1.5-flash' not in available_models:
             # Fallback if flash isn't found
            model_name = available_models[0] 
            
        print(f"🚀 Using Model: {model_name}")
        model = genai.GenerativeModel(model_name)
        
        prompt = f"""
        Extract the following fields from this resume text and return raw JSON.
        Do NOT use Markdown formatting.
        
        Resume Text:
        {text}
        
        JSON Structure:
        {{
            "name": "string",
            "email": "string",
            "phone": "string",
            "skills": ["string", "string"],
            "education": [{{"degree": "string", "institution": "string"}}],
            "experience": [{{"job_title": "string", "company": "string", "duration": "string"}}]
        }}
        """
        
        response = model.generate_content(prompt)
        print("✨ Gemini finished.")
        
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        parsed_data = json.loads(clean_json)
        
        print("✅ JSON parsed successfully")
        return jsonify(parsed_data)
        
    except Exception as e:
        print(f"❌ AI ERROR: {str(e)}")
        return jsonify({"error": f"AI processing failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)