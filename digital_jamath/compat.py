"""
Compatibility helper ensuring functions work inside Frappe runtime and in standalone tests.
"""

try:
    import frappe
    from frappe import _
    from frappe.utils import flt, nowdate, getdate
    from frappe.model.document import Document
except ImportError:
    class Document:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)

    class MockFrappe:
        @staticmethod
        def whitelist(*args, **kwargs):
            def decorator(fn):
                return fn
            if len(args) == 1 and callable(args[0]):
                return args[0]
            return decorator

        @staticmethod
        def throw(msg, *args, **kwargs):
            raise Exception(msg)

        @staticmethod
        def cache():
            class Cache:
                def set_value(self, k, v, **kwargs): pass
                def get_value(self, k): return None
                def delete_value(self, k): pass
            return Cache()

    frappe = MockFrappe()
    _ = lambda msg: msg
    flt = float
    nowdate = lambda: "2026-09-09"
    getdate = lambda d: d
