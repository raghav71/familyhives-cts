const alarmRouter = require('express').Router();

const AlarmController = require("../controllers/AlarmController");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const AlarmValidator = require("../validators/AlarmValidator");
const AuthMiddleware = require("../middlewares/AuthMiddleware");


alarmRouter.post('/addAlarm',
AuthMiddleware().verifyToken,
AlarmValidator().validateAlarm,
ErrorHandlerMiddleware(AlarmController().addAlarm),
ResponseMiddleware);

alarmRouter.get('/getAlarm',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(AlarmController().getAlarm),
ResponseMiddleware);

alarmRouter.post('/deleteAlarm',
AuthMiddleware().verifyToken,
AlarmValidator().validateAlarmId,
ErrorHandlerMiddleware(AlarmController().deleteAlarm),
ResponseMiddleware);

alarmRouter.patch('/setAlarmStatus',
AuthMiddleware().verifyToken,
AlarmValidator().validateAlarmStatus,
ErrorHandlerMiddleware(AlarmController().setAlarmStatus),
ResponseMiddleware);

module.exports=alarmRouter;
