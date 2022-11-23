const authRouter = require('express').Router();
const OtpController = require("../controllers/OtpController");
const AuthController = require("../controllers/AuthController");
const UserController = require("../controllers/UserController");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const AuthValidator = require("../validators/AuthValidator");


authRouter.get('/signup',
AuthMiddleware().setLanguage,
AuthMiddleware().checkMobile,
AuthValidator().mobileValidator,
ErrorHandlerMiddleware(AuthController().signup),
ResponseMiddleware);

authRouter.get('/resendOtp',
AuthMiddleware().setLanguage,
AuthValidator().resendOtpMobileValidator,
ErrorHandlerMiddleware(OtpController().resendOtp),
ResponseMiddleware);

authRouter.get('/verifyOtp',
AuthMiddleware().setLanguage,
AuthValidator().otpValidator,
ErrorHandlerMiddleware(OtpController().verifyOtp),
ResponseMiddleware);

authRouter.post('/completeProfile',
  AuthMiddleware().verifyToken,
  AuthMiddleware().setLanguage,
  AuthValidator().profileValidator,
  ErrorHandlerMiddleware(AuthController().completeProfile),
  ResponseMiddleware);

  authRouter.get('/forgotpassword',
  AuthMiddleware().setLanguage,
  AuthMiddleware().checkLoginMobile,
  AuthValidator().resendOtpMobileValidator,
  ErrorHandlerMiddleware(AuthController().forgotpassword),
  ResponseMiddleware);

  authRouter.post('/resetPassword',
    AuthMiddleware().verifyToken,
    AuthValidator().passwordValidator,
    AuthMiddleware().setLanguage,
    ErrorHandlerMiddleware(AuthController().resetPassword),
  ResponseMiddleware);

  authRouter.post("/login/social",
      AuthMiddleware().setLanguage,
      AuthValidator().socialLoginValidator,
      AuthMiddleware().socialLoginValidator,
      ErrorHandlerMiddleware(AuthController().socialLogin),
      ResponseMiddleware
  );

  authRouter.get("/login",
      AuthMiddleware().setLanguage,
      AuthMiddleware().checkLoginMobile,
      AuthValidator().loginValidator,
      ErrorHandlerMiddleware(AuthController().login),
      ResponseMiddleware
  );


  authRouter.get("/termAndConditions",
    AuthMiddleware().setLanguage,
    AuthValidator().languageValidator,
    ErrorHandlerMiddleware(UserController().fetchTermAndConditions),
    ResponseMiddleware
  );

  authRouter.get("/privacyAndPolicy",
    AuthMiddleware().setLanguage,
    AuthValidator().languageValidator,
    ErrorHandlerMiddleware(UserController().fetchPrivacyAndPolicy),
    ResponseMiddleware
  );

  authRouter.get("/getAboutApp",
    AuthMiddleware().setLanguage,
    AuthValidator().languageValidator,
    ErrorHandlerMiddleware(UserController().getAboutApp),
    ResponseMiddleware
  );

  authRouter.get("/getHelplineDetails",
      AuthMiddleware().verifyToken,
      ErrorHandlerMiddleware(UserController().getHelplineDetails),
      ResponseMiddleware
  );

  authRouter.get("/getFAQs",
      AuthMiddleware().setLanguage,
      AuthValidator().languageValidator,
      ErrorHandlerMiddleware(UserController().getFAQs),
      ResponseMiddleware
  );

  authRouter.get("/logout",
      AuthMiddleware().verifyToken,
      ErrorHandlerMiddleware(AuthController().logout),
      ResponseMiddleware
  );

module.exports=authRouter;
