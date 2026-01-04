"""
Basira Data Intelligence Agent
Provides AI-powered insights on Jamath data (households, members, transactions).
"""

import os
import json
import requests
from datetime import date, timedelta
from decimal import Decimal

from django.db.models import Sum, Avg, Count, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.http import StreamingHttpResponse

from apps.jamath.models import Household, Member, Subscription, JournalEntry, Ledger


# =============================================================================
# DATA QUERY FUNCTIONS
# =============================================================================

def get_household_stats():
    """Get summary statistics about households."""
    total = Household.objects.count()
    zakat_eligible = Household.objects.filter(economic_status='ZAKAT_ELIGIBLE').count()
    verified = Household.objects.filter(is_verified=True).count()
    
    return {
        "total_households": total,
        "zakat_eligible": zakat_eligible,
        "sahib_e_nisab": total - zakat_eligible,
        "verified": verified,
        "unverified": total - verified
    }


def get_member_stats():
    """Get summary statistics about members."""
    total = Member.objects.filter(is_alive=True).count()
    male = Member.objects.filter(is_alive=True, gender='MALE').count()
    female = Member.objects.filter(is_alive=True, gender='FEMALE').count()
    employed = Member.objects.filter(is_alive=True, is_employed=True).count()
    
    # Age distribution
    today = date.today()
    children = Member.objects.filter(is_alive=True, dob__gt=today - timedelta(days=18*365)).count()
    adults = Member.objects.filter(
        is_alive=True, 
        dob__lte=today - timedelta(days=18*365),
        dob__gt=today - timedelta(days=60*365)
    ).count()
    seniors = Member.objects.filter(is_alive=True, dob__lte=today - timedelta(days=60*365)).count()
    
    # Marital status
    married = Member.objects.filter(is_alive=True, marital_status='MARRIED').count()
    widowed = Member.objects.filter(is_alive=True, marital_status='WIDOWED').count()
    
    return {
        "total_members": total,
        "male": male,
        "female": female,
        "employed": employed,
        "unemployed": total - employed,
        "children_under_18": children,
        "adults_18_60": adults,
        "seniors_above_60": seniors,
        "married": married,
        "widowed": widowed
    }


def get_financial_summary(months_back=6):
    """Get financial summary for the last N months using Mizan Ledger."""
    start_date = timezone.now().date() - timedelta(days=months_back * 30)
    
    # Income (Receipt Vouchers)
    # Sum of Credit Amounts in Receipt Vouchers (usually credits Income/Equity accounts)
    # But usually Receipt Total = `total_amount` (which is sum of debits, equal to credits)
    # We can just sum JournalEntry totals for Receipts.
    
    income = JournalEntry.objects.filter(
        voucher_type='RECEIPT',
        date__gte=start_date
    ).aggregate(total=Sum('items__debit_amount'))['total'] or Decimal('0')
    
    # Expenses (Payment Vouchers)
    expenses = JournalEntry.objects.filter(
        voucher_type='PAYMENT',
        date__gte=start_date
    ).aggregate(total=Sum('items__debit_amount'))['total'] or Decimal('0')
    
    # This month's figures
    this_month_start = timezone.now().date().replace(day=1)
    
    this_month_income = JournalEntry.objects.filter(
        voucher_type='RECEIPT',
        date__gte=this_month_start
    ).aggregate(total=Sum('items__debit_amount'))['total'] or Decimal('0')
    
    this_month_expenses = JournalEntry.objects.filter(
        voucher_type='PAYMENT',
        date__gte=this_month_start
    ).aggregate(total=Sum('items__debit_amount'))['total'] or Decimal('0')
    
    # Top Income Sources (Account-wise breakdown from Receipt items)
    # We need to look at Credit items in Receipt vouchers (because Cash is Debited, Income is Credited)
    # Filter: Voucher=Receipt, Item Credit > 0
    top_income_categories = JournalEntry.objects.filter(
        voucher_type='RECEIPT',
        date__gte=start_date
    ).values('items__ledger__name').filter(
        items__credit_amount__gt=0
    ).annotate(
        total=Sum('items__credit_amount')
    ).order_by('-total')[:5]
    
    return {
        f"total_income_{months_back}_months": float(income),
        f"total_expenses_{months_back}_months": float(expenses),
        "net_surplus": float(income - expenses),
        "this_month_income": float(this_month_income),
        "this_month_expenses": float(this_month_expenses),
        "top_income_sources": [
            {"fund": item['items__ledger__name'] or "Unknown", "amount": float(item['total'])}
            for item in top_income_categories
        ]
    }


def get_subscription_status():
    """Get membership subscription status."""
    active = Subscription.objects.filter(
        status='ACTIVE',
        end_date__gte=timezone.now().date()
    ).count()
    
    expired = Subscription.objects.filter(
        end_date__lt=timezone.now().date()
    ).count()
    
    total_collected = Subscription.objects.filter(
        status='ACTIVE'
    ).aggregate(total=Sum('amount_paid'))['total'] or Decimal('0')
    
    return {
        "active_subscriptions": active,
        "expired_subscriptions": expired,
        "total_membership_collected": float(total_collected)
    }


def search_households(query):
    """Search households by name, phone, or ID."""
    results = Household.objects.filter(
        Q(membership_id__icontains=query) |
        Q(phone_number__icontains=query) |
        Q(address__icontains=query) |
        Q(members__full_name__icontains=query)
    ).distinct()[:10]
    
    return [
        {
            "id": h.id,
            "membership_id": h.membership_id,
            "address": h.address[:50] if h.address else "",
            "phone": h.phone_number,
            "head_name": h.members.filter(is_head_of_family=True).first().full_name if h.members.filter(is_head_of_family=True).exists() else "Unknown",
            "member_count": h.members.count(),
            "economic_status": h.get_economic_status_display()
        }
        for h in results
    ]


def get_recent_transactions(limit=10):
    """Get recent transactions (Journal Entries)."""
    # Use select_related/prefetch_related for optimization if needed, 
    # but for just 10 items it's fine.
    transactions = JournalEntry.objects.all().order_by('-date', '-id')[:limit]
    
    return [
        {
            "date": t.date.isoformat(),
            "type": "Income" if t.voucher_type == 'RECEIPT' else ("Expense" if t.voucher_type == 'PAYMENT' else "Journal"),
            "amount": float(t.total_amount),
            "description": t.narration[:50] if t.narration else "",
            "fund": "N/A", # Complex to determine single fund in double entry
            "household": t.donor.full_name if t.donor else (t.donor_name_manual or "")
        }
        for t in transactions
    ]


# =============================================================================
# AI AGENT VIEW
# =============================================================================

DATA_AGENT_PROMPT = """You are Basira Data Agent, an AI assistant that helps administrators analyze Jamath (community) data.

You have access to LIVE DATA from the system. When answering questions, use the provided data context to give accurate, specific answers.

## YOUR DATA CONTEXT (CURRENT AS OF NOW):
{data_context}

## GUIDELINES:
1. Answer questions using ONLY the data provided above.
2. Be specific with numbers - don't round unless asked.
3. If the data shows 0 or empty lists for a requested metric, explicitly state "I don't have that data available" or "There are currently zero records for..." as appropriate.
4. Format currency in Indian Rupees (₹).
5. For lists, use bullet points or tables.
6. Be concise but thorough.
7. If someone asks to search for a household, use the search results provided.

## IMPORTANT:
- If the context shows 0 households, 0 members, etc., DO NOT make up data. State clearly that the database is empty.
- You cannot modify data, only read it.
- For sensitive actions, direct users to the appropriate dashboard section.
- If asked unrelated questions (politics, coding, etc.), politely refuse.
"""


class BasiraDataAgentView(APIView):
    """AI Agent for querying Jamath data."""
    permission_classes = [IsAdminUser]

    def post(self, request):
        user_message = request.data.get('message', '')
        conversation_history = request.data.get('history', [])

        if not user_message:
            return Response({'error': 'Message is required'}, status=400)

        from apps.shared.models import SystemConfig
        config = SystemConfig.get_solo()
        api_key = config.openrouter_api_key or os.environ.get('OPENROUTER_API_KEY')

        if not api_key:
            return Response({'error': 'API key not configured. Please set OPENROUTER_API_KEY.'}, status=503)

        # Build data context based on the query
        data_context = self._build_data_context(user_message)

        # Build system prompt with data
        system_prompt = DATA_AGENT_PROMPT.format(data_context=data_context)

        # Build messages
        messages = [{"role": "system", "content": system_prompt}]
        for msg in conversation_history[-5:]:
            messages.append(msg)
        messages.append({"role": "user", "content": user_message})

        # Stream response
        return self._stream_response(api_key, messages)

    def _build_data_context(self, query):
        """Build relevant data context based on the query."""
        context_parts = []

        # Always include basic stats
        context_parts.append("### HOUSEHOLD STATISTICS")
        context_parts.append(json.dumps(get_household_stats(), indent=2))

        context_parts.append("\n### MEMBER STATISTICS")
        context_parts.append(json.dumps(get_member_stats(), indent=2))

        context_parts.append("\n### FINANCIAL SUMMARY (Last 6 Months)")
        context_parts.append(json.dumps(get_financial_summary(), indent=2))

        context_parts.append("\n### MEMBERSHIP STATUS")
        context_parts.append(json.dumps(get_subscription_status(), indent=2))

        context_parts.append("\n### RECENT TRANSACTIONS (Last 10)")
        context_parts.append(json.dumps(get_recent_transactions(), indent=2))

        # If query looks like a search, include search results
        search_keywords = ['find', 'search', 'look up', 'who is', 'which household', 'phone', 'member named']
        if any(kw in query.lower() for kw in search_keywords):
            # Extract potential search term (simple heuristic)
            words = query.split()
            # Look for phone numbers or names
            for word in words:
                if len(word) >= 4 and (word.isdigit() or word.isalpha()):
                    results = search_households(word)
                    if results:
                        context_parts.append(f"\n### SEARCH RESULTS FOR '{word}'")
                        context_parts.append(json.dumps(results, indent=2))
                        break

        return "\n".join(context_parts)

    def _stream_response(self, api_key, messages):
        """Stream response using Server-Sent Events."""
        def generate():
            try:
                response = requests.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://project-mizan.com",
                        "X-Title": "DigitalJamath - Basira Data Agent"
                    },
                    json={
                        "model": "meta-llama/llama-3.2-3b-instruct:free",
                        "messages": messages,
                        "max_tokens": 800,
                        "temperature": 0.3,
                        "stream": True
                    },
                    stream=True,
                    timeout=60
                )

                for line in response.iter_lines():
                    if line:
                        line_text = line.decode('utf-8')
                        if line_text.startswith('data: '):
                            data = line_text[6:]
                            if data == '[DONE]':
                                yield f"data: [DONE]\n\n"
                                break
                            try:
                                chunk = json.loads(data)
                                if 'choices' in chunk and len(chunk['choices']) > 0:
                                    delta = chunk['choices'][0].get('delta', {})
                                    content = delta.get('content', '')
                                    if content:
                                        yield f"data: {json.dumps({'content': content})}\n\n"
                            except json.JSONDecodeError:
                                pass

            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        response = StreamingHttpResponse(generate(), content_type='text/event-stream')
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response
