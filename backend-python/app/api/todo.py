"""
TODO/Ideas endpoint - reads TODO.md from repository root
"""
from fastapi import APIRouter, HTTPException
from pathlib import Path

router = APIRouter()


@router.get("/")
async def get_todo():
    """
    Get TODO/Ideas content from TODO.md file
    """
    try:
        # Get TODO.md from repository root (two levels up from app/)
        todo_path = Path(__file__).parent.parent.parent / "TODO.md"
        
        if not todo_path.exists():
            raise HTTPException(
                status_code=404,
                detail="TODO.md file not found"
            )
        
        # Read the file content
        content = todo_path.read_text(encoding='utf-8')
        
        return {
            "content": content,
            "path": str(todo_path),
            "exists": True
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read TODO content: {str(e)}"
        )


@router.get("/check-auth")
async def check_auth():
    """
    Simple endpoint to verify authentication status
    Used by frontend to check if user is logged in
    """
    return {"authenticated": True}
