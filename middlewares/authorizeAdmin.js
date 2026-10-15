const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      message: 'Доступ запрещён. Требуются права администратора.',
    });
  }

  next();
};

export default authorizeAdmin;