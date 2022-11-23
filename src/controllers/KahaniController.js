const Sequelize = require('sequelize');
const KahaniService = require("../services/KahaniServices");
const FeedService = require("../services/FeedServices");
const LikeService = require("../services/LikeServices");
const CommentService = require("../services/CommentServices");
const UserService = require("../services/UserService");
const helpers = require("../util/helpers");
const colors = require("colors");
var path = require('path');
module.exports = () => {
  const addKahani = async (req, res, next, transaction) => {
    console.log("KahaniController=>addKahani");
      let { userId, title ,description ,privacy,file,content_type,file_height,file_width,kahaniId,family_tree } = req.body;

      //let kahani = { userId, title ,description ,privacy,file,content_type,file_height,file_width,family_tree};
      let feed = { userId, title ,description,privacy,file,content_type ,file_height,file_width,family_tree,feed_type:"kahani"};
      if(kahaniId){
        //result = await KahaniService().editKahani(kahaniId,kahani, transaction);
        let update_feed_result = await FeedService().editFeed({id:kahaniId,feed_type:"kahani"},feed, transaction);
        req.msg = 'kahani_updated';
      }else{
      //  result = await KahaniService().addKahani(kahani, transaction);
        let feed_result = await FeedService().addFeed(feed, transaction);
        kahaniId = feed_result.id;
        req.msg = 'kahani_added';

        if(privacy=="family"){
          let title = "kahani_added_title";
          let msg = "kahani_added";

          let notification_result = helpers().sendNotificationToAllFamilyMembers(userId,family_tree,title,msg,req.authUser.name,"kahani",kahaniId);
        }
      }
      kahani = await FeedService().fetch(kahaniId,false, transaction);

      req.rData = { kahani };
      next();


    }

  const changeKahaniPrivacy = async (req, res, next, transaction) => {
      console.log("KahaniController=>changeKahaniPrivacy");
        let new_privacy = req.body.privacy;
        let userId = req.body.userId;

        let kahani = { privacy:new_privacy};
        let kahaniId  = req.params.id;
        result = await KahaniService().changeKahaniPrivacy(kahaniId,kahani, transaction);
        let update_feed_result = await FeedService().editFeed({id:kahaniId,feed_type:"kahani"},kahani, transaction);
        //console.log(result);
        kahani = await getFeedDetails(kahaniId,userId,"kahani",transaction);

        //kahani = {id,title ,description ,privacy,file,file_width,file_height,kahani_type,total_like,total_unlike,total_comment,created_by,like_type,isLiked,isCommented,my_liked_type};
        req.rData = { kahani };
        req.msg = 'kahani_privacy_changed';
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

  const kahaniList = async (req, res, next, transaction) => {
        console.log("KahaniController=>kahaniList");
          let { search,page ,limit ,upload_type } = req.query;
          let { userId ,family_tree } = req.body;

          let filters = { search,family_tree, page, limit,feed_type:"kahani" };
          if (upload_type==2)filters.userId=userId
          let feed_list = await FeedService().feedList(filters,transaction);
          //kahani = await KahaniService().kahaniList(filters,transaction);
          let total = feed_list.count;
          let data = feed_list.rows;
          if(data && data.length>0)
            kahani =await fetchKahaniData(data,userId,"kahani",transaction);
          else
            kahani =[];
          req.rData = { total, page, limit, kahani };
          req.msg = 'kahani_list';
          next();


        }

  const deleteKahani = async (req, res, next, transaction) => {
            console.log("KahaniController => deleteKahani");
            let { userId,kahaniId } = req.body;
            let query = { id:kahaniId,userId };
            let kahani = await FeedService().fetchByQuery({id:kahaniId,userId,feed_type:"kahani"}, transaction);
            if(kahani!=null){
              let update_feed_result = await FeedService().deleteFeed({id:kahaniId}, transaction);

              req.msg = 'kahani_deleted';
            }else {
              req.msg = 'unauthorized';

            }
            next();


        }

  const kahaniCommentList = async (req, res, next, transaction) => {
    console.log("KahaniController=>kahaniCommentList");
      let { kahaniId,page ,limit  } = req.query;
      let { userId  } = req.body;

      let filters = { feed_id:kahaniId,page ,limit };
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

  const fetchKahaniData = (data,user_id,feed_type,transaction) => {
        let kahaniData = []
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
              kahaniData.push({id,title,feed_type ,description,file,file_width,file_height,content_type,privacy,total_like,total_unlike,total_comment,created_by,like_type,isLiked,isCommented,my_liked_type});

              if(i==data.length-1)
              resolve(kahaniData);
            });

          })
      }

  const addCommentOnKahani = async (req, res, next, transaction) => {
      console.log("KahaniController=>addCommentOnKahani");
        let { kahaniId,userId, commentType ,message ,image,video } = req.body;

        let kahaniComments = { feed_id:kahaniId,userId, commentType ,message ,image ,video};
        let result = await CommentService().comment(kahaniComments, transaction);
        let update_feed_result = await FeedService().editFeed({id:kahaniId},{ total_comment:Sequelize.literal('total_comment + 1'),lastCommentAt:Sequelize.fn('NOW')}, transaction);

        let kahani_comments = await CommentService().fetch(result.id, transaction);

        let kahani_details = await FeedService().fetch(kahaniId,false, transaction);



        if(kahani_details.userId!=userId){
          let kahani_user_details = await UserService().fetch(kahani_details.userId, transaction);
            if(kahani_user_details){

              if(kahani_user_details.notification_permission=="allow"){

                let title = "comment_on_kahani_title";
                let msg = "comment_on_kahani";
                let data = {title,body:msg,type:"kahani"}

                let notification_result = helpers().sendNotification(kahani_user_details.device_token,kahani_user_details.device_type,title,msg,req.authUser.name,"kahani",kahaniId,kahani_user_details.id,kahani_user_details.language)
                }
            }
          }
        let id=kahani_comments.id;
        let commented_by=kahani_comments.commented_by;
        let createdAt=kahani_comments.createdAt;
        commentType=kahani_comments.commentType;
        message=kahani_comments.message;
        image=kahani_comments.image;
        video=kahani_comments.video;
        message=kahani_comments.message;
        req.rData = { id, commented_by,createdAt, commentType ,message ,image,video};
        req.msg = 'kahani_comments_added';
        next();


      }

  const updateCommentOnKahani = async (req, res, next, transaction) => {
      console.log("KahaniController=>editCommentOnKahani");
      console.log(req.body);
        let { commentId, commentType ,message ,image,video,userId } = req.body;
        let kahaniComments = { commentType ,message ,image ,video};
        let result = await CommentService().editComment({id:commentId},kahaniComments, transaction);

        let data = await CommentService().fetch(commentId, transaction);
        data =[data];
        let comments = await fetchLikeOnCommentData(data,userId, transaction)
        comments = comments[0];
        req.rData = { comments};
        req.msg = 'kahani_comments_updated';
        next();


    }

  const deleteKahaniComments = async (req, res, next, transaction) => {
      console.log("KahaniController=>deleteKahaniComments");
        let { commentId, userId } = req.body;
        console.log('commentId');
        console.log(commentId);
        let query = {userId,id:commentId}
        let data = await CommentService().fetch(commentId, transaction);
        result = await CommentService().deleteComment(query, transaction);
        let update_feed_result = await FeedService().editFeed({id:data.feed_id},{ total_comment:Sequelize.literal('total_comment - 1')}, transaction);

        req.msg = 'kahani_comments_deleted';
        next();
}


  const likeKahani = async (req, res, next, transaction) => {
      console.log("KahaniController=>likeKahani");
        let { kahaniId,userId, like_type, isLiked } = req.body;
        let likeKahani = { feed_id:kahaniId,userId, like_type, isLiked };
        if(isLiked=='0') likeKahani.like_type = '';
        console.log("likeKahani");
        console.log(likeKahani);
        let userLikeOnKahani = await LikeService().fetchByQuery({feed_id:kahaniId,userId},transaction);
        let kahani = await FeedService().fetch(kahaniId,true,transaction);
        if(userLikeOnKahani){
          result = await LikeService().editLike({id:userLikeOnKahani.id},likeKahani, transaction);
          //result = await KahaniService().updateKahaniLike(userLikeOnKahani.id,likeKahani, transaction);
          req.msg = 'like_updated_on_kahani';
        }else{
          result = await LikeService().like(likeKahani, transaction);
          if(kahani.userId!=userId){
            let kahani_user_details = await UserService().fetch(kahani.userId, transaction);
              if(kahani_user_details){

                if(kahani_user_details.notification_permission=="allow"){
                  let title = "like_on_kahani_title";
                  let msg = "like_on_kahani";

                  let notification_result = helpers().sendNotification(kahani_user_details.device_token,kahani_user_details.device_type,title,msg,req.authUser.name,"kahani",kahaniId,kahani_user_details.id,kahani_user_details.language)
                  }
              }
            }
          req.msg = 'kahani_like_added';
        }
        //kahani = await FeedService().fetch(kahaniId,true,transaction);
        //kahani = await KahaniService().fetch(kahaniId,true,transaction);
        let { id,title ,description ,privacy,file,file_width,file_height,content_type ,created_by } = kahani;
        let total_like = await LikeService().countLike({feed_id:id},transaction);
        let total_unlike = await LikeService().countDisLike({feed_id:id},transaction);
        let total_comment = await CommentService().countComment({feed_id:id},transaction);
        userLikeOnKahani = await LikeService().fetchByQuery({feed_id:id,userId},transaction);
        let userCommentsOnKahani = await CommentService().fetchByQuery({feed_id:id,userId},transaction);

        let kahaniLikes = await LikeService().getAllLikes({feed_id:id},transaction);
        kahaniLikes = kahaniLikes.rows;
         like_type = await kahaniLikes?kahaniLikes.map(a => a.like_type):[];
        like_type=like_type.filter(onlyUnique);
        let feed_data = { total_like:Number(total_like),total_unlike:Number(total_unlike),like_type:like_type.toString()};
        console.log("feed_data");
        console.log(feed_data);
        let update_feed_result = await FeedService().editFeed({id},feed_data, transaction);

        let my_liked_type = userLikeOnKahani?userLikeOnKahani.like_type:'';
         isLiked = userLikeOnKahani?userLikeOnKahani.isLiked=='1'?true:false:false;
        let isCommented = userCommentsOnKahani?true:false;
        kahani = {id,title ,description ,privacy,file,file_width,file_height,content_type,total_like,total_unlike,total_comment,created_by,like_type,isLiked,isCommented,my_liked_type};
        req.rData = { kahani };
        next();


      }

  const likeUnlikeComments = async (req, res, next, transaction) => {
      console.log("KahaniController=>likeUnlikeComments");
        let { commentId,userId, like_type,isLiked } = req.body;
        let likeOnComment = { commentId,userId, like_type,isLiked };
        if(isLiked=='0') likeOnComment.like_type = null;
        let my_liked_type = likeOnComment.like_type;
        let UserLikesOnComment = await CommentService().fetchLikeOnComment({commentId,userId}, transaction);
        //let UserLikesOnComment = await KahaniService().fetchUserLikeOnKahaniComment(commentId,userId);
        if(UserLikesOnComment){
          result = await CommentService().editLikeOnComment({id:UserLikesOnComment.id},likeOnComment, transaction);
          //result = await KahaniService().updateCommentLike(UserLikesOnComment.id,likeOnComment, transaction);
          req.msg = 'like_on_comment_change';
        }else{
          result = await CommentService().addLikeOncomment(likeOnComment, transaction);
          //result = await KahaniService().likeOnComment(likeOnComment, transaction);
          //console.log(result);
          req.msg = 'like_added_on_comment';

        }
        comments = await CommentService().fetch(commentId, transaction);
        let {commentType,message,image,video,createdAt,commented_by} = comments;
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



  const getAllLikesOnKahani = async (req, res, next, transaction) => {
    console.log("KahaniController=>getAllLikesOnKahani");
    let { id } = req.query;
    let allLikes = await LikeService().getAllLikes({feed_id:id},transaction);
    //let allLikes = await KahaniService().getAllLikesOnKahani(id,transaction);
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
          let { id,userId ,kahaniId,like_type ,userDetails} = item;

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
      addKahani,
      kahaniList,
      fetchKahaniData,
      deleteKahani,
      changeKahaniPrivacy,
      addCommentOnKahani,
      updateCommentOnKahani,
      deleteKahaniComments,
      likeKahani,
      kahaniCommentList,
      likeUnlikeComments,
      getAllLikesOnKahani
    }
}
