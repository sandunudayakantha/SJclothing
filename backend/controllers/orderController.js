import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const { items, customer } = req.body;

    console.log('Creating order with data:', { itemsCount: items?.length, customer: customer?.name });

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    if (!customer || !customer.name || !customer.phone || !customer.email || !customer.address) {
      return res.status(400).json({ message: 'Customer information is incomplete' });
    }

    // Calculate total and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      // Validate stock availability
      if (product.stock === 0) {
        return res.status(400).json({ message: `Product "${product.title}" is out of stock` });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({ 
          message: `Only ${product.stock} units available for "${product.title}". You requested ${item.quantity}.` 
        });
      }

      const price = product.discountPrice || product.price;
      const itemTotal = price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        title: product.title,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: price
      });
    }

    // Generate order number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    const processId = process.pid || 0;
    const orderNumber = `ORD-${timestamp}-${random}-${processId}`;

    const order = new Order({
      orderNumber,
      items: orderItems,
      customer,
      totalAmount,
      paymentMethod: 'Cash on Delivery'
    });

    await order.save();
    await order.populate('items.product', 'title images');

    console.log('Order created successfully:', order.orderNumber);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    // Provide more detailed error messages
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message).join(', ');
      return res.status(400).json({ message: `Validation error: ${errors}` });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Order number already exists. Please try again.' });
    }
    res.status(400).json({ message: error.message || 'Failed to create order. Please try again.' });
  }
};

// Get all orders (Admin only)
export const getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .populate('items.product', 'title images')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order (Admin only)
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (Admin only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Dispatched', 'Delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();
    await order.populate('items.product', 'title images');

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get order statistics (Admin only)
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const processingOrders = await Order.countDocuments({ status: 'Processing' });
    const dispatchedOrders = await Order.countDocuments({ status: 'Dispatched' });
    const deliveredOrders = await Order.countDocuments({ status: 'Delivered' });

    const totalRevenue = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.json({
      totalOrders,
      pendingOrders,
      processingOrders,
      dispatchedOrders,
      deliveredOrders,
      totalRevenue: revenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

