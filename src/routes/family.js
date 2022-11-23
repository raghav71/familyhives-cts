const familyRouter = require('express').Router();
const FamilyController = require("../controllers/FamilyController");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const FamilyValidator = require("../validators/FamilyValidator");
const AuthMiddleware = require("../middlewares/AuthMiddleware");

familyRouter.post('/addFamilyMember',
  FamilyValidator().familyMemberValidator,
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(AuthMiddleware().validateFamilyMember),
  AuthMiddleware().checkFamilyMember,
  ErrorHandlerMiddleware(FamilyController().addFamilyMembers),
ResponseMiddleware);


familyRouter.get('/getAllFamilyMembers',
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(FamilyController().getFamilyMembers),
ResponseMiddleware);

familyRouter.get('/getFamilyMemberList',
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(FamilyController().getFamilyMemberList),
ResponseMiddleware);

familyRouter.patch('/changeMemberStatus',
  AuthMiddleware().verifyToken,
  FamilyValidator().familyMemberIdValidator,
  ErrorHandlerMiddleware(FamilyController().changeMemberStatus),
ResponseMiddleware);

familyRouter.post('/removeMember',
  AuthMiddleware().verifyToken,
  FamilyValidator().familyMemberIdValidator,
  ErrorHandlerMiddleware(FamilyController().removeMember),
ResponseMiddleware);

familyRouter.patch('/switchFamilyTree',
  AuthMiddleware().verifyToken,
  FamilyValidator().familyTreeValidator,
  ErrorHandlerMiddleware(FamilyController().switchFamilyTree),
ResponseMiddleware);

familyRouter.get('/getFamilyTree',
  AuthMiddleware().verifyToken,
  ErrorHandlerMiddleware(FamilyController().getFamilyTree),
ResponseMiddleware);

familyRouter.patch('/editFamilyTree',
  AuthMiddleware().verifyToken,
  FamilyValidator().updateFamilyTreeValidator,
  ErrorHandlerMiddleware(FamilyController().editFamilyTree),
ResponseMiddleware);

familyRouter.post('/removeFamilyTree',
  AuthMiddleware().verifyToken,
  FamilyValidator().familyTreeIdValidator,
  ErrorHandlerMiddleware(FamilyController().removeFamilyTree),
ResponseMiddleware);

familyRouter.put('/updateFamilyRelation',
  AuthMiddleware().verifyToken,
  FamilyValidator().updateRelationValidator,
  ErrorHandlerMiddleware(FamilyController().updateFamilyRelation),
ResponseMiddleware);

module.exports=familyRouter;
