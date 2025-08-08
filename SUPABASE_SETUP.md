# Supabase Setup Guide

This guide will help you set up Supabase to replace the mock data with real database storage.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Fill in your project details:
   - Name: `grok-ecommerce` (or any name you prefer)
   - Database Password: Create a strong password
   - Region: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be set up (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Update Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the entire content from `database-schema.sql`
4. Click "Run" to execute the SQL commands

This will create:
- `orders` table for storing order information
- `order_items` table for storing individual order items
- Proper indexes for performance
- Sample data for testing

## Step 5: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/admin/orders`
3. You should see the sample orders from the database
4. Try creating a new order by:
   - Going to the main store (`http://localhost:3000`)
   - Adding items to cart
   - Going through checkout
   - Check if the new order appears in the admin panel

## Step 6: Verify Database Connection

1. In Supabase dashboard, go to **Table Editor**
2. Click on the `orders` table
3. You should see your sample data and any new orders created through the app

## Features Now Available

✅ **Real Database Storage**: All orders are now stored in Supabase PostgreSQL
✅ **Persistent Data**: Data survives app restarts and deployments
✅ **Real-time Updates**: Order status changes are immediately saved
✅ **Scalable**: Can handle thousands of orders
✅ **Backup & Recovery**: Supabase handles database backups
✅ **Multi-user Support**: Multiple admin users can access the same data

## Database Schema

### Orders Table
- `id`: UUID primary key
- `order_number`: Unique order number (ORD-000001, etc.)
- `customer_name`: Customer's full name
- `customer_phone`: Customer's phone number
- `customer_email`: Customer's email (optional)
- `delivery_address`: Delivery address
- `subtotal`, `shipping`, `total`: Order amounts
- `status`: Order status (New, Confirmed, Shipped, Delivered, Canceled)
- `notes`: Optional admin notes
- `created_at`, `updated_at`: Timestamps

### Order Items Table
- `id`: UUID primary key
- `order_id`: Foreign key to orders table
- `product_id`: Product identifier
- `product_name`: Product name
- `product_image`: Product image URL
- `product_price`: Product price at time of order
- `selected_size`: Selected size (if applicable)
- `quantity`: Quantity ordered

## Troubleshooting

### Connection Issues
- Verify your environment variables are correct
- Make sure `.env.local` is in the project root
- Restart your development server after changing environment variables

### Database Issues
- Check the SQL Editor for any error messages
- Verify all tables were created successfully in Table Editor
- Check the logs in Supabase dashboard under **Logs**

### Data Not Appearing
- Check browser console for error messages
- Verify Row Level Security policies are set correctly
- Check network tab in browser dev tools for failed API calls

## Next Steps

- **Authentication**: Add admin authentication for security
- **Backup Strategy**: Set up regular database backups
- **Monitoring**: Set up alerts for database issues
- **Performance**: Add database indexes as your data grows
- **Security**: Review and tighten Row Level Security policies
