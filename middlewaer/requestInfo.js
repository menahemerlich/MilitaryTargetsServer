
export function requestInfo(req, res, next) {
    req.timestamp = new Date().toISOString()
    console.log(`[${req.method}] ${req.path} ${req.timestamp}`);
    next()
}