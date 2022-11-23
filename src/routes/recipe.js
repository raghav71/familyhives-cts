const recipeRouter = require('express').Router();
const RecipeController = require("../controllers/RecipeController");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const RecipeValidator = require("../validators/RecipeValidator");


recipeRouter.post('/addRecipe',
AuthMiddleware().verifyToken,
RecipeValidator().validateRecipe,
ErrorHandlerMiddleware(RecipeController().addRecipe),
ResponseMiddleware);

/*recipeRouter.post('/editRecipe/:id',
AuthMiddleware().verifyToken,
AuthMiddleware().validateUserForRecipe,
ErrorHandlerMiddleware(RecipeController().editRecipe),
ResponseMiddleware);*/

recipeRouter.post('/changeRecipePrivacy/:id',
AuthMiddleware().verifyToken,
AuthMiddleware().validateUserForRecipe,
RecipeValidator().validateRecipePrivacy,
ErrorHandlerMiddleware(RecipeController().changeRecipePrivacy),
ResponseMiddleware);

recipeRouter.get('/recipeList',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(RecipeController().recipeList),
ResponseMiddleware);


recipeRouter.get('/recipeCommentList',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(RecipeController().recipeCommentList),
ResponseMiddleware);

recipeRouter.post('/addCommentOnRecipe',
AuthMiddleware().verifyToken,
RecipeValidator().validateRecipeComment,
ErrorHandlerMiddleware(RecipeController().addCommentOnRecipe),
ResponseMiddleware);

recipeRouter.put('/updateCommentOnRecipe',
  AuthMiddleware().verifyToken,
  RecipeValidator().validateEditRecipeComment,
  ErrorHandlerMiddleware(RecipeController().updateCommentOnRecipe),
ResponseMiddleware);

recipeRouter.post('/deleteRecipeComments',
  AuthMiddleware().verifyToken,
  RecipeValidator().validateDeleteRecipeComment,
  ErrorHandlerMiddleware(RecipeController().deleteRecipeComments),
ResponseMiddleware);

recipeRouter.post('/likeRecipe',
AuthMiddleware().verifyToken,
RecipeValidator().validateRecipeLike,
ErrorHandlerMiddleware(RecipeController().likeRecipe),
ResponseMiddleware);

recipeRouter.post('/likeUnlikeComments',
AuthMiddleware().verifyToken,
RecipeValidator().validateLikeOnComment,
ErrorHandlerMiddleware(RecipeController().likeUnlikeComments),
ResponseMiddleware);

recipeRouter.get('/getAllLikesOnRecipe/:recipeId',
AuthMiddleware().verifyToken,
ErrorHandlerMiddleware(RecipeController().getAllLikesOnRecipe),
ResponseMiddleware);

recipeRouter.post('/deleteRecipe',
AuthMiddleware().verifyToken,
RecipeValidator().validateDeleteRecipe,
ErrorHandlerMiddleware(RecipeController().deleteRecipe),
ResponseMiddleware);

module.exports=recipeRouter;
