# ER Diagram — IT Staffing SaaS

```mermaid
erDiagram
    CLIENTS ||--o{ PROJECTS : has
    CLIENTS ||--o{ CONSULTANTS : staffs
    CLIENTS ||--o{ TIMESHEETS : approves
    CLIENTS ||--o{ CLIENT_INVOICES : billed

    VENDORS ||--o{ CONSULTANTS : supplies
    VENDORS ||--o{ VENDOR_INVOICES : receives

    PROJECTS ||--o{ CONSULTANTS : assigned_to
    PROJECTS ||--o{ TIMESHEETS : logged_against

    CONSULTANTS ||--o{ TIMESHEETS : submits
    CONSULTANTS ||--o{ CLIENT_INVOICES : generates
    CONSULTANTS ||--o{ VENDOR_INVOICES : generates
    CONSULTANTS ||--o{ PAYROLL : generates

    TIMESHEETS ||--o| CLIENT_INVOICES : "triggers (1:1 per approval)"
    TIMESHEETS ||--o| VENDOR_INVOICES : "triggers if C2C"
    TIMESHEETS ||--o| PAYROLL : "triggers if W2"

    PROFILES ||--o{ CLIENTS : manages
    PROFILES ||--o{ CONSULTANTS : recruits

    CLIENTS {
        uuid id PK
        text client_name
        text company
        text currency
        enum billing_cycle
        enum payment_terms
        text purchase_order
        uuid account_manager_id FK
    }

    PROJECTS {
        uuid id PK
        uuid client_id FK
        text project_name
        date start_date
        date end_date
    }

    VENDORS {
        uuid id PK
        text vendor_name
        enum payment_terms
    }

    CONSULTANTS {
        uuid id PK
        uuid user_id FK
        text consultant_name
        text employee_id
        uuid vendor_id FK
        enum employment_type
        uuid client_id FK
        uuid project_id FK
        numeric bill_rate
        numeric pay_rate
        numeric vendor_rate
        numeric overtime_rate
        uuid recruiter_id FK
        uuid account_manager_id FK
    }

    TIMESHEETS {
        uuid id PK
        uuid consultant_id FK
        uuid client_id FK
        uuid project_id FK
        date week_start
        date week_end
        numeric regular_hours
        numeric ot_hours
        numeric holiday_hours
        numeric pto_hours
        numeric total_hours
        enum status
    }

    CLIENT_INVOICES {
        uuid id PK
        text invoice_number
        uuid client_id FK
        uuid consultant_id FK
        uuid timesheet_id FK
        numeric hours_worked
        numeric bill_rate
        numeric regular_amount
        numeric ot_amount
        numeric grand_total
        enum status
    }

    VENDOR_INVOICES {
        uuid id PK
        text invoice_number
        uuid vendor_id FK
        uuid consultant_id FK
        uuid timesheet_id FK
        numeric hours
        numeric vendor_rate
        numeric amount
        enum status
    }

    PAYROLL {
        uuid id PK
        uuid consultant_id FK
        uuid timesheet_id FK
        numeric hours
        numeric pay_rate
        numeric gross_pay
        numeric taxes
        numeric benefits
        numeric net_pay
        enum status
    }

    OTHER_EXPENSES {
        uuid id PK
        text description
        numeric amount
        date expense_date
        uuid client_id FK
    }

    PROFILES {
        uuid id PK
        text full_name
        text email
        enum role
    }
```

## Automation flow (matches trigger `trg_timesheet_approved`)

```
Timesheet.status -> APPROVED
        │
        ▼
Create Client Invoice (always)
        │
        ├── employment_type = C2C ──► Create Vendor Invoice
        │
        └── employment_type = W2  ──► Create Payroll record
        │
        ▼
Notification row inserted (email worker picks it up)
        │
        ▼
Dashboard / P&L view (v_profit_loss) reflects new numbers automatically
  since it's computed live from client_invoices + vendor_invoices + payroll
```
