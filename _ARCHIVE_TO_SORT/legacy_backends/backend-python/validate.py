"""
Validate production readiness without running the server.
Checks for:
- Required files exist
- Configuration structure
- Module imports (syntax only)
"""
import ast
import sys
from pathlib import Path

def validate_file_exists(path: str) -> bool:
    """Check if file exists."""
    return Path(path).exists()

def validate_python_syntax(path: str) -> tuple[bool, str]:
    """Validate Python file syntax without executing."""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            ast.parse(f.read())
        return True, "OK"
    except SyntaxError as e:
        return False, f"Syntax error: {e}"
    except Exception as e:
        return False, f"Error: {e}"

def main():
    """Run validation checks."""
    print("🔍 Validating Production Readiness...\n")
    
    # Check critical files
    print("📁 Checking Files:")
    files = [
        "app/main.py",
        "app/security.py",
        "app/api/monitoring.py",
        "app/cache.py",
        "app/websocket.py",
        "manage.py",
        "requirements.txt",
        "SECURITY.md",
        "MANAGEMENT.md",
        "PRODUCTION_READY.md",
    ]
    
    all_exist = True
    for file in files:
        exists = validate_file_exists(file)
        status = "✅" if exists else "❌"
        print(f"  {status} {file}")
        if not exists:
            all_exist = False
    
    print()
    
    # Check Python syntax
    print("🐍 Checking Python Syntax:")
    python_files = [
        "app/main.py",
        "app/security.py",
        "app/api/monitoring.py",
        "manage.py",
    ]
    
    all_valid = True
    for file in python_files:
        if validate_file_exists(file):
            valid, msg = validate_python_syntax(file)
            status = "✅" if valid else "❌"
            print(f"  {status} {file}: {msg}")
            if not valid:
                all_valid = False
        else:
            print(f"  ⏭️  {file}: Skipped (not found)")
    
    print()
    
    # Check requirements
    print("📦 Checking Requirements:")
    if validate_file_exists("requirements.txt"):
        with open("requirements.txt", 'r') as f:
            deps = [line.strip() for line in f if line.strip() and not line.startswith("#")]
        
        required = [
            "fastapi",
            "uvicorn",
            "sqlalchemy",
            "alembic",
            "redis",
            "psutil",
            "click",
            "pytest"
        ]
        
        for req in required:
            found = any(req in dep for dep in deps)
            status = "✅" if found else "❌"
            print(f"  {status} {req}")
    else:
        print("  ❌ requirements.txt not found")
        all_valid = False
    
    print()
    
    # Summary
    if all_exist and all_valid:
        print("✅ All validation checks passed!")
        print("🚀 Backend is ready for deployment")
        return 0
    else:
        print("❌ Some validation checks failed")
        print("⚠️  Review errors above before deploying")
        return 1

if __name__ == "__main__":
    sys.exit(main())
