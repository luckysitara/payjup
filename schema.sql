-- Add this to the existing schema.sql file

-- Create transaction_analytics table
CREATE TABLE transaction_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  date DATE NOT NULL,
  total_transactions INT NOT NULL DEFAULT 0,
  total_volume DECIMAL(18, 6) NOT NULL DEFAULT 0,
  successful_transactions INT NOT NULL DEFAULT 0,
  failed_transactions INT NOT NULL DEFAULT 0,
  network TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a unique constraint to ensure one record per merchant per day per network
ALTER TABLE transaction_analytics
ADD CONSTRAINT unique_merchant_date_network UNIQUE (merchant_id, date, network);

-- Set up Row Level Security (RLS) policy
ALTER TABLE transaction_analytics ENABLE ROW LEVEL SECURITY;

-- Merchants can only view their own analytics
CREATE POLICY "Merchants can view their own analytics" ON transaction_analytics
  FOR SELECT USING (auth.uid() = merchant_id);

-- Create a function to update transaction analytics
CREATE OR REPLACE FUNCTION update_transaction_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO transaction_analytics (
    merchant_id, date, total_transactions, total_volume, 
    successful_transactions, failed_transactions, network
  )
  VALUES (
    NEW.merchant_id, 
    DATE(NEW.created_at), 
    1, 
    NEW.amount, 
    CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    NEW.network
  )
  ON CONFLICT (merchant_id, date, network)
  DO UPDATE SET
    total_transactions = transaction_analytics.total_transactions + 1,
    total_volume = transaction_analytics.total_volume + NEW.amount,
    successful_transactions = transaction_analytics.successful_transactions + 
      CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    failed_transactions = transaction_analytics.failed_transactions + 
      CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update analytics on new transactions
CREATE TRIGGER update_analytics_on_transaction
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_transaction_analytics();

