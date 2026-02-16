from app.services.pii_handler import PIIHandler


def test_scrub_text_redacts_tckn() -> None:
    handler = PIIHandler()

    result = handler.scrub_text("Kimlik no: 12345678901")

    assert result["cleaned_text"] == "Kimlik no: [TCKN_REDACTED]"
    assert result["redacted_items"] == ["TCKN"]


def test_scrub_text_redacts_turkish_and_international_iban() -> None:
    handler = PIIHandler()
    message = (
        "TR account TR33 0006 1005 1978 6457 8413 26 "
        "and DE89370400440532013000"
    )

    result = handler.scrub_text(message)

    assert result["cleaned_text"].count("[IBAN_REDACTED]") == 2
    assert "IBAN" in result["redacted_items"]


def test_scrub_text_redacts_specific_and_generic_api_keys() -> None:
    handler = PIIHandler()
    message = (
        "openai sk-1234567890abcdefghijklmnop "
        "aws AKIA1234567890ABCD12 "
        "github ghp_abcdefghijklmnopqrstuvwxyz1234567890AB "
        "generic A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6"
    )

    result = handler.scrub_text(message)

    assert result["cleaned_text"].count("[API_KEY_REDACTED]") == 4
    assert result["redacted_items"] == ["API Key"]


def test_scrub_text_redacts_tr_and_en_address_patterns() -> None:
    handler = PIIHandler()
    message = "Addresses: Ataturk Mah. 23 Sokak No:5 Kadikoy and 221 Baker Street London"

    result = handler.scrub_text(message)

    assert result["cleaned_text"].count("[ADDRESS_REDACTED]") == 2
    assert "Address" in result["redacted_items"]


def test_scrub_text_preserves_unique_redacted_item_types() -> None:
    handler = PIIHandler()
    message = (
        "Emails a@example.com b@example.com "
        "cards 4111 1111 1111 1111 5555 5555 5555 4444"
    )

    result = handler.scrub_text(message)

    assert result["redacted_items"] == ["Email", "Credit Card"]


def test_scrub_text_uses_credit_card_token() -> None:
    handler = PIIHandler()

    result = handler.scrub_text("Card number 4111-1111-1111-1111")

    assert result["cleaned_text"] == "Card number [CREDIT_CARD_REDACTED]"
    assert result["redacted_items"] == ["Credit Card"]
