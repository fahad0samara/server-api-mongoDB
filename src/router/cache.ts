// Middleware to prevent caching for sensitive or dynamic routes
const preventCaching = (req, res, next) => {
  // Set cache control headers to prevent caching
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
};

// Middleware to set cache control headers for static or less frequently changing routes
const setCacheControl = (req, res, next) => {
  // Set cache lifetime for one year (in seconds)
  res.set("Cache-Control", "public, max-age=31536000");
  next();
};

// Apply preventCaching middleware to sensitive or dynamic routes
app.get("/sensitive-data", preventCaching, (req, res) => {
  // Handle sensitive data retrieval
});

// Apply setCacheControl middleware to static or less frequently changing routes
app.get("/static-data", setCacheControl, (req, res) => {
  // Handle static data retrieval
});
