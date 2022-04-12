require('dotenv').config();

const authGuard = (req, res, next) => {
    let clientKey = req.headers.authorization;
    if (clientKey !== undefined && (clientKey === process.env.APP_KEY)) {
        return next();
    } else {
        return res.status(401).json({ msg: 'Unauthorized' });
    }
}

module.exports = { authGuard };