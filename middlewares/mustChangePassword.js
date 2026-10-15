
const mustChangePassword = (req, res, next) => {
  if (req.user?.mustChangePassword === true) {
    return res.redirect('/change-password');  // выполняется перенаправление на /change-password
  }

  next();
};

export default mustChangePassword;

