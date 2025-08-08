-- Add stock management tables to existing Supabase database
-- Run this in your Supabase SQL Editor

-- Create products table for stock management
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image VARCHAR(500) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_stock table for size-specific inventory
CREATE TABLE IF NOT EXISTS product_stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, size)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_stock_product_id ON product_stock(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stock_quantity ON product_stock(quantity);

-- Create trigger to automatically update updated_at for products
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically update updated_at for product_stock
CREATE TRIGGER update_product_stock_updated_at 
    BEFORE UPDATE ON product_stock 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on product_stock" ON product_stock FOR ALL USING (true);

-- Insert the current product
INSERT INTO products (id, name, description, price, original_price, image) VALUES
('vintage-cargo-pants', 'ساتر العورة (Awrah Cover)', 'في عالمٍ تتغيّر فيه مفاهيم اللباس، يأتي "سكوربيون إكس" ليقدّم "ساتر العورة" ويُعيد تعريف الأناقة الرجالية من منظورٍ واعٍ ومحترم. هذا التصميم صُمم خصيصًا للرجل الذي يعتزّ بهويته، ويحرص على الالتزام بالستر والوقار دون أن يتخلى عن الذوق الرفيع.', 200, 300, '/IMG_8581-removebg-preview.png')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image = EXCLUDED.image,
  updated_at = NOW();

-- Insert stock for all sizes
INSERT INTO product_stock (product_id, size, quantity, low_stock_threshold) VALUES
('vintage-cargo-pants', 'S', 25, 5),
('vintage-cargo-pants', 'M', 30, 5),
('vintage-cargo-pants', 'L', 35, 5),
('vintage-cargo-pants', 'XL', 20, 5),
('vintage-cargo-pants', 'XXL', 15, 5),
('vintage-cargo-pants', '3XL', 10, 5)
ON CONFLICT (product_id, size) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  low_stock_threshold = EXCLUDED.low_stock_threshold,
  updated_at = NOW();
