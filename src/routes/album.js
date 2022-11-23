const albumRouter = require('express').Router();

const AlbumController = require("../controllers/AlbumController");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const AuthValidator = require("../validators/AuthValidator");
const AlbumValidator = require("../validators/AlbumValidator");
const AuthMiddleware = require("../middlewares/AuthMiddleware");


albumRouter.post('/createAlbum',
AuthMiddleware().verifyToken,
AlbumValidator().validateAlbum,
ErrorHandlerMiddleware(AlbumController().createAlbum),
ResponseMiddleware);

albumRouter.post('/createMemory',
AuthMiddleware().verifyToken,
AlbumValidator().validateMemory,
ErrorHandlerMiddleware(AlbumController().createMemory),
ResponseMiddleware);

albumRouter.get('/albumList',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(AlbumController().albumList),
ResponseMiddleware);

albumRouter.get('/albumDetails',
AuthMiddleware().verifyToken,
AlbumValidator().validateGetAlbumId,
ErrorHandlerMiddleware(AlbumController().albumDetails),
ResponseMiddleware);

albumRouter.get('/memoryList',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(AlbumController().memoryList),
ResponseMiddleware);

albumRouter.post('/deleteAlbum',
AuthMiddleware().verifyToken,
AlbumValidator().validateDeleteAlbum,
ErrorHandlerMiddleware(AlbumController().deleteAlbum),
ResponseMiddleware);

albumRouter.post('/deleteAlbumMemories',
AuthMiddleware().verifyToken,
AlbumValidator().validateMemoryId,
ErrorHandlerMiddleware(AlbumController().deleteAlbumMemories),
ResponseMiddleware);

albumRouter.patch('/likeMemory',
AuthMiddleware().verifyToken,
AlbumValidator().validateLikeMemory,
ErrorHandlerMiddleware(AlbumController().likeMemory),
ResponseMiddleware);

albumRouter.get('/getAllLikesOnMemory',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(AlbumController().getAllLikesOnMemory),
ResponseMiddleware);

albumRouter.patch('/addCommentOnMemory',
AuthMiddleware().verifyToken,
AlbumValidator().validateMemoryComment,
ErrorHandlerMiddleware(AlbumController().addCommentOnMemory),
ResponseMiddleware);

albumRouter.put('/updateCommentOnMemory',
AuthMiddleware().verifyToken,
AlbumValidator().validateEditMemoryComment,
ErrorHandlerMiddleware(AlbumController().updateCommentOnMemory),
ResponseMiddleware);

albumRouter.post('/deleteCommentOnMemory',
AuthMiddleware().verifyToken,
AlbumValidator().validateEditMemoryComment,
ErrorHandlerMiddleware(AlbumController().deleteCommentOnMemory),
ResponseMiddleware);

albumRouter.get('/getAllCommentsOnMemory',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(AlbumController().getAllCommentsOnMemory),
ResponseMiddleware);

albumRouter.post('/likeUnlikeComments',
AuthMiddleware().verifyToken,
AlbumValidator().validateLikeOnComment,
ErrorHandlerMiddleware(AlbumController().likeUnlikeComments),
ResponseMiddleware);

module.exports=albumRouter;
