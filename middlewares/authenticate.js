import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;  // получает заголовок Authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {   // Bearer указывает, что в запросе передаётся токен доступа
      return res.status(401).json({
        message: 'Необходима авторизация',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);   // проверяет подпись токена и срок его действия

    req.user = decoded;   // сохраняет данные из токена в объект запроса

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Недействительный или просроченный токен',
    });
  }
};

export default authenticate;