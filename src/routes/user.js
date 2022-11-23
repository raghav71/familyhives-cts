const userRouter = require('express').Router();
const UserController = require("../controllers/UserController");
const AuthController = require("../controllers/AuthController");
const AlbumController = require("../controllers/AlbumController");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const AuthValidator = require("../validators/AuthValidator");
const UserValidator = require("../validators/UserValidator");
const AlbumValidator = require("../validators/AlbumValidator");
const AuthMiddleware = require("../middlewares/AuthMiddleware");


userRouter.post('/changePassword',
AuthMiddleware().verifyTokenForAll,
AuthValidator().changePasswordValidator,
ErrorHandlerMiddleware(AuthController().changePassword),
ResponseMiddleware);

userRouter.post('/editProfile',
  AuthMiddleware().verifyToken,
  AuthValidator().editProfileValidator,
  AuthMiddleware().checkEmailAndMobileToEditProfile,
  ErrorHandlerMiddleware(UserController().updateProfile),
  ResponseMiddleware);

userRouter.post('/changePrivacyAndPermission',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(UserController().changePrivacyAndPermission),
ResponseMiddleware);

userRouter.get('/getPrivacyAndPermission',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(UserController().getPrivacyAndPermission),
ResponseMiddleware);

userRouter.get('/userList',
AuthMiddleware().verifyTokenForAll,
ErrorHandlerMiddleware(UserController().userList),
ResponseMiddleware);

userRouter.get('/checkMobile',
AuthMiddleware().verifyToken,
UserValidator().validateMobile,
ErrorHandlerMiddleware(UserController().checkMobile),
ResponseMiddleware);

userRouter.get('/getLogs',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(UserController().getLogs),
ResponseMiddleware);

userRouter.put('/updateDeviceToken',
  AuthMiddleware().verifyToken,
  UserValidator().validateDeviceToken,
  ErrorHandlerMiddleware(UserController().updateDeviceToken),
  ResponseMiddleware);

  userRouter.get('/getAllFeeds',
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(UserController().getAllFeeds),
  ResponseMiddleware);

  userRouter.get('/getAllBlockedUsers',
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(UserController().getAllBlockedUsers),
  ResponseMiddleware);

  userRouter.get('/activateEmail',
    AuthMiddleware().verifyEmailToken,
    ErrorHandlerMiddleware(UserController().activateEmail),
  ResponseMiddleware);

module.exports=userRouter;
