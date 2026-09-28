CREATE TABLE IF NOT EXISTS monthly_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month DATE NOT NULL CONSTRAINT monthly_budgets_first_day_check CHECK (EXTRACT(DAY FROM month) = 1),
  amount NUMERIC(15, 2) NOT NULL CONSTRAINT monthly_budgets_amount_check CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS monthly_budgets_user_month_idx
  ON monthly_budgets (user_id, month);
