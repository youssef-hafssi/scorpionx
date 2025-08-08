-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  delivery_address TEXT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Shipped', 'Delivered', 'Canceled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  product_image VARCHAR(500) NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  selected_size VARCHAR(10),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - you can restrict this later)
CREATE POLICY "Allow all operations on orders" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations on order_items" ON order_items FOR ALL USING (true);

-- Insert some sample data (optional)
INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, delivery_address, subtotal, shipping, total, status) VALUES
('ORD-000001', 'Ahmed Hassan', '+212 6 12 34 56 78', 'ahmed@example.com', 'Casablanca, Morocco', 200, 0, 200, 'Pending'),
('ORD-000002', 'Fatima Zahra', '+212 6 87 65 43 21', 'fatima@example.com', 'Rabat, Morocco', 200, 0, 200, 'Confirmed'),
('ORD-000003', 'Omar Benali', '+212 6 11 22 33 44', 'omar@example.com', 'Marrakech, Morocco', 400, 0, 400, 'Shipped');

-- Insert corresponding order items
INSERT INTO order_items (order_id, product_id, product_name, product_image, product_price, selected_size, quantity) 
SELECT 
  o.id,
  'vintage-cargo-pants',
  'ساتر العورة (Awrah Cover)',
  '/IMG_8581-removebg-preview.png',
  200,
  'M',
  CASE WHEN o.order_number = 'ORD-000003' THEN 2 ELSE 1 END
FROM orders o 
WHERE o.order_number IN ('ORD-000001', 'ORD-000002', 'ORD-000003');
