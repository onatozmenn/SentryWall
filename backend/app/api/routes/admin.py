from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlmodel import Session, func, select

from app.database import get_session
from app.models import AuditLog

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/logs", response_model=list[AuditLog])
def get_admin_logs(session: Session = Depends(get_session)) -> list[AuditLog]:
    statement = select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50)
    return list(session.exec(statement))


@router.get("/stats")
def get_admin_stats(session: Session = Depends(get_session)) -> dict[str, object]:
    total_requests = int(session.exec(select(func.count()).select_from(AuditLog)).one())
    threats_blocked = int(
        session.exec(
            select(func.count())
            .select_from(AuditLog)
            .where(AuditLog.action != "Allowed")
        ).one()
    )

    non_allowed_pii = session.exec(
        select(AuditLog.pii_detected).where(AuditLog.action != "Allowed")
    ).all()
    sensitive_items = 0
    for pii_detected in non_allowed_pii:
        if pii_detected == "None":
            continue
        sensitive_items += len(
            [item for item in pii_detected.split(",") if item and item != "None"]
        )

    today = datetime.now(timezone.utc).date()
    start_date = today - timedelta(days=6)
    daily_rollup: dict[date, dict[str, int]] = {}
    for offset in range(7):
        current_day = start_date + timedelta(days=offset)
        daily_rollup[current_day] = {"safeRequests": 0, "threatsBlocked": 0}

    grouped_rows = session.exec(
        select(func.date(AuditLog.timestamp), AuditLog.action, func.count(AuditLog.id))
        .where(
            AuditLog.timestamp
            >= datetime.combine(start_date, datetime.min.time(), tzinfo=timezone.utc)
        )
        .group_by(func.date(AuditLog.timestamp), AuditLog.action)
    ).all()

    for date_value, action, count_value in grouped_rows:
        if date_value is None:
            continue

        parsed_date = datetime.strptime(str(date_value), "%Y-%m-%d").date()
        if parsed_date not in daily_rollup:
            continue

        if action == "Allowed":
            daily_rollup[parsed_date]["safeRequests"] += int(count_value)
        else:
            daily_rollup[parsed_date]["threatsBlocked"] += int(count_value)

    daily_counts: list[dict[str, object]] = []
    for day, counts in daily_rollup.items():
        daily_counts.append(
            {
                "date": day.strftime("%b %d"),
                "safeRequests": counts["safeRequests"],
                "threatsBlocked": counts["threatsBlocked"],
            }
        )

    return {
        "total_requests": total_requests,
        "threats_blocked": threats_blocked,
        "data_saved_label": f"{sensitive_items} Sensitive Items",
        "daily_counts": daily_counts,
    }
