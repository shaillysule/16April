const Learning = require('../models/Learning');

exports.completeModule = async (req, res) => {
  try {
    // You can update user points logic here if needed
    res.send("Module completed and points awarded");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllModules = async (req, res) => {
  try {
    const modules = await Learning.find().select('title description difficulty estimatedTime createdAt');
    res.status(200).json(modules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getModuleById = async (req, res) => {
  try {
    const module = await Learning.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createModule = async (req, res) => {
  try {
    const newModule = new Learning(req.body);
    const savedModule = await newModule.save();
    res.status(201).json(savedModule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const updatedModule = await Learning.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!updatedModule) return res.status(404).json({ message: 'Module not found' });
    res.status(200).json(updatedModule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const module = await Learning.findByIdAndDelete(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    res.status(200).json({ message: 'Module deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
