function validateProfileSetup(req, res, next) {
  const { user, lifestyle } = req.body;
  if (!user || !user.name || !user.email || !user.password || !user.age_group || !user.city) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please complete all required profile fields (Name, Email, Password, Age Group, City).'
      }
    });
  }

  if (
    !lifestyle ||
    !lifestyle.transport_mode ||
    lifestyle.daily_distance_km === undefined ||
    !lifestyle.food_preference ||
    !lifestyle.shopping_frequency ||
    !lifestyle.waste_segregation
  ) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please answer all lifestyle questions to calculate your carbon footprint.'
      }
    });
  }

  next();
}

module.exports = {
  validateProfileSetup
};
