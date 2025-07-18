const validateEmail = (req, res, next) => {
  const { email } = req.body;
  const re = /^\S+@\S+\.\S+$/;
  if (!email || !re.test(email)) {
    return res.status(400).json({ message: 'Invalid email' });
  }
  next();
};

const validatePassword = (req, res, next) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  next();
};

module.exports = { validateEmail, validatePassword }; 