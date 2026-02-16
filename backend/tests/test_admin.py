from datetime import datetime, timedelta

from sqlmodel import Session

from app.models import AuditLog


def test_admin_logs_endpoint_returns_last_50_sorted_desc(api_client, db_engine) -> None:
    now = datetime.utcnow()

    with Session(db_engine) as session:
        for index in range(60):
            session.add(
                AuditLog(
                    timestamp=now - timedelta(minutes=index),
                    user_id="anonymous",
                    content_length=42,
                    pii_detected="None",
                    risk_level="Low",
                    action="Allowed",
                )
            )
        session.commit()

    response = api_client.get("/api/admin/logs")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 50

    parsed_timestamps = [datetime.fromisoformat(item["timestamp"]) for item in payload]
    assert parsed_timestamps == sorted(parsed_timestamps, reverse=True)


def test_admin_stats_endpoint_returns_real_aggregates(api_client, db_engine) -> None:
    now = datetime.utcnow().replace(hour=10, minute=0, second=0, microsecond=0)

    with Session(db_engine) as session:
        session.add(
            AuditLog(
                timestamp=now,
                user_id="anonymous",
                content_length=20,
                pii_detected="None",
                risk_level="Low",
                action="Allowed",
            )
        )
        session.add(
            AuditLog(
                timestamp=now - timedelta(days=1),
                user_id="anonymous",
                content_length=20,
                pii_detected="Email,Phone",
                risk_level="Medium",
                action="Redacted",
            )
        )
        session.add(
            AuditLog(
                timestamp=now - timedelta(days=2),
                user_id="anonymous",
                content_length=20,
                pii_detected="Credit Card",
                risk_level="High",
                action="Blocked",
            )
        )
        session.add(
            AuditLog(
                timestamp=now - timedelta(days=3),
                user_id="anonymous",
                content_length=20,
                pii_detected="IP Address",
                risk_level="Low",
                action="Redacted",
            )
        )
        session.commit()

    response = api_client.get("/api/admin/stats")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total_requests"] == 4
    assert payload["threats_blocked"] == 3
    assert payload["data_saved_label"] == "4 Sensitive Items"

    daily_counts = payload["daily_counts"]
    assert len(daily_counts) == 7

    total_safe = sum(day["safeRequests"] for day in daily_counts)
    total_threats = sum(day["threatsBlocked"] for day in daily_counts)
    assert total_safe == 1
    assert total_threats == 3
