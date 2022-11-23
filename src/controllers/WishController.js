const { Op } = require("sequelize");
const Sequelize = require('sequelize');
const WishService = require("../services/WishService");
const helpers = require("../util/helpers");
const UserService = require("../services/UserService");
const FamilyService = require("../services/FamilyService");
const LikeService = require("../services/LikeServices");
const CommentService = require("../services/CommentServices");

module.exports = () => {
  const sendWish = async (req, res, next, transaction) => {
    console.log("WishController => add");
    let { partnerId,message,type,image,userId,wishId } = req.body;

    let wish_data = {userId,partnerId,type,image,message};

    if(!wishId){
      let result = await WishService().add(wish_data, transaction);

      let partner_details = await UserService().fetch(partnerId, transaction);
      if(partner_details){

        if(partner_details.notification_permission=="allow"){
          let title = "wish_title";
          let msg = "wish_message";

          let notification_result = helpers().sendNotification(partner_details.device_token,partner_details.device_type,title,msg,req.authUser.name,"wish",null,partner_details.id,partner_details.language,message)
          }
      }
      wishId = result.id;
      msg = "wish_added";
    }else {
      result = await WishService().update(wishId,wish_data, transaction);
      msg = "wish_updated";
    }
    wish = await WishService().fetch(wishId,transaction);

    req.rData = { wish };
    req.msg = msg;

    next();
}

const deleteWish = async (req, res, next, transaction) => {
  console.log("WishController => delete");
  let { userId,wishId } = req.body;

  let query = {userId,id:wishId};
  let result = await WishService().deleteWish(query, transaction);
  req.msg = "wish_deleted";
  next();
}


const wishList = async (req, res, next, transaction) => {
  console.log("WishController=>wishList");
    let { partnerId,page ,limit,type  } = req.query;
    let { userId  } = req.body;

    let filters = { userId,partnerId,page ,limit,type } ;

    data = await WishService().getList(filters,transaction);

    let total = data.count;
    let wish = data.rows;
    req.rData = { total,type, page, limit, wish };
    req.msg = 'wish_list';
    next();


  }

   const getUserForWish = async (req, res, next, transaction) => {
     console.log("WishController=>getUserForWish");
    let { date  } = req.query;
    let { userId,family_tree  } = req.body;
    let family_member = await FamilyService().fetchMemberByQuery({family_tree,added_by:"manual",registered_id:{[Op.ne]: null}}, transaction);
    let user_ids = await family_member.length>0?family_member.map(a=>a.registered_id):[];
    console.log("user_ids");
    console.log(user_ids);
    if(!date) date = await getTodayDate('1','','');
    let dates = date.split("-");
    const index = user_ids.indexOf(userId);
    if (index > -1) {
      user_ids.splice(index, 1);
    }
    let birthday_users = await WishService().getAllBirthdayUser(dates[2],dates[1],user_ids,transaction);
    if(birthday_users.length>0) birthday_users = await getAllUsers(birthday_users,userId,family_tree,"1", transaction);

    let aniversary_users = await WishService().getAllAniversaryUser(dates[2],dates[1],user_ids,transaction);
    if(aniversary_users.length>0) aniversary_users = await getAllUsers(aniversary_users,userId,family_tree,"2", transaction);

    let users = await birthday_users.concat(aniversary_users);
    //if(users.length>0) users = await getAllUsers(users,userId,family_tree, transaction);
    req.rData = {date, users };
    req.msg = 'user_list';
    next();


  }

  const getAllUsers =(data,userId, family_tree,type,transaction) => {
      console.log('WishController=>getAllUsers');
      let user_data = [];
        return new Promise( async function(resolve, reject){
          let year = await getTodayDate('','','1');
          data.forEach(async (item, i) => {
            let {id,name,email,mobile,countryCode,gender,dob,aniversary,image} = item;

            let member_details = await FamilyService().fetchSpouse({registered_id:id,status:true,family_tree,added_by:"manual"}, transaction);
            let spouseId = member_details.spouseId;
            let memberId = member_details.id;
            let spouse_query = {spouseId:memberId,status:true,family_tree,added_by:"manual"}
            if(spouseId) spouse_query = {id:spouseId,status:true,family_tree,added_by:"manual"}
            let spouseDetails = await FamilyService().fetchSpouse(spouse_query, transaction);
          //  item.spouse_details = await spouse_details;
            let wished_data = await WishService().checkWishedUser(userId,id,year,type, transaction);

            if(wished_data.length==0 && userId!=id)
              user_data.push({id,name,email,mobile,countryCode,gender,dob,aniversary,image,type,spouseDetails});
            if(i==data.length-1) resolve(user_data);
          });

        })
    }

  const getTodayDate =(onlyDate,onlyDateMonth,OnlyYear)=>{
          var today = new Date();
          var dd = String(today.getDate()).padStart(2, '0');
          var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
          var yyyy = today.getFullYear();

          if(onlyDate!='')
            return yyyy + '-' + mm + '-' + dd;
          if(onlyDateMonth!='')
            return  dd+'-'+mm;
          if(OnlyYear!='')
            return  yyyy;
  }


  const likeWishMessage = async (req, res, next, transaction) => {
      console.log("WishController=>likeWishMessage");
        let { wish_id,userId, like_type, isLiked } = req.body;
        let likeWish = { wish_id,userId, like_type, isLiked };
        if(isLiked=='0') likeWish.like_type = '';


        let userLikeOnWish = await LikeService().fetchByQuery({wish_id,userId},transaction);
        let wish = await WishService().fetch(wish_id,transaction);
        if(userLikeOnWish){
          result = await LikeService().editLike({id:userLikeOnWish.id},likeWish, transaction);
          req.msg = 'like_updated_on_wish';
        }else{
          result = await LikeService().like(likeWish, transaction);
          if(wish.userId!=userId){
            let wish_user_details = await UserService().fetch(wish.userId, transaction);
              if(wish_user_details){

                if(wish_user_details.notification_permission=="allow"){
                  let title = "like_on_wish_title";
                  let msg = "like_on_wish";
                  let data = {title,body:msg,type:"wish"}

                  let notification_result = helpers().sendNotification(wish_user_details.device_token,wish_user_details.device_type,title,msg,req.authUser.name,"wish",wish.id,wish_user_details.id,wish_user_details.language)
                  }
              }
            }
          req.msg = 'wish_like_added';
        }
        //wish = await FeedService().fetch(wishId,true,transaction);
        let { id,partnerId,message,type,image } = wish;
        let total_like = await LikeService().countLike({wish_id},transaction);
        let total_unlike = await LikeService().countDisLike({wish_id},transaction);
        let total_comment = await CommentService().countComment({wish_id},transaction);
        let allLikes = await LikeService().getAllLikes({wish_id},transaction);
        allLikes = allLikes.rows;
        //created_by=userDetails;
        userLikeOnWish = await LikeService().fetchByQuery({wish_id,userId},transaction);
        let userCommentsOnWish = await CommentService().fetchByQuery({wish_id,userId},transaction);

        let all_like_type = await allLikes?allLikes.map(a => a.like_type):[];
        all_like_type=all_like_type.filter(onlyUnique);
        let wish_data = { total_like:Number(total_like),total_unlike:Number(total_unlike),like_type:all_like_type.toString()};

        console.log(wish_data);
        let update_feed_result = await WishService().update(wish_id,wish_data, transaction);
        let my_liked_type = userLikeOnWish?userLikeOnWish.like_type:'';
         isLiked = userLikeOnWish?userLikeOnWish.isLiked=='1'?true:false:false;
        let isCommented = userCommentsOnWish?true:false;
        wish = {id,partnerId,message,type,image,total_like,total_unlike,total_comment,like_type:all_like_type,isLiked,isCommented,my_liked_type};

        req.rData = { wish };
        next();
      }

  const addCommentOnWish = async (req, res, next, transaction) => {
      console.log("WishController=>addCommentOnWish");
        let { wish_id,userId, commentType ,message ,image,video,commentId } = req.body;

        let wishComments = { wish_id,userId, commentType ,message ,image ,video};
        if(commentId){
          let result = await CommentService().editComment({id:commentId},wishComments, transaction);
          req.msg = 'wish_comments_updated';

        }else {
          let result = await CommentService().comment(wishComments, transaction);
          commentId = result.id;
          let wish = await WishService().fetch(wish_id, transaction);
          if(wish.userId!=userId){
            let wish_user_details = await UserService().fetch(wish.userId, transaction);
              if(wish_user_details){

                if(wish_user_details.notification_permission=="allow"){
                  let title = "comment_on_wish_title";
                  let msg = "comment_on_wish";

                  let notification_result = helpers().sendNotification(wish_user_details.device_token,wish_user_details.device_type,title,msg,req.authUser.name,"wish",wish_id,wish_user_details.id,wish_user_details.language)

                }
              }
            }
          let update_feed_result = await WishService().update(wish_id,{ total_comment:Sequelize.literal('total_comment + 1'),lastCommentAt:Sequelize.fn('NOW')}, transaction);
          req.msg = 'wish_comments_added';
        }

        let wish_comments = await CommentService().fetch(commentId, transaction);


        let id=wish_comments.id;
        let commented_by=wish_comments.commented_by;
        let createdAt=wish_comments.createdAt;
        commentType=wish_comments.commentType;
        message=wish_comments.message;
        image=wish_comments.image;
        video=wish_comments.video;
        message=wish_comments.message;
        req.rData = { id, commented_by,createdAt, commentType ,message ,image,video};
        next();


      }

      const deleteWishComments = async (req, res, next, transaction) => {
          console.log("WishController=>deleteWishComments");
            let { commentId, userId } = req.body;

            let query = {userId,id:commentId}
            let data = await CommentService().fetch(commentId, transaction);
            let result = await CommentService().deleteComment(query, transaction);
            let update_feed_result = await WishService().update(data.wish_id,{ total_comment:Sequelize.literal('total_comment - 1')}, transaction);

            req.msg = 'wish_comments_deleted';
            next();


        }

      const wishCommentList = async (req, res, next, transaction) => {
        console.log("WishController=>wishCommentList");
        let { wish_id,page ,limit  } = req.query;
        let { userId  } = req.body;

        let filters = { wish_id,page ,limit };
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
              let userLikeOnWishComment = await CommentService().fetchLikeOnComment({commentId:id,userId});


              let my_liked_type = userLikeOnWishComment?userLikeOnWishComment.like_type:'';
              let isLiked = userLikeOnWishComment?userLikeOnWishComment.isLiked:'';
              commentData.push({id,commentType,message,image,video,commented_by,created_at_date,createdAt,total_like,total_unlike,like_type,isLiked,my_liked_type});

              if(i==data.length-1)
              resolve(commentData);
            });

          })
      }


  const onlyUnique = (value, index, self)=>{
     return self.indexOf(value) === index;
  }
  const changeDateFormat = (dateString,connectors)=>{
    var date = new Date(dateString);
    return date.getDate() + connectors + formatMonth(date.getMonth()+1) + connectors + date.getFullYear() + " | " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  }

  const formatMonth = (month)=>{
    if(month<10) month = "0"+month;
     return month;
  }

const likeUnlikeComments = async (req, res, next, transaction) => {
  console.log("WishController=>likeUnlikeComments");
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
    //let newdata = await WishService().fetchUserLikeOnWishComment(commentId,userId);

    isLiked = isLiked!="1"?false:true;
    like_type = await likeDetails?likeDetails.map(a => a.like_type):[];
    like_type=like_type.filter(onlyUnique);
    let update_result = await CommentService().editComment({id:commentId},{total_like,total_unlike,like_type:like_type.toString()}, transaction);

    req.rData = { commentType,message,image,video,commented_by,total_like,total_unlike ,createdAt,isLiked,like_type,my_liked_type};
    next();

  }

  const getAllLikesOnWish = async (req, res, next, transaction) => {
    console.log("WishController=>getAllLikesOnWish");
    let { id } = req.query;
    let allLikes = await LikeService().getAllLikes({wish_id:id},transaction);
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


    return {
      sendWish,
      deleteWish,
      wishList,
      getUserForWish,
      likeWishMessage,
      addCommentOnWish,
      deleteWishComments,
      wishCommentList,
      likeUnlikeComments,
      getAllLikesOnWish
    }
}
