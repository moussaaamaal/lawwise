from datetime import date
from fastapi import APIRouter, Depends
from app.core.dependencies import get_lawyer
from app.core.database import supabase

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

# ─── GET /api/dashboard/stats ───────────────────────────

@router.get("/stats")
async def get_dashboard_stats(current_user=Depends(get_lawyer)):
    """
    Home dashboard KPIs:
    - Active Cases, Closed Cases, Upcoming Hearings,
      Pending Payments, Active Reminders (tasks due today).
    """
    firm_id = current_user["firm_id"]
    today   = date.today().isoformat()

    cases = supabase.table("case_file").select("id, status").eq("firm_id", firm_id).execute()
    case_data = cases.data or []

    active_cases = len([c for c in case_data if c["status"] not in ("SETTLED", "CLOSED")])
    closed_cases = len([c for c in case_data if c["status"] in ("SETTLED", "CLOSED")])

    # Upcoming hearings (next 30 days)
    hearings = (
        supabase.table("calendar_event")
        .select("id")
        .eq("firm_id", firm_id)
        .eq("event_type", "HEARING")
        .gte("start_datetime", today)
        .execute()
    )
    upcoming_hearings = len(hearings.data or [])

    # Pending invoices (PENDING + OVERDUE)
    invoices = (
        supabase.table("invoice")
        .select("id, status, total_amount")
        .eq("firm_id", firm_id)
        .in_("status", ["PENDING", "OVERDUE"])
        .execute()
    )
    pending_payments = sum(i["total_amount"] for i in (invoices.data or []))

    # Active reminders = tasks pending/in-progress due today or earlier
    tasks = (
        supabase.table("task")
        .select("id")
        .eq("firm_id", firm_id)
        .in_("status", ["PENDING", "IN_PROGRESS"])
        .lte("due_date", today)
        .execute()
    )
    active_reminders = len(tasks.data or [])

    return {
        "active_cases":      active_cases,
        "closed_cases":      closed_cases,
        "upcoming_hearings": upcoming_hearings,
        "pending_payments":  round(pending_payments, 2),
        "active_reminders":  active_reminders,
    }

# ─── GET /api/dashboard/today ───────────────────────────

@router.get("/today")
async def get_today_schedule(current_user=Depends(get_lawyer)):
    """Today's events ordered by time — used for the mobile home dashboard."""
    today_start = f"{date.today().isoformat()}T00:00:00"
    today_end   = f"{date.today().isoformat()}T23:59:59"

    result = (
        supabase.table("calendar_event")
        .select("*, case_file(id, title, case_number)")
        .eq("firm_id", current_user["firm_id"])
        .gte("start_datetime", today_start)
        .lte("start_datetime", today_end)
        .order("start_datetime")
        .execute()
    )
    return result.data or []

# ─── GET /api/dashboard/recent-cases ────────────────────

@router.get("/recent-cases")
async def get_recent_cases(current_user=Depends(get_lawyer)):
    """5 most recently updated active cases — used for quick preview strip."""
    result = (
        supabase.table("case_file")
        .select("id, case_number, title, status, priority, updated_at, client(first_name, last_name)")
        .eq("firm_id", current_user["firm_id"])
        .not_.in_("status", ["SETTLED", "CLOSED"])
        .order("updated_at", desc=True)
        .limit(5)
        .execute()
    )
    cases = result.data or []
    # Flatten client name into a single client_name field
    for case in cases:
        client = case.pop("client", None)
        if client:
            case["client_name"] = f"{client.get('first_name', '')} {client.get('last_name', '')}".strip()
        else:
            case["client_name"] = None
    return cases
