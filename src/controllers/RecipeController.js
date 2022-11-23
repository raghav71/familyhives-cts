const Sequelize = require('sequelize');
const RecipeService = require("../services/RecipeServices");
const FeedService = require("../services/FeedServices");
const LikeService = require("../services/LikeServices");
const CommentService = require("../services/CommentServices");
const UserService = require("../services/UserService");
const FamilyService = require("../services/FamilyService");
const helpers = require("../util/helpers");
const colors = require("colors");
var path = require('path');
module.exports = () => {
  const addRecipe = async (req, res, next, transaction) => {
    console.log("RecipeController=>addRecipe");
      let { userId,family_tree, title ,description ,privacy,file,recipe_id,content_type,file_width,file_height } = req.body;

      let feed = { userId, title ,description ,privacy,file,family_tree,feed_type:"recipe",content_type,file_width,file_height};
      if(recipe_id){
        let update_feed_result = await FeedService().editFeed({id:recipe_id,feed_type:"recipe"},feed, transaction);
        req.msg = 'recipe_updated';
      }else{
        let feed_result = await FeedService().addFeed(feed, transaction);
        recipe_id = feed_result.id;
        req.msg = 'recipe_added';
        if(privacy=="family"){
          let title = "recipe_added_title";
          let msg = "recipe_added";

          let notification_result = helpers().sendNotificationToAllFamilyMembers(userId,family_tree,title,msg,req.authUser.name,"recipe",recipe_id)
        }
      }
      recipe = await getFeedDetails(recipe_id,userId,"recipe",transaction)

      req.rData = { recipe };
      next();


    }

  const changeRecipePrivacy = async (req, res, next, transaction) => {
      console.log("RecipeController=>changeRecipePrivacy");
        let new_privacy = req.body.privacy;
        let userId = req.body.userId;
        let recipe = { privacy:new_privacy};
        let recipeId  = req.params.id;
        let update_feed_result = await FeedService().editFeed({id:recipeId,feed_type:"recipe"},recipe, transaction);
        recipe = await getFeedDetails(recipeId,userId,"recipe",transaction);
        req.rData = { recipe };
        req.msg = 'recipe_privacy_changed';
        next();

}

  const getFeedDetails = (id,user_id,feed_type,transaction)=>{
    return new Promise(async function(resolve, reject){
    let feed = await FeedService().fetchByQuery({id,feed_type}, transaction);
    let { userId,family_tree,title ,description,file,file_width,file_height,content_type,privacy,total_like,total_unlike,total_comment,like_type,created_by } = feed;
    like_type = like_type?like_type.split(","):[];
    let query = {userId:user_id,feed_id:id};
    let userLike = await LikeService().fetchByQuery(query,transaction);
    let userComments = await CommentService().fetchByQuery(query,transaction);

    let my_liked_type = userLike?userLike.like_type:'';
    let isLiked = userLike?true:false;
    let isCommented = userComments?true:false;
    let result = {id,title,feed_type ,description,file,file_width,file_height,content_type,privacy,total_like,total_unlike,total_comment,created_by,like_type,isLiked,isCommented,my_liked_type};
    resolve(result);
  });
  }

  const recipeList = async (req, res, next, transaction) => {
        console.log("RecipeController=>recipeList");
          let { search,page ,limit,upload_type  } = req.query;
          let { userId ,family_tree } = req.body;

          let filters = { search,family_tree, page, limit,feed_type:"recipe" };
          if (upload_type==2)filters.userId=userId;
          else filters.privacy="family";
          let feed_list = await FeedService().feedList(filters,transaction);

          //recipe = await RecipeService().recipeList(filters,transaction);
          let total = feed_list.count;
          let data = feed_list.rows;
          if(data && data.length>0)
            recipe =await fetchRecipeData(data,userId,"recipe",transaction);
          else
            recipe =[];
          req.rData = { total, page, limit, recipe };
          req.msg = 'recipe_list';
          next();


        }

  const deleteRecipe = async (req, res, next, transaction) => {
      console.log("RecipeController=>deleteRecipe");
        let { recipeId, userId } = req.body;
        console.log('recipeId');
        console.log(recipeId);
        let recipe = await FeedService().fetchByQuery({id:recipeId,userId,feed_type:"recipe"}, transaction);
        if(recipe!=null){
          //result = await RecipeService().deleteRecipe(query, transaction);
          let delete_result = await FeedService().deleteFeed({id:recipeId}, transaction);

          req.msg = 'recipe_deleted';
        }else {
          req.msg = 'unauthorized';
        }
        next();


    }

  const recipeCommentList = async (req, res, next, transaction) => {
    console.log("RecipeController=>recipeCommentList");
    let { recipeId,page ,limit  } = req.query;
    let { userId  } = req.body;

    let filters = { feed_id:recipeId,page ,limit };
    let comments = await CommentService().commentList(filters);
    let total = comments?comments.count:0;
    let data = comments.rows;
    if(data && data.length>0) comments =await fetchLikeOnCommentData(data,userId, transaction);
    else comments =[];
    req.rData = { total, page, limit, comments };
    req.msg = 'comment_list';
    next();


  }

  const fetchLikeOnCommentData = (data,userId, transaction) => {
    let commentData = []
      return new Promise(function(resolve, reject){
        data.forEach(async (item, i) => {

          let {id,commentType,message,image,video,total_like,total_unlike,like_type,createdAt,commented_by} = item;
          like_type = like_type?like_type.split(","):[];
          created_at_date = await changeDateFormat(createdAt,"-");
          let userLikeOnRecipeComment = await CommentService().fetchLikeOnComment({commentId:id,userId});


          let my_liked_type = userLikeOnRecipeComment?userLikeOnRecipeComment.like_type:'';
          let isLiked = userLikeOnRecipeComment?userLikeOnRecipeComment.isLiked:'';
          commentData.push({id,commentType,message,image,video,commented_by,created_at_date,createdAt,total_like,total_unlike,like_type,isLiked,my_liked_type});

          if(i==data.length-1)
          resolve(commentData);
        });

      })
  }

  const fetchRecipeData = (data,user_id,feed_type,transaction) => {
        let recipeData = []
          return new Promise(function(resolve, reject){
            data.forEach(async (item, i) => {
              let { id,userId,title ,description,file,file_width,file_height,content_type,privacy,total_like,total_unlike,total_comment,like_type,created_by } = item;

              like_type = like_type?like_type.split(","):[];
              let query = {userId:user_id,feed_id:id};
              let userLike = await LikeService().fetchByQuery(query,transaction);
              let userComments = await CommentService().fetchByQuery(query,transaction);

              let my_liked_type = userLike?userLike.like_type:'';

              let isLiked = userLike?userLike.isLiked=='1'?true:false:false;
              let isCommented = userComments?true:false;
              recipeData.push({id,title,feed_type ,description,file,file_width,file_height,content_type,privacy,total_like,total_unlike,total_comment,created_by,like_type,isLiked,isCommented,my_liked_type});

              if(i==data.length-1)
              resolve(recipeData);
            });

          })
      }

  const addCommentOnRecipe = async (req, res, next, transaction) => {
      console.log("RecipeController=>addCommentOnRecipe");
        let { recipeId,userId, commentType ,message ,image,video } = req.body;

        let recipeComments = { feed_id:recipeId,userId, commentType ,message ,image ,video};
        result = await CommentService().comment(recipeComments, transaction);
        let update_feed_result = await FeedService().editFeed({id:recipeId,feed_type:"recipe"},{ total_comment:Sequelize.literal('total_comment + 1'),lastCommentAt:Sequelize.fn('NOW')}, transaction);

        let recipe_comments = await CommentService().fetch(result.id, transaction);

        let recipe = await FeedService().fetch(recipeId,false, transaction);
        if(recipe.userId!=userId){
          let recipe_user_details = await UserService().fetch(recipe.userId, transaction);
            if(recipe_user_details){

              if(recipe_user_details.notification_permission=="allow"){
                let title = "comment_on_recipe_title";
                let msg = "comment_on_recipe";

                let notification_result = helpers().sendNotification(recipe_user_details.device_token,recipe_user_details.device_type,title,msg,req.authUser.name,"recipe",recipeId,recipe_user_details.id,recipe_user_details.language)

              }
            }
          }
        let id=recipe_comments.id;
        let commented_by=recipe_comments.commented_by;
        let createdAt=recipe_comments.createdAt;
        commentType=recipe_comments.commentType;
        message=recipe_comments.message;
        image=recipe_comments.image;
        video=recipe_comments.video;
        message=recipe_comments.message;
        req.rData = { id, commented_by,createdAt, commentType ,message ,image,video};
        req.msg = 'recipe_comments_added';
        next();


      }

  const updateCommentOnRecipe = async (req, res, next, transaction) => {
      console.log("RecipeController=>editCommentOnRecipe");
      console.log(req.body);
        let { commentId, commentType ,message ,image,video,userId } = req.body;
        let recipeComments = { commentType ,message ,image ,video};
        let result = await CommentService().editComment({id:commentId},recipeComments, transaction);

        let data = await CommentService().fetch(commentId, transaction);
        data =[data];

        let comments = await fetchLikeOnCommentData(data,userId, transaction)
        comments = comments[0];
        req.rData = { comments};
        req.msg = 'recipe_comments_updated';
        next();


    }

  const deleteRecipeComments = async (req, res, next, transaction) => {
      console.log("RecipeController=>deleteRecipeComments");
        let { commentId, userId } = req.body;

        let query = {userId,id:commentId}
        let data = await CommentService().fetch(commentId, transaction);
        result = await CommentService().deleteComment(query, transaction);
        let update_feed_result = await FeedService().editFeed({id:data.feed_id,feed_type:"recipe"},{ total_comment:Sequelize.literal('total_comment - 1')}, transaction);

        req.msg = 'recipe_comments_deleted';
        next();


    }

  const likeRecipe = async (req, res, next, transaction) => {
      console.log("RecipeController=>likeRecipe");
        let { recipeId,userId, like_type, isLiked } = req.body;
        let likeRecipe = { feed_id:recipeId,userId, like_type, isLiked };
        //let likefeed = {   total_like:Sequelize.literal('total_like + 1') };
        if(isLiked=='0') likeRecipe.like_type = '';


        let userLikeOnRecipe = await LikeService().fetchByQuery({feed_id:recipeId,userId},transaction);
        let recipe = await FeedService().fetch(recipeId,true,transaction);
        if(userLikeOnRecipe){
          result = await LikeService().editLike({id:userLikeOnRecipe.id},likeRecipe, transaction);
          req.msg = 'like_updated_on_recipe';
        }else{
          result = await LikeService().like(likeRecipe, transaction);
          if(recipe.userId!=userId){
            let recipe_user_details = await UserService().fetch(recipe.userId, transaction);
              if(recipe_user_details){

                if(recipe_user_details.notification_permission=="allow"){
                  let title = "like_on_recipe_title";
                  let msg = "like_on_recipe";
                  let data = {title,body:msg,type:"recipe"}

                  let notification_result = helpers().sendNotification(recipe_user_details.device_token,recipe_user_details.device_type,title,msg,req.authUser.name,"recipe",recipeId,recipe_user_details.id,recipe_user_details.language)
                  }
              }
            }
          req.msg = 'recipe_like_added';
        }
        //recipe = await FeedService().fetch(recipeId,true,transaction);
        let { id,title ,description,file,privacy ,created_by } = recipe;
        let total_like = await LikeService().countLike({feed_id:recipeId},transaction);
        let total_unlike = await LikeService().countDisLike({feed_id:recipeId},transaction);

        let total_comment = await CommentService().countComment({feed_id:recipeId},transaction);
        let allLikes = await LikeService().getAllLikes({feed_id:recipeId},transaction);
        allLikes = allLikes.rows;
        //created_by=userDetails;
        userLikeOnRecipe = await LikeService().fetchByQuery({feed_id:recipeId,userId},transaction);
        let userCommentsOnRecipe = await CommentService().fetchByQuery({feed_id:recipeId,userId},transaction);

        let all_like_type = await allLikes?allLikes.map(a => a.like_type):[];
        all_like_type=all_like_type.filter(onlyUnique);
        let feed_data = { total_like:Number(total_like),total_unlike:Number(total_unlike),like_type:all_like_type.toString()};

        console.log(feed_data);
        let update_feed_result = await FeedService().editFeed({id:recipeId},feed_data, transaction);
        let my_liked_type = userLikeOnRecipe?userLikeOnRecipe.like_type:'';
         isLiked = userLikeOnRecipe?userLikeOnRecipe.isLiked=='1'?true:false:false;
        let isCommented = userCommentsOnRecipe?true:false;
        recipe = {id,title ,description,file,privacy,total_like,total_unlike,total_comment,created_by,like_type:all_like_type,isLiked,isCommented,my_liked_type};

        req.rData = { recipe };
        next();


      }

  const likeUnlikeComments = async (req, res, next, transaction) => {
      console.log("RecipeController=>likeUnlikeComments");
        let { commentId,userId, like_type,isLiked } = req.body;
        let likeOnComment = { commentId,userId, like_type,isLiked };
        if(isLiked=='0')
          likeOnComment.like_type = null;
        let my_liked_type = likeOnComment.like_type;
        let UserLikesOnComment = await CommentService().fetchLikeOnComment({commentId,userId}, transaction);
        if(UserLikesOnComment){
          result = await CommentService().editLikeOnComment({id:UserLikesOnComment.id},likeOnComment, transaction);
          req.msg = 'like_on_comment_change';
        }else{
          result = await CommentService().addLikeOncomment(likeOnComment, transaction);
          //console.log(result);
          req.msg = 'like_added_on_comment';

        }
        comments = await CommentService().fetch(commentId, transaction);
        let {commentType,message,image,video,createdAt,commented_by,userDetails} = comments;
        let total_like = await CommentService().countLikesOnComments(commentId,transaction);
        let total_unlike = await CommentService().countUnLikesOnComments(commentId,transaction);
        let likeDetails = await CommentService().getAllLikesOnComments(commentId,transaction);
        //let newdata = await RecipeService().fetchUserLikeOnRecipeComment(commentId,userId);

        isLiked = isLiked!="1"?false:true;
        like_type = await likeDetails?likeDetails.map(a => a.like_type):[];
        like_type=like_type.filter(onlyUnique);
        let update_result = await CommentService().editComment({id:commentId},{total_like,total_unlike,like_type:like_type.toString()}, transaction);

        req.rData = { commentType,message,image,video,commented_by,total_like,total_unlike ,createdAt,isLiked,like_type,my_liked_type};
        next();

      }

  const getAllLikesOnRecipe = async (req, res, next, transaction) => {
    console.log("RecipeController=>getAllLikesOnRecipe");
    let { recipeId } = req.params;
    let allLikes = await LikeService().getAllLikes({feed_id:recipeId},transaction);
    let total_like = allLikes.count;
    let data = allLikes.rows;
    console.log("total_like");
    console.log(total_like);
    console.log(data);
    if(total_like>0){
      allLikes = await countLikes(data);
      let {likeData,likeType} = allLikes
      req.rData={likeData,likeType};
    }else {
      let likeType = {"like":0,"laugh":0,"blessing":0,"namaste":0,"love":0};
      let likeData=[];
      req.rData={likeData,likeType};
    }
    req.msg = 'like_list';
    next();
  }

  const getAllLikesOnRecipe2 = async (req, res, next, transaction) => {
    console.log("RecipeController=>getAllLikesOnRecipe2");
    let { id } = req.query;
    let allLikes = await LikeService().getAllLikes({feed_id:id},transaction);
    let total_like = allLikes.count;
    let data = allLikes.rows;
    if(total_like>0){
      allLikes = await countLikes(data);
      let {likeData,likeType} = allLikes
      req.rData={likeData,likeType};
    }else {
      let likeType = {"like":0,"laugh":0,"blessing":0,"namaste":0,"love":0};
      let likeData=[];
      req.rData={likeData,likeType};
    }
    req.msg = 'like_list';
    next();
  }

  const countLikes = (data) => {
    let likeData = []
    let likeTypeArray = []
    let likeType = {"like":0,"laugh":0,"blessing":0,"namaste":0,"love":0};

      return new Promise(function(resolve, reject){
        data.forEach(async (item, i) => {
          let { id,userId ,recipeId,like_type ,userDetails} = item;

          if(like_type){
            let { name,email,mobile,image} = userDetails;
            if(!likeType[like_type])
              likeType[like_type] = 1
            else
              likeType[like_type] = likeType[like_type]+1;


            likeType = Object.assign({}, likeType);

            likeData.push({like_type,userId,name,email,mobile,image});
          }
          if(i==data.length-1){
            let data={likeData,likeType};
            resolve(data);
          }
        });

      })
  }

  const onlyUnique = (value, index, self)=>{
     return self.indexOf(value) === index;
  }

  const formatMonth = (month)=>{
    if(month<10) month = "0"+month;
     return month;
  }

  const changeDateFormat = (dateString,connectors)=>{
    var date = new Date(dateString);
    return date.getDate() + connectors + formatMonth(date.getMonth()+1) + connectors + date.getFullYear() + " | " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  }
return {
      addRecipe,
      recipeList,
      fetchRecipeData,
      deleteRecipe,
      changeRecipePrivacy,
      addCommentOnRecipe,
      updateCommentOnRecipe,
      deleteRecipeComments,
      likeRecipe,
      recipeCommentList,
      likeUnlikeComments,
      getAllLikesOnRecipe,
      getAllLikesOnRecipe2
    }
}
