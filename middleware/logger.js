// Middleware de logging personalizado
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const start = Date.now();
  const originalSend = res.send;
  
  // Override res.send to capture response time and status
  res.send = function(data) {
    const duration = Date.now() - start;
    const logData = {
      timestamp,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'Unknown',
      contentLength: res.get('Content-Length') || data?.length || 0
    };
    
    // Color coding based on status
    const statusColor = res.statusCode >= 500 ? '\x1b[31m' :  // Red for 5xx
                       res.statusCode >= 400 ? '\x1b[33m' :   // Yellow for 4xx
                       res.statusCode >= 300 ? '\x1b[36m' :   // Cyan for 3xx
                       '\x1b[32m';                            // Green for 2xx
    
    const resetColor = '\x1b[0m';
    
    console.log(
      `${statusColor}[${logData.timestamp}] ${logData.method} ${logData.url} ` +
      `${logData.status} ${logData.duration} - ${logData.ip}${resetColor}`
    );
    
    // Call original send
    originalSend.call(this, data);
  };
  
  next();
};

// Error logger middleware
const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(
    `\x1b[31m[${timestamp}] ERROR: ${err.message}\x1b[0m\n`,
    `Path: ${req.method} ${req.url}\n`,
    `IP: ${req.ip}\n`,
    `Stack: ${err.stack}`
  );
  next(err);
};

module.exports = {
  logger,
  errorLogger
};
