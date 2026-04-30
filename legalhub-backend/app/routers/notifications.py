from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.core.database import supabase

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("")
async def get_notifications(current_user=Depends(get_current_user)):
    result = supabase.table("notification").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).limit(50).execute()
    return result.data

@router.patch("/read-all")
async def mark_all_read(current_user=Depends(get_current_user)):
    supabase.table("notification").update({"is_read": True}).eq("user_id", current_user["id"]).execute()
    return {"message": "All notifications marked as read"}

