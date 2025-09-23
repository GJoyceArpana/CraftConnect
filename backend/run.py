#!/usr/bin/env python3
"""
Backend runner for CraftConnect Carbon Footprint API
"""
import os
import sys
import subprocess

def check_python():
    """Check if Python 3 is available"""
    try:
        import sys
        if sys.version_info.major < 3:
            print("Error: Python 3 is required")
            return False
        return True
    except:
        return False

def install_requirements():
    """Install Python requirements"""
    try:
        print("Installing Python requirements...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error installing requirements: {e}")
        return False

def run_server():
    """Run the Flask server"""
    try:
        print("Starting Flask server...")
        print("Server will be available at: http://localhost:5000")
        print("Press Ctrl+C to stop the server")
        subprocess.check_call([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"Error running server: {e}")

if __name__ == "__main__":
    print("CraftConnect Carbon Footprint API Setup")
    print("=" * 40)
    
    if not check_python():
        sys.exit(1)
    
    # Change to backend directory
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Run server
    run_server()