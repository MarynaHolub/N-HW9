import jwt from 'jsonwebtoken';

const authenticatePasswordChange = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Необходима авторизация',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== 'password-change') {
      return res.status(403).json({
        message: 'Недостаточно прав',
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Недействительный или просроченный токен',
    });
  }
};

export default authenticatePasswordChange;