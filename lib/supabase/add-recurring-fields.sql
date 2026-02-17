-- Add biweekly option to recurrence_frequency
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_recurrence_frequency_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_recurrence_frequency_check 
  CHECK (recurrence_frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly'));

-- Add yearly_month and yearly_day for yearly expenses
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS yearly_month INTEGER;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS yearly_day INTEGER;

-- Add constraint for yearly expenses
ALTER TABLE transactions ADD CONSTRAINT yearly_date_check 
  CHECK (
    (recurrence_frequency != 'yearly') OR 
    (recurrence_frequency = 'yearly' AND yearly_month IS NOT NULL AND yearly_day IS NOT NULL)
  );