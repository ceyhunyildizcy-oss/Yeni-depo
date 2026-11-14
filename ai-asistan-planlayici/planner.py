"""Yerel, bağımsız görev çıkarma ve serbest zaman önerme prototipi.
Not: Bu dosya canlı WhatsApp/Gmail/SMS hesabına erişmez; girdiler uygulamadan sağlanmalıdır.
"""
from __future__ import annotations
from dataclasses import dataclass
from datetime import datetime, timedelta
import hashlib
import re
from typing import Iterable

TRIGGERS = ("toplantı", "randevu", "görüşme", "ara ", "gönder", "teslim", "öde", "hazırla", "hatırlat", "son gün")
DATE_RE = re.compile(r"\b(\d{1,2})[./-](\d{1,2})(?:[./-](\d{4}))?\b")
TIME_RE = re.compile(r"\b(?:saat\s*)?([01]?\d|2[0-3])[:.]([0-5]\d)\b", re.IGNORECASE)

@dataclass(frozen=True)
class SourceItem:
    source: str
    external_id: str
    text: str
    received_at: datetime

@dataclass(frozen=True)
class TaskSuggestion:
    key: str
    source: str
    source_id: str
    title: str
    due_at: datetime | None
    estimated_minutes: int
    priority: str
    confidence: float

@dataclass(frozen=True)
class CalendarBlock:
    start: datetime
    end: datetime

def extract_task(item: SourceItem) -> TaskSuggestion | None:
    """Basit Türkçe sezgisel çıkarım: kesin olmayan tarihleri uydurmaz."""
    text = " ".join(item.text.split())
    if not text or not any(trigger in text.casefold() for trigger in TRIGGERS):
        return None
    date = DATE_RE.search(text)
    time = TIME_RE.search(text)
    due = None
    if date:
        day, month, year = (int(date.group(1)), int(date.group(2)),
                            int(date.group(3) or item.received_at.year))
        try:
            due = item.received_at.replace(year=year, month=month, day=day,
                                           hour=int(time.group(1)) if time else 12,
                                           minute=int(time.group(2)) if time else 0,
                                           second=0, microsecond=0)
        except ValueError:
            due = None
    urgency = any(w in text.casefold() for w in ("acil", "hemen", "bugün", "son gün"))
    key = hashlib.sha256(f"{item.source}:{item.external_id}".encode()).hexdigest()[:24]
    return TaskSuggestion(key, item.source, item.external_id, text[:180],
                          due, 30, "high" if urgency else "normal",
                          0.8 if due else 0.45)

def collect_tasks(items: Iterable[SourceItem]) -> list[TaskSuggestion]:
    deduped: dict[str, TaskSuggestion] = {}
    for item in items:
        candidate = extract_task(item)
        if candidate:
            deduped[candidate.key] = candidate
    return sorted(deduped.values(), key=lambda t: (t.due_at is None,
                  t.due_at or datetime.max, t.priority != "high"))

def suggest_slot(day: datetime, blocks: Iterable[CalendarBlock], minutes: int = 30,
                 start_hour: int = 9, end_hour: int = 18) -> CalendarBlock | None:
    """İstenen günün 09-18 arası ilk boş aralığı; gün/zone kullanıcıdan gelir."""
    if minutes <= 0:
        raise ValueError("minutes must be positive")
    start = day.replace(hour=start_hour, minute=0, second=0, microsecond=0)
    end = day.replace(hour=end_hour, minute=0, second=0, microsecond=0)
    if end <= start:
        raise ValueError("invalid workday")
    for b in sorted(blocks, key=lambda b: b.start):
        if b.end <= start or b.start >= end:
            continue
        if start + timedelta(minutes=minutes) <= b.start:
            return CalendarBlock(start, start + timedelta(minutes=minutes))
        if b.end > start:
            start = b.end
    return CalendarBlock(start, start + timedelta(minutes=minutes)) if start + timedelta(minutes=minutes) <= end else None
