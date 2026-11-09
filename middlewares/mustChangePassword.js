import User from '../models/user.js';

// 2. Проверяет флаг в БД
const mustChangePassword = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    if (user.mustChangePassword) {
      return res.status(403).json({
        message: 'Необходимо сменить пароль',
        mustChangePassword: true,
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
export default mustChangePassword;

// middleware mustChangePassword сейчас никогда не срабатывает. Оно проверяет req.user.mustChangePassword, а в токен при логине это поле не записывается, поэтому значение всегда undefined.
// Нужно либо добавить mustChangePassword в jwt.sign, либо в middleware брать пользователя из базы через User.findByPk(req.user.id) и проверять флаг там. По условию проверка должна выполняться при входе, поэтому в /login стоит сразу проверить existingUser.mustChangePassword и вернуть перенаправление на смену пароля.
