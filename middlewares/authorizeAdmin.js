
import User from '../models/user.js';

const authorizeAdmin = async (req, res, next) => {
  try {
    // authenticate уже проверил токен и положил его данные в req.user
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(401).json({
        message: 'Пользователь не найден',
      });
    }

    // проверяем актуальную роль из базы
    if (user.role !== 'admin') {
      return res.status(403).json({
        message: 'Доступ запрещён. Требуются права администратора.',
      });
    }

    req.currentUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authorizeAdmin;
