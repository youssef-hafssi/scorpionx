-- Migration script to update order status from 'New' to 'Pending'
-- Run this in your Supabase SQL Editor if you already have data with 'New' status

-- Update existing orders with 'New' status to 'Pending'
UPDATE orders 
SET status = 'Pending' 
WHERE status = 'New';

-- Update the check constraint to use 'Pending' instead of 'New'
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Canceled'));

-- Update the default value for new orders
ALTER TABLE orders 
ALTER COLUMN status SET DEFAULT 'Pending';

-- Verify the changes
SELECT status, COUNT(*) as count 
FROM orders 
GROUP BY status 
ORDER BY status;
