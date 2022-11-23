const friendRouter = require('express').Router();
const FriendController = require("../controllers/FriendController");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const FriendValidator = require("../validators/FriendValidator");
const AuthMiddleware = require("../middlewares/AuthMiddleware");


friendRouter.post('/sendFriendRequest',
AuthMiddleware().verifyToken,
FriendValidator().validateFriendId,
ErrorHandlerMiddleware(FriendController().sendFriendRequest),
ResponseMiddleware);

friendRouter.get('/getRequestList',
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(FriendController().getRequestList),
  ResponseMiddleware);

friendRouter.patch('/acceptRejectRequest',
AuthMiddleware().verifyToken,
FriendValidator().validateAcceptRejectRequest,
ErrorHandlerMiddleware(FriendController().acceptRejectRequest),
ResponseMiddleware);

friendRouter.post('/getFriendsList',
AuthMiddleware().verifyToken,
FriendValidator().validateGetFriendList,
ErrorHandlerMiddleware(FriendController().getFriendsList),
ResponseMiddleware);

friendRouter.get('/getAcceptedFriendList',
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(FriendController().getAcceptedFriendList),
ResponseMiddleware);

friendRouter.get('/getBlockedFriendList',
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(FriendController().getBlockedFriendList),
ResponseMiddleware);

/*friendRouter.patch('/blockFriend',
AuthMiddleware().verifyToken,
FriendValidator().validateBlockFriend,
ErrorHandlerMiddleware(FriendController().blockFriend),
ResponseMiddleware);*/


module.exports=friendRouter;
