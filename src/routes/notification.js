const express = require('express');
const notificationRouter = express.Router();
const NotificationController = require("../controllers/NotificationController")
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const NotificationValidator = require("../validators/NotificationValidator")

notificationRouter.post('/createNotification',
  AuthMiddleware().verifyAdminToken,
  NotificationValidator().validateNotification,
  ErrorHandlerMiddleware(NotificationController().createNotification),
ResponseMiddleware);


notificationRouter.get('/get',
  //NotificationValidator().validateGetNotification,
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(NotificationController().getNotification),
ResponseMiddleware);


notificationRouter.patch('/setNotificationPermission',
  NotificationValidator().validateNotificationPermission,
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(NotificationController().setNotificationPermission),
ResponseMiddleware);

notificationRouter.patch('/updateNotification',
  NotificationValidator().validateUpdateNotification,
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(NotificationController().updateNotification),
ResponseMiddleware);

notificationRouter.get('/getUnreadNotificationCount',
  //NotificationValidator().validateGetNotification,
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(NotificationController().getUnreadNotificationCount),
ResponseMiddleware);

notificationRouter.delete('/deleteNotification',
  AuthMiddleware().verifyAdminToken,
  NotificationValidator().validateDeleteNotification,
  ErrorHandlerMiddleware(NotificationController().deleteNotification),
ResponseMiddleware);

notificationRouter.get('/getAdminNotification',
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(NotificationController().getAdminNotification),
ResponseMiddleware);

notificationRouter.get('/getAdminNotificationDetails',
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(NotificationController().getAdminNotificationDetails),
ResponseMiddleware);

module.exports=notificationRouter;
