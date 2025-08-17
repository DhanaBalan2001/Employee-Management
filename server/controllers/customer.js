import Customer from '../models/Customer.js';
import { trackRecord } from '../utils/recordTracking.js';

const generateCustomerCode = async () => {
  const count = await Customer.countDocuments();
  return String(count + 1).padStart(4, '0');
};

export const createCustomer = async (req, res) => {
  try {
    const custCode = await generateCustomerCode();
    const customer = new Customer({
      ...req.body,
      custCode,
      createdBy: req.user._id
    });
    await customer.save();
    
    // Add record tracking
    await trackRecord(Customer, customer._id, null, req.body, req.user, 'Customer', 'create');
    
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const originalCustomer = await Customer.findById(req.params.id);
    if (!originalCustomer) return res.status(404).json({ message: 'Customer not found' });
    
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user._id },
      { new: true }
    );
    
    // Add record tracking
    await trackRecord(Customer, customer._id, originalCustomer.toObject(), req.body, req.user, 'Customer', 'update');
    
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};