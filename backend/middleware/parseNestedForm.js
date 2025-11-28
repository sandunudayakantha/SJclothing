// Middleware to parse nested form data from FormData
// Handles keys like "contact[phone]", "banner[title]", etc.
export const parseNestedForm = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    const parsed = { ...req.body };
    
    // Process all keys to find nested structures
    for (const key in req.body) {
      const value = req.body[key];
      
      // Handle bracket notation: "contact[phone]" -> { contact: { phone: value } }
      if (key.includes('[') && key.includes(']')) {
        const match = key.match(/^([^\[]+)\[([^\]]+)\]$/);
        if (match) {
          const [, parent, child] = match;
          if (!parsed[parent]) {
            parsed[parent] = {};
          }
          parsed[parent][child] = value;
          // Remove the original flat key
          delete parsed[key];
        }
      }
    }
    
    req.body = parsed;
  }
  
  next();
};

