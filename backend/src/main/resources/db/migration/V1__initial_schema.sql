-- ============================================================
-- V1 : Initial Schema – Project KEYSTONE FSM
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER',
    first_name  VARCHAR(50),
    last_name   VARCHAR(50),
    phone       VARCHAR(20),
    enabled     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name    VARCHAR(100),
    contact_phone   VARCHAR(20),
    billing_address TEXT,
    notes           TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facilities (
    id            BIGSERIAL PRIMARY KEY,
    customer_id   BIGINT       NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name          VARCHAR(100) NOT NULL,
    address       VARCHAR(255),
    city          VARCHAR(100),
    state         VARCHAR(100),
    zip_code      VARCHAR(20),
    country       VARCHAR(100) DEFAULT 'US',
    contact_name  VARCHAR(100),
    contact_phone VARCHAR(20),
    notes         TEXT,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS technicians (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT    NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    skills          TEXT,
    certifications  TEXT,
    available       BOOLEAN   NOT NULL DEFAULT TRUE,
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_requests (
    id           BIGSERIAL PRIMARY KEY,
    customer_id  BIGINT       NOT NULL REFERENCES customers(id),
    facility_id  BIGINT       REFERENCES facilities(id),
    title        VARCHAR(255) NOT NULL,
    description  TEXT,
    priority     VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    status       VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
    sla_hours    INTEGER      NOT NULL DEFAULT 24,
    due_at       TIMESTAMP,
    resolved_at  TIMESTAMP,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_orders (
    id                  BIGSERIAL PRIMARY KEY,
    service_request_id  BIGINT    NOT NULL REFERENCES service_requests(id),
    technician_id       BIGINT    REFERENCES technicians(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    scheduled_at        TIMESTAMP,
    started_at          TIMESTAMP,
    completed_at        TIMESTAMP,
    description         TEXT,
    notes               TEXT,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parts (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    sku             VARCHAR(50)     NOT NULL UNIQUE,
    description     TEXT,
    unit_price      NUMERIC(10, 2)  NOT NULL DEFAULT 0,
    stock_quantity  INTEGER         NOT NULL DEFAULT 0,
    reorder_level   INTEGER         NOT NULL DEFAULT 5,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_order_parts (
    id              BIGSERIAL PRIMARY KEY,
    work_order_id   BIGINT          NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    part_id         BIGINT          NOT NULL REFERENCES parts(id),
    quantity_used   INTEGER         NOT NULL DEFAULT 1,
    unit_price      NUMERIC(10, 2)  NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS time_entries (
    id              BIGSERIAL PRIMARY KEY,
    work_order_id   BIGINT    NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    technician_id   BIGINT    NOT NULL REFERENCES technicians(id),
    clock_in        TIMESTAMP NOT NULL,
    clock_out       TIMESTAMP,
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_service_requests_customer    ON service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status      ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_due_at      ON service_requests(due_at);
CREATE INDEX IF NOT EXISTS idx_work_orders_service_request  ON work_orders(service_request_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_technician       ON work_orders(technician_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status           ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_work_order      ON time_entries(work_order_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_technician      ON time_entries(technician_id);
CREATE INDEX IF NOT EXISTS idx_facilities_customer          ON facilities(customer_id);
