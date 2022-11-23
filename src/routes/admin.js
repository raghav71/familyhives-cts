const adminRouter = require('express').Router();
const AdminController = require("../controllers/AdminController");
const UserController = require("../controllers/UserController");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const AdminValidator = require("../validators/AdminValidator");


adminRouter.get(
  "/login",
  AdminValidator().loginValidator,
  ErrorHandlerMiddleware(AdminController().login),
  ResponseMiddleware
);

adminRouter.get('/forgotpassword',
  AdminValidator().forgotPasswordValidator,
  ErrorHandlerMiddleware(AdminController().forgotpassword),
  ResponseMiddleware
);

adminRouter.get('/verifyOtp',
AdminValidator().otpValidator,
ErrorHandlerMiddleware(AdminController().verifyOtp),
ResponseMiddleware);

adminRouter.put('/resetPassword',
  AuthMiddleware().verifyAdminToken,
  AdminValidator().passwordValidator,
  ErrorHandlerMiddleware(AdminController().resetPassword),
ResponseMiddleware);

adminRouter.put('/changeUserStatus',
  AuthMiddleware().verifyAdminToken,
  AdminValidator().changeUserStatusValidator,
  ErrorHandlerMiddleware(AdminController().changeUserStatus),
ResponseMiddleware);

adminRouter.delete('/deleteUser',
  AuthMiddleware().verifyAdminToken,
  AdminValidator().deleteUserValidator,
  ErrorHandlerMiddleware(AdminController().deleteUser),
ResponseMiddleware);

adminRouter.get('/userList',
AuthMiddleware().verifyAdminToken,
ErrorHandlerMiddleware(UserController().userList),
ResponseMiddleware);


adminRouter.patch('/changeAboutUs',
  AuthMiddleware().verifyAdminToken,
  //AdminValidator().aboutUsValidator,
  ErrorHandlerMiddleware(AdminController().changeAboutUs),
ResponseMiddleware);

adminRouter.patch('/changePrivacyPolicy',
  AuthMiddleware().verifyAdminToken,
  //AdminValidator().privacyPolicyValidator,
  ErrorHandlerMiddleware(AdminController().changePrivacyPolicy),
ResponseMiddleware);

adminRouter.patch('/changeTermAndCondition',
  AuthMiddleware().verifyAdminToken,
  //AdminValidator().termAndConditionValidator,
  ErrorHandlerMiddleware(AdminController().changeTermAndCondition),
ResponseMiddleware);

adminRouter.patch('/addFAQs',
  AuthMiddleware().verifyAdminToken,
  AdminValidator().FAQsValidator,
  ErrorHandlerMiddleware(AdminController().addFAQs),
ResponseMiddleware);

adminRouter.post('/deleteFAQs',
  AuthMiddleware().verifyAdminToken,
  AdminValidator().FAQsIdValidator,
  ErrorHandlerMiddleware(AdminController().deleteFAQs),
ResponseMiddleware);

adminRouter.post('/deleteAllFAQs',
  AuthMiddleware().verifyAdminToken,
  AdminValidator().languageValidator,
  ErrorHandlerMiddleware(AdminController().deleteAllFAQs),
ResponseMiddleware);

adminRouter.put('/updateFAQStatus',
  AuthMiddleware().verifyAdminToken,
  AdminValidator().statusValidator,
  ErrorHandlerMiddleware(AdminController().updateFAQStatus),
ResponseMiddleware);

adminRouter.get('/getUserDetails',
  AuthMiddleware().verifyAdminToken,
  AdminValidator().userDetailsValidator,
  ErrorHandlerMiddleware(AdminController().getUserDetails),
ResponseMiddleware);

adminRouter.get('/getAlbumDetails',
  AuthMiddleware().verifyAdminToken,
  AdminValidator().albumDetailsValidator,
  ErrorHandlerMiddleware(AdminController().getAlbumDetails),
ResponseMiddleware);

adminRouter.get('/getAllContentList',
AuthMiddleware().verifyAdminToken,
//AdminValidator().languageValidator,
ErrorHandlerMiddleware(AdminController().getAllContentList),
ResponseMiddleware);

adminRouter.get('/getAllLanguages',
ErrorHandlerMiddleware(AdminController().getAllLanguages),
ResponseMiddleware);

module.exports=adminRouter;
