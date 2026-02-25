from types import SimpleNamespace
from unittest.mock import AsyncMock

from sqlmodel import Session, select

from app.api.routes import chat as chat_route
from app.models import AuditLog


def _build_mock_azure_client(
    *,
    content: str | None = None,
    side_effect: Exception | None = None,
) -> tuple[SimpleNamespace, AsyncMock]:
    create_mock = AsyncMock()

    if side_effect is not None:
        create_mock.side_effect = side_effect
    else:
        create_mock.return_value = SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content=content))]
        )

    mock_client = SimpleNamespace(
        chat=SimpleNamespace(completions=SimpleNamespace(create=create_mock))
    )

    return mock_client, create_mock


def _patch_azure_client(monkeypatch, mock_client: SimpleNamespace) -> None:
    monkeypatch.setattr(
        chat_route.settings, "azure_openai_deployment_name", "test-deployment"
    )
    monkeypatch.setattr(chat_route, "_get_azure_client", lambda: mock_client)


def test_secure_chat_persists_redacted_email_log(
    api_client, db_engine, monkeypatch
) -> None:
    mock_client, create_mock = _build_mock_azure_client(content="Handled securely.")
    _patch_azure_client(monkeypatch, mock_client)

    response = api_client.post(
        "/api/chat/secure", json={"message": "Reach me at alice@example.com"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["security_report"]["redacted_items"] == ["Email"]
    assert body["original_response"] == "Handled securely."

    sent_messages = create_mock.call_args.kwargs["messages"]
    assert sent_messages[1]["content"] == "Reach me at [EMAIL_REDACTED]"

    with Session(db_engine) as session:
        logs = session.exec(select(AuditLog)).all()

    assert len(logs) == 1
    assert logs[0].pii_detected == "Email"
    assert logs[0].risk_level == "Medium"
    assert logs[0].action == "Redacted"


def test_secure_chat_persists_credit_card_as_blocked_high_risk(
    api_client, db_engine, monkeypatch
) -> None:
    mock_client, create_mock = _build_mock_azure_client(content="Card secured.")
    _patch_azure_client(monkeypatch, mock_client)

    response = api_client.post(
        "/api/chat/secure", json={"message": "Card: 4111 1111 1111 1111"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["security_report"]["redacted_items"] == ["Credit Card"]
    assert body["original_response"] == chat_route.BLOCKED_RESPONSE

    create_mock.assert_not_awaited()

    with Session(db_engine) as session:
        logs = session.exec(select(AuditLog)).all()

    assert len(logs) == 1
    assert logs[0].pii_detected == "Credit Card"
    assert logs[0].risk_level == "High"
    assert logs[0].action == "Blocked"


def test_secure_chat_persists_tckn_as_blocked_high_risk(
    api_client, db_engine, monkeypatch
) -> None:
    mock_client, create_mock = _build_mock_azure_client(content="Identity secured.")
    _patch_azure_client(monkeypatch, mock_client)

    response = api_client.post(
        "/api/chat/secure", json={"message": "My id is 12345678901"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["security_report"]["redacted_items"] == ["TCKN"]
    assert body["original_response"] == chat_route.BLOCKED_RESPONSE
    create_mock.assert_not_awaited()

    with Session(db_engine) as session:
        logs = session.exec(select(AuditLog)).all()

    assert len(logs) == 1
    assert logs[0].pii_detected == "TCKN"
    assert logs[0].risk_level == "High"
    assert logs[0].action == "Blocked"


def test_secure_chat_persists_api_key_as_blocked_high_risk(
    api_client, db_engine, monkeypatch
) -> None:
    mock_client, create_mock = _build_mock_azure_client(content="Secret secured.")
    _patch_azure_client(monkeypatch, mock_client)

    api_key = "sk-1234567890abcdefghijklmnop"
    response = api_client.post(
        "/api/chat/secure", json={"message": f"My key is {api_key}"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["security_report"]["redacted_items"] == ["API Key"]
    assert body["original_response"] == chat_route.BLOCKED_RESPONSE
    create_mock.assert_not_awaited()

    with Session(db_engine) as session:
        logs = session.exec(select(AuditLog)).all()

    assert len(logs) == 1
    assert logs[0].pii_detected == "API Key"
    assert logs[0].risk_level == "High"
    assert logs[0].action == "Blocked"


def test_secure_chat_persists_ip_as_redacted_low_risk(
    api_client, db_engine, monkeypatch
) -> None:
    mock_client, _ = _build_mock_azure_client(content="IP masked.")
    _patch_azure_client(monkeypatch, mock_client)

    response = api_client.post(
        "/api/chat/secure", json={"message": "Server IP is 192.168.1.12"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["security_report"]["redacted_items"] == ["IP Address"]

    with Session(db_engine) as session:
        logs = session.exec(select(AuditLog)).all()

    assert len(logs) == 1
    assert logs[0].pii_detected == "IP Address"
    assert logs[0].risk_level == "Low"
    assert logs[0].action == "Redacted"


def test_secure_chat_persists_allowed_when_no_pii(
    api_client, db_engine, monkeypatch
) -> None:
    mock_client, _ = _build_mock_azure_client(content="No risk detected.")
    _patch_azure_client(monkeypatch, mock_client)

    response = api_client.post(
        "/api/chat/secure", json={"message": "Deployment completed without incident."}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["security_report"]["redacted_items"] == []

    with Session(db_engine) as session:
        logs = session.exec(select(AuditLog)).all()

    assert len(logs) == 1
    assert logs[0].pii_detected == "None"
    assert logs[0].risk_level == "Low"
    assert logs[0].action == "Allowed"


def test_secure_chat_handles_azure_failure_with_sanitized_500(
    api_client, monkeypatch
) -> None:
    mock_client, _ = _build_mock_azure_client(side_effect=RuntimeError("invalid key"))
    _patch_azure_client(monkeypatch, mock_client)

    response = api_client.post("/api/chat/secure", json={"message": "Hello"})

    assert response.status_code == 500
    assert response.json()["detail"] == "Azure OpenAI request failed."
