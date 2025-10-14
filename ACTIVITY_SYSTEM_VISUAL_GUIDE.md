# Student Activity System - Quick Visual Guide

## Dashboard Layout (New)

```
┌─────────────────────────────────────────────────────────────────┐
│ My Dashboard                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────── BALANCE OVER TIME ─────────────────────┐│
│  │  Balance Over Time                      CE$ 42.50           ││
│  │  Track your balance history             ↑ +CE$ 12.50       ││
│  │                                                             ││
│  │      50 ┬─────────────────────────────────────────────     ││
│  │         │                                    ●              ││
│  │      40 ┤                            ●──────●              ││
│  │         │                    ●──────●                      ││
│  │      30 ┤            ●──────●                              ││
│  │         │    ●──────●                                      ││
│  │      20 ┤───●                                              ││
│  │                                                             ││
│  │  Highest: CE$ 45.00  Lowest: CE$ 20.00  Activity: 12       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Balance  │ │  Rank    │ │ Pending  │ │Affordable│          │
│  │ CE$ 42.50│ │   #3     │ │    2     │ │    5     │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│  ┌─────────────────────┐ ┌─────────────────────┐              │
│  │ Recent Activity     │ │ Goals & Progress    │              │
│  │ [activity cards]    │ │ [progress bars]     │              │
│  └─────────────────────┘ └─────────────────────┘              │
│                                                                 │
│  ┌─────────────────── MY ACTIVITY ──────────────────────────┐ │
│  │  My Activity                    [Filter: All Types ▼]    │ │
│  │  Your recent transactions                                │ │
│  │                                                           │ │
│  │  Total Income: CE$ 50.00    Total Expenses: CE$ 30.00   │ │
│  │                                                           │ │
│  │  Recent Activity                                         │ │
│  │  ┌─────────────────────────────────────────────────┐    │ │
│  │  │ [💰] Payroll        CE$ 15.00  +CE$ 15.00       │    │ │
│  │  │      Weekly salary | Jun 15, 3:00 PM            │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  │  ┌─────────────────────────────────────────────────┐    │ │
│  │  │ [🛍️] Purchase       CE$ 10.00  -CE$ 10.00       │    │ │
│  │  │      Fancy Pencil | Jun 14, 2:30 PM             │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  │  ┌─────────────────────────────────────────────────┐    │ │
│  │  │ [⚠️] Fine          CE$ 5.00   -CE$ 5.00         │    │ │
│  │  │      Late to class | Jun 13, 9:00 AM            │    │ │
│  │  └─────────────────────────────────────────────────┘    │ │
│  │                                                           │ │
│  │  [👁️ View All 12 Transactions]                          │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Navigation Sidebar (Updated)

```
┌──────────────────────┐
│ Signed in as         │
│ John Student         │
│ [Student Badge]      │
├──────────────────────┤
│ [Current Class ▼]    │
├──────────────────────┤
│ 📖 Dashboard         │
│ 🎓 My Classes        │
│ 🎒 Backpack          │
│ 💼 Job Board         │
│ 📥 Requests          │
│ 🛍️ Store             │
│ 🛒 Cart (2)          │
├──────────────────────┤
│ QUICK ACTIONS        │
│ 🕐 My Activity  ←NEW │
│ 📖 My Assignments    │
│ 🛍️ My Purchases      │
└──────────────────────┘
```

## My Activity Page (Full View)

```
┌─────────────────────────────────────────────────────────────────┐
│ My Activity                                                     │
│ View your complete transaction history                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [BALANCE OVER TIME CHART - Same as dashboard but larger]      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │  Income  │ │ Expenses │ │   Net    │ │   Total  │          │
│  │ +CE$50.00│ │ -CE$30.00│ │ +CE$20.00│ │    12    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────── FILTERS ─────────────────────────┐ │
│  │  Type: [All Types ▼]  Date: [All Time ▼]  🔍 [Search...] │ │
│  │                                                            │ │
│  │  Showing 12 of 12 transactions          [📥 Export CSV]  │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────── TRANSACTION HISTORY ──────────────────────┐  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ [💰] Payroll        CE$ 15.00     +CE$ 15.00      │  │  │
│  │  │      Weekly salary for June 10-16                 │  │  │
│  │  │      📅 Wednesday, June 15, 2025 at 3:00 PM       │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ [🛍️] Purchase       CE$ 10.00     -CE$ 10.00      │  │  │
│  │  │      Fancy Pencil                                  │  │  │
│  │  │      📅 Tuesday, June 14, 2025 at 2:30 PM         │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ [⚠️] Fine           CE$ 5.00      -CE$ 5.00       │  │  │
│  │  │      Late to class                                 │  │  │
│  │  │      📅 Monday, June 13, 2025 at 9:00 AM          │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  │  ... [9 more transactions] ...                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Transaction Type Icons & Colors

| Type       | Icon | Color  | Example Amount |
|------------|------|--------|----------------|
| DEPOSIT    | 📈   | Green  | +CE$ 20.00     |
| INCOME     | 💵   | Green  | +CE$ 10.00     |
| PAYROLL    | 💰   | Blue   | +CE$ 15.00     |
| REFUND     | 🔄   | Cyan   | +CE$ 5.00      |
| PURCHASE   | 🛍️   | Purple | -CE$ 10.00     |
| FINE       | ⚠️   | Yellow | -CE$ 5.00      |
| WITHDRAWAL | 📉   | Red    | -CE$ 20.00     |
| EXPENSE    | 📉   | Red    | -CE$ 8.00      |
| TRANSFER   | ↔️   | Gray   | +/- CE$ 5.00   |
| ADJUSTMENT | 🔄   | Gray   | +/- CE$ 2.00   |

## Filter Examples

### By Type
```
[Filter: Purchases ▼]
→ Shows only PURCHASE transactions
→ Statistics recalculate for filtered data
→ Count shows "Showing 5 of 12 transactions"
```

### By Date Range
```
[Date: This Month ▼]
→ Shows June 1-30 transactions only
→ Balance chart updates to show only this period
→ Export includes only filtered dates
```

### By Search
```
🔍 [late to class___]
→ Searches transaction memos
→ Shows matching transactions only
→ Highlights search terms (if implemented)
```

### Combined Filters
```
Type: Fines ▼  Date: Last Month ▼  🔍 [classroom___]
→ All filters work together
→ Shows May fines with "classroom" in memo
→ Export contains only these results
```

## User Flows

### Flow 1: Quick Activity Check
```
1. Student logs in
2. Dashboard loads automatically
3. Sees balance chart (trend visualization)
4. Scrolls to activity widget
5. Checks last 5 transactions at a glance
```

### Flow 2: Detailed Analysis
```
1. Student clicks "My Activity" in sidebar
2. Full page loads with complete history
3. Sees balance chart with full timeline
4. Checks statistics cards
5. Uses filters to narrow down specific transactions
6. Exports data for personal records
```

### Flow 3: Investigation
```
1. Student notices balance decrease
2. Opens "My Activity" page
3. Filters by date: "This Month"
4. Sees all recent transactions
5. Identifies the fine/purchase
6. Reviews transaction details
```

## Mobile Responsive Behavior

### Dashboard (Mobile)
- Balance chart stacks vertically
- Stats cards become 2x2 grid
- Activity widget full width
- Transaction cards stack

### Activity Page (Mobile)
- Chart scales down but remains readable
- Stats become 2x2 grid
- Filter panel stacks vertically:
  - Type dropdown (full width)
  - Date dropdown (full width)
  - Search bar (full width)
- Transaction list full width with touch-friendly cards

## Key Improvements Over Fines Widget

| Feature | Fines Widget | Activity System |
|---------|--------------|-----------------|
| Data Shown | Fines only | All transactions |
| Count | 3 recent | 5 recent (widget), unlimited (page) |
| Filtering | None | Type, date, search |
| Visualization | None | Balance over time chart |
| Statistics | Active fines, total fined | Income, expenses, net change |
| Export | None | CSV export |
| Navigation | To profile | To dedicated activity page |
| Financial Literacy | Low | High (shows full picture) |
