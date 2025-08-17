// Validation middleware to prevent negative values
export const validateNonNegative = (req, res, next) => {
  const numericFields = [
    'hours', 'experienceYears', 'perHoursCharge', 'totalCost', 
    'totalHours', 'perHourCost', 'perHour', 'empHours', 'empAmount'
  ];
  
  const checkNegative = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (numericFields.includes(key) && typeof value === 'number' && value < 0) {
        return `${key} cannot be negative`;
      }
      
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          if (typeof value[i] === 'object' && value[i] !== null) {
            const error = checkNegative(value[i], `${currentPath}[${i}]`);
            if (error) return error;
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        const error = checkNegative(value, currentPath);
        if (error) return error;
      }
    }
    return null;
  };
  
  const error = checkNegative(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }
  
  next();
};