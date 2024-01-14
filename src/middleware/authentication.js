const jwt = require("jsonwebtoken");

module.exports = (request, response, next) => {
  try {
    const accessToken = request.headers.authorization;
    let verify = jwt.verify(accessToken, "accessToken");
    request.user = {};
    request.user.isAdmin = verify?.role?.includes("Admin");
    next();
  } catch (error) {
    response.status(401).send(error);
    console.log(error);
  }
};

module.exports.refreshAccessToken = (request, response, next) => {
  try {
    const refreshToken = request.headers.token;
    jwt.verify(refreshToken, "refreshToken");
    next();
  } catch (error) {
    response.status(401).send(error);
    console.log(error);
  }
};
