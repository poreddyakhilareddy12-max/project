import sys
import os
import base64

if len(sys.argv) < 3:
    print('Usage: python writer.py <filepath> <base64_content>')
    sys.exit(1)

path = sys.argv[1]
content = base64.b64decode(sys.argv[2]).decode('utf-8')

os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'Wrote {path} ({len(content)} chars)')
