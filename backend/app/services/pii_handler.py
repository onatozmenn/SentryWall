import re
from typing import Dict, List, Pattern, Tuple


class PIIHandler:
    EMAIL_PATTERN: Pattern[str] = re.compile(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"
    )
    PHONE_PATTERN: Pattern[str] = re.compile(
        r"(?<!\d)(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]?\d{3}[\s.-]\d{2,4}(?!\d)"
    )
    CREDIT_CARD_PATTERN: Pattern[str] = re.compile(
        r"(?<!\d)(?<![A-Z]{2}\d{2})(?<![A-Z]{2}\d{2}\s)(?<!\d{4}[\s-])(?:\d{4}[-\s]?){3}\d{4}(?!\d)"
    )
    TCKN_PATTERN: Pattern[str] = re.compile(r"(?<!\d)[1-9]\d{10}(?!\d)")
    IBAN_PATTERN: Pattern[str] = re.compile(
        r"(?i)\b(?:TR\d{2}(?:\s?\d{4}){5}\s?\d{2}|[A-Z]{2}\d{2}(?:\s?[A-Z0-9]){11,30})\b"
    )
    OPENAI_KEY_PATTERN: Pattern[str] = re.compile(r"\bsk-[A-Za-z0-9]{20,}\b")
    AWS_ACCESS_KEY_PATTERN: Pattern[str] = re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b")
    GITHUB_TOKEN_PATTERN: Pattern[str] = re.compile(
        r"\b(?:gh[pousr]_[A-Za-z0-9]{36,255}|github_pat_[A-Za-z0-9_]{82,})\b"
    )
    GENERIC_SECRET_PATTERN: Pattern[str] = re.compile(
        r"(?<![A-Za-z0-9])(?=[A-Za-z0-9]{32,}(?![A-Za-z0-9]))(?=[A-Za-z0-9]*[A-Za-z])(?=[A-Za-z0-9]*\d)[A-Za-z0-9]{32,}(?![A-Za-z0-9])"
    )
    IP_PATTERN: Pattern[str] = re.compile(
        r"\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b"
    )
    TR_ADDRESS_PATTERN: Pattern[str] = re.compile(
        r"(?i)\b(?:[A-Za-z\u00C7\u011E\u0130\u00D6\u015E\u00DC\u00E7\u011F\u0131\u00F6\u015F\u00FC0-9.'-]+\s+){0,4}(?:mah(?:\.|allesi)?|sok(?:\.|ak)?|cad(?:\.|de(?:si)?)?|bulvar(?:\u0131)?|blv\.?|apt\.?|daire)\b(?:\s*[,:-]?\s*(?:no[:.]?\s*\d+[A-Za-z0-9-]*)?)?(?:\s+(?!(?:and|ve)\b)[A-Za-z\u00C7\u011E\u0130\u00D6\u015E\u00DC\u00E7\u011F\u0131\u00F6\u015F\u00FC0-9.'-]+){0,4}"
    )
    EN_ADDRESS_PATTERN: Pattern[str] = re.compile(
        r"(?i)\b\d{1,5}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,5}\s+(?:street|st\.?|avenue|ave\.?|road|rd\.?|boulevard|blvd\.?|lane|ln\.?|drive|dr\.?)\b(?:\s+[A-Za-z0-9.'-]+){0,4}"
    )

    RULES: List[Tuple[str, Pattern[str], str]] = [
        ("Email", EMAIL_PATTERN, "[EMAIL_REDACTED]"),
        ("Phone", PHONE_PATTERN, "[PHONE_REDACTED]"),
        ("Credit Card", CREDIT_CARD_PATTERN, "[CREDIT_CARD_REDACTED]"),
        ("TCKN", TCKN_PATTERN, "[TCKN_REDACTED]"),
        ("IBAN", IBAN_PATTERN, "[IBAN_REDACTED]"),
        ("API Key", OPENAI_KEY_PATTERN, "[API_KEY_REDACTED]"),
        ("API Key", AWS_ACCESS_KEY_PATTERN, "[API_KEY_REDACTED]"),
        ("API Key", GITHUB_TOKEN_PATTERN, "[API_KEY_REDACTED]"),
        ("API Key", GENERIC_SECRET_PATTERN, "[API_KEY_REDACTED]"),
        ("IP Address", IP_PATTERN, "[IP_REDACTED]"),
        ("Address", TR_ADDRESS_PATTERN, "[ADDRESS_REDACTED]"),
        ("Address", EN_ADDRESS_PATTERN, "[ADDRESS_REDACTED]"),
    ]

    def scrub_text(self, text: str) -> Dict[str, object]:
        cleaned_text: str = text
        redacted_items: List[str] = []

        for pii_type, pattern, replacement in self.RULES:
            cleaned_text, count = pattern.subn(replacement, cleaned_text)
            if count > 0 and pii_type not in redacted_items:
                redacted_items.append(pii_type)

        return {
            "cleaned_text": cleaned_text,
            "redacted_items": redacted_items,
        }
