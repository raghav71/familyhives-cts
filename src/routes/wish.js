const wishRouter = require('express').Router();

const WishController = require("../controllers/WishController");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const WishValidator = require("../validators/WishValidator");
const AuthMiddleware = require("../middlewares/AuthMiddleware");


wishRouter.post('/sendWish',
AuthMiddleware().verifyToken,
WishValidator().validateWish,
ErrorHandlerMiddleware(WishController().sendWish),
ResponseMiddleware);

wishRouter.get('/wishList',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(WishController().wishList),
ResponseMiddleware);

wishRouter.post('/deleteWish',
AuthMiddleware().verifyToken,
WishValidator().validateWishId,
ErrorHandlerMiddleware(WishController().deleteWish),
ResponseMiddleware);

wishRouter.get('/getUserForWish',
AuthMiddleware().verifyToken,
//WishValidator().validateDate,
ErrorHandlerMiddleware(WishController().getUserForWish),
ResponseMiddleware);

wishRouter.post('/likeWish',
AuthMiddleware().verifyToken,
WishValidator().validateWishLike,
ErrorHandlerMiddleware(WishController().likeWishMessage),
ResponseMiddleware);

wishRouter.post('/addCommentOnWish',
AuthMiddleware().verifyToken,
WishValidator().validateWishComment,
ErrorHandlerMiddleware(WishController().addCommentOnWish),
ResponseMiddleware);

wishRouter.post('/deleteWishComments',
  AuthMiddleware().verifyToken,
  WishValidator().validateDeleteWishComment,
  ErrorHandlerMiddleware(WishController().deleteWishComments),
ResponseMiddleware);


wishRouter.get('/wishCommentList',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(WishController().wishCommentList),
ResponseMiddleware);

wishRouter.post('/likeUnlikeComments',
AuthMiddleware().verifyToken,
WishValidator().validateLikeOnComment,
ErrorHandlerMiddleware(WishController().likeUnlikeComments),
ResponseMiddleware);

wishRouter.get('/getAllLikesOnWish/:wishId',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(WishController().getAllLikesOnWish),
ResponseMiddleware);


module.exports=wishRouter;
