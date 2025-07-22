-- Clear all data from the system tables
DELETE FROM stock_movements;
DELETE FROM production_batches;
DELETE FROM order_items;
DELETE FROM customer_orders;
DELETE FROM maintenance_logs;
DELETE FROM employee_tasks;
DELETE FROM raw_materials;
DELETE FROM products;
DELETE FROM machines;
DELETE FROM suppliers;
DELETE FROM profiles WHERE id != '00000000-0000-0000-0000-000000000000';