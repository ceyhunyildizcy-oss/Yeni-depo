import unittest
from datetime import datetime
from planner import SourceItem, CalendarBlock, extract_task, collect_tasks, suggest_slot

class PlannerTests(unittest.TestCase):
    def test_extract_date(self):
        item=SourceItem("whatsapp","abc","Toplantı 18.11.2026 saat 14:30",datetime(2026,11,14,10))
        task=extract_task(item)
        self.assertEqual(task.due_at,datetime(2026,11,18,14,30))
    def test_no_task(self):
        self.assertIsNone(extract_task(SourceItem("sms","x","Merhaba nasılsın",datetime(2026,11,14))))
    def test_deduplicate(self):
        x=SourceItem("gmail","1","Randevu 20.11.2026",datetime(2026,11,14))
        self.assertEqual(len(collect_tasks([x,x])),1)
    def test_slot(self):
        day=datetime(2026,11,18)
        slot=suggest_slot(day,[CalendarBlock(datetime(2026,11,18,9),datetime(2026,11,18,10))])
        self.assertEqual(slot.start.hour,10)
    def test_invalid_date_undetermined(self):
        item=SourceItem("sms","z","Toplantı 31.02.2026",datetime(2026,11,14))
        self.assertIsNone(extract_task(item).due_at)

if __name__=="__main__":
    unittest.main()
