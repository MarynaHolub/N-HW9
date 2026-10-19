import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import mustChangePassword from '../middlewares/mustChangePassword.js';
import authenticate from '../middlewares/authenticate.js';
import authorizeAdmin from '../middlewares/authorizeAdmin.js';

const router = express.Router(); // создаёт отдельный роутер для маршрутов, связанных с User

router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body ?? {};

    if (
      typeof username !== 'string' ||
      !username.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        message: 'Fields username, email, password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Пользователь с таким именем уже существует',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'admin',
    });

    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      message: 'Пользователь успешно зарегистрирован',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/profile', authenticate, mustChangePassword, (req, res) => {
  res.json({ message: 'Профиль пользователя' });
});

router.post('/change-password', authenticate, async (req, res, next) => {
  // authenticate - авторизация
  try {
    const { newPassword } = req.body ?? {};

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      // проверка нового пароля
      return res.status(400).json({
        message: 'Пароль должен содержать не менее 6 символов',
      });
    }

    const user = await User.findByPk(req.user.id); // поиск пользователя

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12); // хеширование пароля

    await user.update({
      // обновление пароля и флага
      password: hashedPassword,
      mustChangePassword: false,
    });

    res.json({
      message: 'Пароль успешно изменён',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/delete-account', authenticate, async (req, res, next) => {
  // authenticate проверяет JWT и записывает пользователя в req.user
  try {
    const { password } = req.body ?? {};

    if (typeof password !== 'string' || !password) {
      return res.status(400).json({
        message: 'Введите текущий пароль',
      });
    }

    const user = await User.findByPk(req.user.id); // User.findByPk(req.user.id) находит аккаунт авторизованного пользователя

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      // сравнивает введённый пароль с хешем в базе данных
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Неверный пароль',
      });
    }

    await user.destroy();

    return res.status(200).json({
      message: 'Аккаунт успешно удалён',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/admin', authenticate, authorizeAdmin, (req, res) => {
  res.json({
    message: 'Добро пожаловать в панель администратора!',
  });
});

// Изменение email
router.post('/change-email', authenticate, async (req, res, next) => {
  try {
    const { newEmail, password } = req.body ?? {};

    // 1. Проверяем входные данные
    if (
      typeof newEmail !== 'string' ||
      !newEmail.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        message: 'New email and current password are required',
      });
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    // 2. Проверяем формат email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: 'Некорректный формат email',
      });
    }

    // 3. Находим авторизованного пользователя
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    // 4. Проверяем текущий пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Неверный текущий пароль',
      });
    }

    // 5. Проверяем уникальность нового email
    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Этот email уже используется',
      });
    }

    // 6. Обновляем email
    await user.update({
      email: normalizedEmail,
    });

    return res.status(200).json({
      message: 'Email успешно изменён',
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
