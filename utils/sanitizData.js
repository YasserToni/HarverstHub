exports.sanitizeUser = function (user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
  };
};
