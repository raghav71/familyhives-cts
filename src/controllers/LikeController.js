const AlbumController = require("../controllers/AlbumController");
const RecipeController = require("../controllers/RecipeController");
const KahaniController = require("../controllers/KahaniController");

module.exports = () => {

const getAllLikes = async (req, res, next) => {
    console.log("LikeController=>getAllLikes");
    let { id,type } = req.query;
    if(type=="memory"){
      AlbumController().getAllLikesOnMemory(req, res, next);
    }
    if(type=="travel"){
      AlbumController().getAllLikesOnMemory(req, res, next);
    }
    if(type=="recipe"){
      RecipeController().getAllLikesOnRecipe2(req, res, next);
    }
    if(type=="kahani"){
      KahaniController().getAllLikesOnKahani(req, res, next);
    }
  }


    return {
      getAllLikes
    }
}
