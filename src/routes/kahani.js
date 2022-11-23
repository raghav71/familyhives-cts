const kahaniRouter = require('express').Router();
const KahaniController = require("../controllers/KahaniController");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const KahaniValidator = require("../validators/KahaniValidator");


kahaniRouter.post('/addKahani',
AuthMiddleware().verifyToken,
KahaniValidator().validateKahani,
ErrorHandlerMiddleware(KahaniController().addKahani),
ResponseMiddleware);

kahaniRouter.patch('/changeKahaniPrivacy/:id',
AuthMiddleware().verifyToken,
AuthMiddleware().validateUserForKahani,
KahaniValidator().validateKahaniPrivacy,
ErrorHandlerMiddleware(KahaniController().changeKahaniPrivacy),
ResponseMiddleware);

kahaniRouter.get('/kahaniList',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(KahaniController().kahaniList),
ResponseMiddleware);

kahaniRouter.post('/deleteKahani',
AuthMiddleware().verifyToken,
KahaniValidator().validateKahaniId,
ErrorHandlerMiddleware(KahaniController().deleteKahani),
ResponseMiddleware);


kahaniRouter.get('/kahaniCommentList',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(KahaniController().kahaniCommentList),
ResponseMiddleware);

kahaniRouter.post('/addCommentOnKahani',
AuthMiddleware().verifyToken,
KahaniValidator().validateKahaniComment,
ErrorHandlerMiddleware(KahaniController().addCommentOnKahani),
ResponseMiddleware);

kahaniRouter.put('/updateCommentOnKahani',
  AuthMiddleware().verifyToken,
  KahaniValidator().validateEditKahaniComment,
  ErrorHandlerMiddleware(KahaniController().updateCommentOnKahani),
ResponseMiddleware);

kahaniRouter.post('/deleteKahaniComments',
  AuthMiddleware().verifyToken,
  KahaniValidator().validateDeleteKahaniComment,
  ErrorHandlerMiddleware(KahaniController().deleteKahaniComments),
ResponseMiddleware);

kahaniRouter.post('/likeKahani',
AuthMiddleware().verifyToken,
KahaniValidator().validateKahaniLike,
ErrorHandlerMiddleware(KahaniController().likeKahani),
ResponseMiddleware);

kahaniRouter.post('/likeUnlikeComments',
AuthMiddleware().verifyToken,
KahaniValidator().validateLikeOnComment,
ErrorHandlerMiddleware(KahaniController().likeUnlikeComments),
ResponseMiddleware);

/*kahaniRouter.get('/getAllLikesOnKahani/:kahaniId',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(KahaniController().getAllLikesOnKahani),
ResponseMiddleware);*/

module.exports=kahaniRouter;
