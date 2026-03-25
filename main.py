import sys
import os
import subprocess

# Add src to path so we can import app
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", package])

required_packages = {
    'flask': 'flask',
    'cv2': 'opencv-python',
    'numpy': 'numpy',
    'tensorflow': 'tensorflow',
    'PIL': 'Pillow'
}

print("Checking dependencies...")
for module, package in required_packages.items():
    try:
        __import__(module)
    except ImportError:
        print(f"{module} not found. Installing {package}...")
        install(package)

from app import app
import webbrowser
from threading import Timer

def open_browser():
    webbrowser.open_new('http://127.0.0.1:5000')

if __name__ == '__main__':
    # Ensure current directory is the project root
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Timer(1.5, open_browser).start()
    app.run(host='0.0.0.0', port=5000, debug=True)
