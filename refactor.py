import os
import re

directory = r'c:\Users\Administrator\Documents\AI financial coach\frontend\src'

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'axios.' not in content:
        return

    # Add the API constant after axios import if missing
    if 'const API =' not in content:
        content = re.sub(
            r"(import axios from 'axios';)",
            r"\1\n\nconst API = import.meta.env.VITE_API_URL || 'https://ai-financial-copilot-ckt8.onrender.com/api';",
            content
        )

    # 1. Replace single-quote literals: axios.get('/api/users') -> axios.get(`${API}/users`)
    content = re.sub(
        r"axios\.([a-z]+)\('/api/([^']+)'",
        r"axios.\1(`${API}/\2`",
        content
    )

    # 2. Replace double-quote literals: axios.get("/api/users") -> axios.get(`${API}/users`)
    content = re.sub(
        r'axios\.([a-z]+)\("/api/([^"]+)"',
        r'axios.\1(`${API}/\2`',
        content
    )

    # 3. Handle existing template literals: axios.get(`/api/users/${id}`) -> axios.get(`${API}/users/${id}`)
    # The regex targets any axios.(method)(`/api/...`)
    content = re.sub(
        r"axios\.([a-z]+)\(`\/api\/([^`]+)`",
        r"axios.\1(`${API}/\2`",
        content
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {os.path.basename(file_path)}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            process_file(os.path.join(root, file))
