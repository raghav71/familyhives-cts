const twilioRouter = require('express').Router();
const TwilioController = require("../controllers/TwilioController")
const TwilioValidator = require("../validators/TwilioValidator")
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const AuthMiddleware = require("../middlewares/AuthMiddleware");

twilioRouter.get('/generateToken',
  AuthMiddleware().verifyToken,
  TwilioValidator().validateGenerateToken,
  ErrorHandlerMiddleware(TwilioController().generateToken),
ResponseMiddleware);

twilioRouter.get('/generateUserTwilioToken',
  AuthMiddleware().verifyToken,
  TwilioValidator().validateGenerateVirgilToken,
  ErrorHandlerMiddleware(TwilioController().generateUserTwilioToken),
ResponseMiddleware);

twilioRouter.get('/generateVirgilJwt',
  AuthMiddleware().verifyToken,
  TwilioValidator().validateGenerateVirgilToken,
  ErrorHandlerMiddleware(TwilioController().generateVirgilJwt),
ResponseMiddleware);

twilioRouter.post('/createGroup',
  AuthMiddleware().verifyToken,
  TwilioValidator().validateCreateGroup,
  ErrorHandlerMiddleware(TwilioController().createGroup),
ResponseMiddleware);

twilioRouter.patch('/updateGroupImage',
  AuthMiddleware().verifyToken,
  TwilioValidator().validateGroupImage,
  ErrorHandlerMiddleware(TwilioController().updateGroupImage),
ResponseMiddleware);

twilioRouter.get('/getGroupList',
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(TwilioController().getGroupList),
ResponseMiddleware);

twilioRouter.get('/getGroupDetails',
  AuthMiddleware().verifyToken,
  TwilioValidator().validateGroupId,
  ErrorHandlerMiddleware(TwilioController().getGroupDetails),
ResponseMiddleware);

twilioRouter.get('/getAllParticipants',
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(TwilioController().getAllParticipants),
ResponseMiddleware);

twilioRouter.post('/addIndividualMember',
  AuthMiddleware().verifyToken,
  TwilioValidator().validateIndividualMember,
  ErrorHandlerMiddleware(TwilioController().addIndividualMember),
ResponseMiddleware);

twilioRouter.get('/getAllIndividualChats',
  AuthMiddleware().verifyToken,
  TwilioValidator().validateGetIndividualChat,
  ErrorHandlerMiddleware(TwilioController().getAllIndividualChats),
ResponseMiddleware);

twilioRouter.post('/removeParticipants',
  AuthMiddleware().verifyToken,
  TwilioValidator().validateRemoveParticipants,
  ErrorHandlerMiddleware(TwilioController().removeParticipants),
ResponseMiddleware);

twilioRouter.patch('/blockParticipants',
  AuthMiddleware().verifyToken,
  TwilioValidator().validateParticipantsId,
  ErrorHandlerMiddleware(TwilioController().blockParticipants),
ResponseMiddleware);

twilioRouter.patch('/clearChatHistory',
  AuthMiddleware().verifyToken,
  TwilioValidator().validateChatHistory,
  ErrorHandlerMiddleware(TwilioController().clearChatHistory),
ResponseMiddleware);

twilioRouter.post('/removeChannel',
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(TwilioController().removeChannel),
ResponseMiddleware);

twilioRouter.patch('/blockUnblockParticipants',
  AuthMiddleware().verifyToken,
  TwilioValidator().validateChatId,
  ErrorHandlerMiddleware(TwilioController().blockUnblockParticipants),
ResponseMiddleware);

module.exports=twilioRouter;
