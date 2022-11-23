const likeRouter = require('express').Router();

const LikeController = require("../controllers/LikeController");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const LikeValidator = require("../validators/LikeValidator");
const AuthMiddleware = require("../middlewares/AuthMiddleware");




likeRouter.get('/getAllLikes',
AuthMiddleware().verifyToken,
LikeValidator().validateType,
ErrorHandlerMiddleware(LikeController().getAllLikes),
ResponseMiddleware);



module.exports=likeRouter;
