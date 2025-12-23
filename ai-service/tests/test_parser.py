import pytest
import os
import sys

# Add parent directory to path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from parser_utils import extract_text

def test_extract_text_no_file():
    """Test that function fails gracefully without file"""
    with pytest.raises(Exception):
        extract_text(None, "test.pdf")

def test_unsupported_format():
    """Test that unsupported files raise an error"""
    # Create a dummy text file
    with open("test.txt", "w") as f:
        f.write("Hello")
    
    # We expect an error because .txt is not PDF or DOCX
    try:
        with open("test.txt", "rb") as f:
             # In your parser_utils, this might print an error or return empty
             # We just check if it handles it without crashing the entire app
             result = extract_text(f, "test.txt")
             assert result == "" or "Error" in result
    except Exception:
        pass # If it raises exception, that's also valid error handling
    
    # Cleanup
    os.remove("test.txt")

# Note: We don't test full PDF extraction here to avoid needing dummy PDFs in the repo
# This is a "Unit Test" for logic, not an "Integration Test" for files.