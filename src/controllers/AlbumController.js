const Sequelize = require('sequelize');
const AlbumService = require("../services/AlbumService");
const FeedService = require("../services/FeedServices");
const LikeService = require("../services/LikeServices");
const CommentService = require("../services/CommentServices");
const UserService = require("../services/UserService");
const { Op } = require("sequelize");
const helpers = require("../util/helpers");

module.exports = () => {

  const createAlbum = async (req, res, next, transaction) => {
      console.log("AlbumController => createAlbum");
      let { userId,album_name,family_tree,album_id } = req.body;
      let album_data = { userId,album_name,family_tree};
      if(album_id){
        let add_result = await AlbumService().updateAlbum(album_id,album_data, transaction);

      }else {
        let add_result = await AlbumService().createNewAlbum(album_data, transaction);
        album_id = add_result.id;
      }
      album_data = await AlbumService().getAlbum(album_id, transaction);

      req.rData = { album_data };

      req.msg = 'album_added';
      next();


  }

  const createMemory = async (req, res, next, transaction) => {
      console.log("AlbumController => createMemory");
      let { userId,content_type,file,title,description,memory_id,tag_users_ids, tag_album_id,file_height,file_width ,family_tree,feed_type } = req.body;
      //let memory_data = { userId,content_type,title,description, albumId:tag_album_id,file_height,file_width,family_tree };
      let feed = {albumId:tag_album_id,userId,content_type, title ,description ,file_height,file_width,family_tree,feed_type};
      if(tag_album_id=="" || !tag_album_id) feed.albumId = null;
        try {
          if(file) file = JSON.parse(file.replace(/\\/g,""))
          if(tag_users_ids) tag_users_ids = JSON.parse(tag_users_ids.replace(/\\/g,""))
        } catch (e) {

        }

      let msg = null;
      if(memory_id){
          //let fileData = await AlbumService().updateMemory(memory_id,memory_data, transaction);
          let update_feed_result = await FeedService().editFeed({id:memory_id},feed, transaction);
          if(file.length>0){
            let fileData = await tagFilesToMemory(file,memory_id, transaction);
            let tag_files_result = await AlbumService().addAlbumFiles(fileData, transaction);

          }
          if(tag_users_ids.length>0){
            let userData = await tagUserToAlbum(tag_users_ids,memory_id,req.authUser.name, transaction);

            let tag_people_result = await AlbumService().tagUser(userData, transaction);
          }
          msg = feed_type=="memory"?'memory_updated':'fame_home_updated';
      }else {
        //let add_file_result = await AlbumService().addMemory(memory_data, transaction);
        //memory_id = add_file_result.id;
        //feed.content_id=memory_id;
        let feed_result = await FeedService().addFeed(feed, transaction);
        memory_id = feed_result.id;

        if(file.length>0){
          let fileData = await tagFilesToMemory(file,memory_id, transaction);
          if(fileData.length>0){
            let album_files_result = await AlbumService().addAlbumFiles(fileData, transaction);
          }
        }
        if(tag_users_ids.length>0){
          let userData = await tagUserToAlbum(tag_users_ids,memory_id,req.authUser.name, transaction);
          let tag_people_result = await AlbumService().tagUser(userData, transaction);
        }
        msg = feed_type=="memory"?'memory_added':'fame_home_added';
        /* let title = "album_added_title";
        let msg2 = "album_added";
        let notification_result = helpers().sendNotificationToAllFamilyMembers(userId,family_tree,title,msg2,req.authUser.name,"memory",memory_id)*/

      }
      let memories_data = await FeedService().fetch(memory_id,false, transaction);
      memories_data = [memories_data];
      memories =  await getTagedUserAndFiles(memories_data,userId,transaction);



      memories =  memories[0];
      req.rData = { memories };

      req.msg = msg;
      next();


  }

  const tagUserToAlbum = (user,memory_id,user_name,transaction) => {
    let userData = [];
        return new Promise(function(resolve, reject){
          user.forEach(async (item, i) => {
            if(item.userId){
            let tagged_user_details = await UserService().fetch(item.userId, transaction);
              if(tagged_user_details){

                if(tagged_user_details.notification_permission=="allow"){
                  let title = "tagged_in_album_title";
                  let msg = "tagged_in_album";

                  let notification_result = helpers().sendNotification(tagged_user_details.device_token,tagged_user_details.device_type,title,msg,user_name,"album",memory_id,tagged_user_details.id,tagged_user_details.language)
                }
              }
            }
            item.memory_id=memory_id;
            userData.push(item);
            if(i==user.length-1)
              resolve(userData);
          });

        })
    }

  const tagFilesToMemory = (files,memory_id, transaction) => {
      let fileData = [];
          return new Promise(function(resolve, reject){
            files.forEach(async (item, i) => {
              item.memory_id=memory_id;
              if(!item.id){
                fileData.push(item);
              }else {
                let album_files_result = await AlbumService().updateAlbumFiles(item.id,item, transaction);
              }
              if(i==files.length-1)
                resolve(fileData);
            });

          })
      }


  const albumList = async (req, res, next, transaction) => {
    console.log("AlbumController=>albumList");
      let { search,page ,limit,upload_type  } = req.query;
      let { userId ,family_tree } = req.body;


      let filters = { search,family_tree, page, limit };
      if(upload_type=="2")
        filters.userId = userId;
      data = await AlbumService().albumList(filters,transaction);

      let total = data.count;
      let album = data.rows;
      if(total>0) album = await getAllMemories(album,userId,'image','5',transaction);
      req.rData = { total,search, page, limit, album };
      req.msg = 'album_list';
      next();


    }

  const albumDetails = async (req, res, next, transaction) => {
      console.log("AlbumController=>albumDetails");
        let { album_id,data_type  } = req.query;
        let { userId  } = req.body;

        album = await AlbumService().getAlbum(album_id,transaction);

        data = [];
        data.push(album);
        album = data;

        if(data.length>0)
          album = await getAllMemories(album,userId,data_type,null,transaction);
        req.rData = { data_type, album };
        req.msg = 'album_details';
        next();


      }

  const getAllMemories = (album,userId,data_type,limit, transaction) => {
    let album_data = [];
        return new Promise(function(resolve, reject){
          album.forEach(async (item, i) => {
            console.log('item');
            console.log(item);
            let {id,album_name,album_type,created_by} = item;
            let query = {albumId:id,content_type:data_type,feed_type:"memory"}
            let memories = await FeedService().fetchAllByQuery(query, transaction);
            console.log(memories);
            let memory_id = await memories?memories.map(a =>a.id):[];
            let file_query = {memory_id:{[Op.in]:memory_id} };

            let files_result  = await AlbumService().getFiles(file_query, transaction);

            let files_rows = files_result.rows;
            let files = await files_rows?files_rows.map(a => a.file):[];

            //if(memories) files =  await getAllFiles(memories,userId,data_type,transaction);

            if(limit!=null && limit!='') files =  await files.slice(0,limit);

            await album_data.push({id,album_name,album_type,created_by,files});
            if(i==album.length-1) resolve(album_data);
          });

        })
    }

  const getAllFiles = async (memories,userId,data_type, transaction) => {
    console.log("AlbumController=>getAllFiles");

    let file_data = [];
        return new Promise(function(resolve, reject){
          memories.forEach(async (item, i) => {
            let {id,albumId,title,type,description,content_type,file_height,file_width,created_by,createdAt} = item;
            if(content_type==data_type){
              let files  = await AlbumService().getFiles({memory_id:id}, transaction);

              let files_rows = files.rows;
              files = await files_rows?files_rows.map(a => String(a.file)):[];

              file_data = await file_data.concat(files);
            }

            if(i==memories.length-1)
              resolve(file_data);
          });

        })
    }


  const getTagedUserAndFiles = (memories,userId, transaction) => {
    let memory_data = [];
        return new Promise(function(resolve, reject){
          memories.forEach(async (item, i) => {
            console.log("item");
            console.log(item);
            let {id,albumId,title,type,description,content_type,feed_type,file_height,file_width,created_by,createdAt,total_like,total_unlike,total_comment,like_type} = item;
            like_type = like_type?like_type.split(","):[]
            let tagged_user = await AlbumService().getTagedUser(id,transaction);
            let tagged_user_count = tagged_user.count;
            let tagged_user_rows = tagged_user.rows;
            let tagged_user_details = await tagged_user_rows?tagged_user_rows.map(a => a.userDetails):[];
            tagged_user = {count:tagged_user_count,rows:tagged_user_details}
            let files = await AlbumService().getFiles({memory_id:id}, transaction);
            let album = await AlbumService().getAlbumName(albumId, transaction);
            let query = {userId,feed_id:id};

            let userLike = await LikeService().fetchByQuery(query,transaction);
            let userComments = await CommentService().fetchByQuery(query,transaction);

            let my_liked_type = userLike?userLike.like_type:'';
            let isLiked = userLike?userLike.isLiked==1?true:false:false;
            let isCommented = userComments?true:false;
            memory_data.push({id,title,type,description,content_type,file_height,file_width,total_like,total_unlike,total_comment,like_type,isLiked,isCommented,my_liked_type,createdAt,created_by,feed_type,tagged_user,files,album});
            if(i==memories.length-1)
              resolve(memory_data);
          });

        })
    }

  const getAlllikesCommentsonMemory = async (memory_id,userId,transaction)=>{
      return new Promise(async function(resolve, reject){

        let total_like = await AlbumService().countLikesOnMemory(memory_id,transaction);
        let total_unlike = await AlbumService().countUnLikesOnMemory(memory_id,transaction);
        let total_comment = await AlbumService().countCommentsOnMemory(memory_id,transaction);
        let userLikeOnMemory = await AlbumService().fetchUserLikeOnMemory(memory_id,userId,transaction);
        let userCommentsOnMemory = await AlbumService().fetchUserCommentsOnMemory(memory_id,userId,transaction);
        let allLikes = await AlbumService().getAllLikesOnMemory(memory_id,transaction);
        total_like = allLikes.count;
        let memoryLikes = allLikes.rows;
         like_type = await memoryLikes?memoryLikes.map(a => a.like_type):[];
        like_type=like_type.filter(onlyUnique);

        let my_liked_type = userLikeOnMemory?userLikeOnMemory.like_type:'';
         isLiked = userLikeOnMemory?userLikeOnMemory.isLiked=='1'?true:false:false;
        let isCommented = userCommentsOnMemory?true:false;
        resolve({total_like,total_unlike,total_comment,like_type,isLiked,isCommented,my_liked_type});
       })
  }

  const getAlllikesOnMemoryComments = async (comment_id,userId,transaction)=>{
      return new Promise(async function(resolve, reject){

         let total_like = await AlbumService().countLikesOnMemoryComments(comment_id,transaction);
        let total_unlike = await AlbumService().countUnLikesOnMemoryComments(comment_id,transaction);
        let likeDetails = await AlbumService().getAllLikesOnMemoryComments(comment_id,transaction);

        let userLikeOnMemoryComment = await AlbumService().fetchUserLikeOnMemoryComment(comment_id,userId);

        let like_type = await likeDetails?likeDetails.map(a => a.like_type):[];
        like_type=like_type.filter(onlyUnique);
        let my_liked_type = userLikeOnMemoryComment?userLikeOnMemoryComment.like_type:'';
        let isLiked = userLikeOnMemoryComment?userLikeOnMemoryComment.isLiked:'';

        resolve({total_like,total_unlike,like_type,isLiked,my_liked_type});
       })
  }

  const memoryList = async (req, res, next, transaction) => {
    console.log("AlbumController=>memoryList");
      let { search,page ,limit,upload_type  } = req.query;
      let { userId,family_tree  } = req.body;

      let filters = { search,family_tree, page, limit,feed_type:"memory" } ;
      if (upload_type==2)filters.userId=userId

      data = await FeedService().feedList(filters,transaction);

      let total = data.count;
      let memories = data.rows;
      if(memories.length>0)
        memories =  await getTagedUserAndFiles(memories,userId,transaction);
      req.rData = { total,search, page, limit, memories };
      req.msg = 'memories_list';
      next();


    }

  const deleteAlbum = async (req, res, next, transaction) => {
      console.log("AlbumController => createAlbum");
      let { userId,album_id } = req.body;
      let query = { userId,id:album_id };

      let result = await AlbumService().deleteAlbum(query, transaction);

      req.msg = 'album_deleted';
      next();
  }

  const deleteAlbumMemories = async (req, res, next, transaction) => {
      console.log("AlbumController => deleteAlbumMemories");
      let { userId,memory_id } = req.body;
      let query = { id:memory_id,userId,feed_type:"memory" };
      let memories = await FeedService().fetchByQuery(query, transaction);
      //let memories = await AlbumService().fetchMemory(query, transaction);
      if(memories){
        let delete_feed_result = await FeedService().deleteFeed({id:memory_id}, transaction);
        req.msg = 'memory_deleted';
      }else {
        req.msg = 'unauthorized';

      }
      next();


  }

  const likeMemory = async (req, res, next, transaction) => {
      console.log("AlbumController=>likeAlbumMemories");
        let { memory_id,userId, like_type, isLiked } = req.body;
        let likeMemory = { feed_id:memory_id,userId, like_type, isLiked };
        if(isLiked=='0' || isLiked==0) likeMemory.like_type = '';
        let userLikeOnMemories = await LikeService().fetchByQuery({feed_id:memory_id,userId},transaction);
        let memory = await FeedService().fetch(memory_id,true,transaction);
        if(userLikeOnMemories){
          result = await LikeService().editLike({id:userLikeOnMemories.id},likeMemory, transaction);
          req.msg = 'like_updated_on_memory';
        }else{
          result = await LikeService().like(likeMemory, transaction);

          req.msg = 'like_added_on_memory';
        }

        let total_like = await LikeService().countLike({feed_id:memory_id},transaction);
        let total_unlike = await LikeService().countDisLike({feed_id:memory_id},transaction);
        let total_comment = await CommentService().countComment({feed_id:memory_id},transaction);

        let memoryLikes = await LikeService().getAllLikes({feed_id:memory_id},transaction);
        memoryLikes = memoryLikes.rows;
        like_type = await memoryLikes?memoryLikes.map(a => a.like_type):[];
        like_type=like_type.filter(onlyUnique);
        let feed_data = { total_like,total_unlike,like_type:like_type.toString()};

        let update_feed_result = await FeedService().editFeed({id:memory_id},feed_data, transaction);
        let memory2 = await FeedService().fetch(memory_id,true,transaction);
        if(!userLikeOnMemories){
          if(memory.userId!=userId){
            let album_user_details = await UserService().fetch(memory.userId, transaction);
              if(album_user_details){

                if(album_user_details.notification_permission=="allow"){
                  let title = "like_on_album_title";
                  let msg = "like_on_album";

                  let notification_result = helpers().sendNotification(album_user_details.device_token,album_user_details.device_type,title,msg,req.authUser.name,"album",memory_id,album_user_details.id,album_user_details.language)
                  }
              }
            }
        }
        updated_memory = [memory2];
        updated_memory =  await getTagedUserAndFiles(updated_memory,userId,transaction);

        req.rData = { memory:updated_memory[0] };
        next();


      }

  const getAllLikesOnMemory = async (req, res, next, transaction) => {
    console.log("AlbumController=>getAllLikesOnMemory");
    console.log(req.query)
    let { id } = req.query;
    let allLikes = await LikeService().getAllLikes({feed_id:id},transaction);
    console.log('allLikes')
    console.log(allLikes)
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
              let { id,userId ,feed_id,like_type ,userDetails} = item;

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

  const addCommentOnMemory = async (req, res, next, transaction) => {
      console.log("AlbumController=>addCommentOnMemory");
        let { memory_id,userId, commentType ,message ,image,video } = req.body;

        let memoryComments = { feed_id:memory_id,userId, commentType ,message ,image ,video};

        let result = await CommentService().comment(memoryComments, transaction);
        let memory_details = await FeedService().fetch(memory_id,false, transaction);
        //let memory = await AlbumService().getMemory(memory_id,transaction);

        //memory.updatedAt=await getTodayDate();
        let update_feed_result = await FeedService().editFeed({id:memory_id},{ total_comment:Sequelize.literal('total_comment + 1'),lastCommentAt:Sequelize.fn('NOW')}, transaction);
        let comments = await CommentService().fetch(result.id, transaction);
        if(memory_details.userId!=userId){
          let album_user_details = await UserService().fetch(memory_details.userId, transaction);
            if(album_user_details){

              if(album_user_details.notification_permission=="allow"){
                let title = "comment_on_album_title";
                let msg = "comment_on_album";
                let data = {title,body:msg,type:"album"}

                let notification_result = helpers().sendNotification(album_user_details.device_token,album_user_details.device_type,title,msg,req.authUser.name,"album",memory_id,album_user_details.id,album_user_details.language)
                }
            }
          }
        let id=comments.id;
        let commented_by=comments.userDetails;
        let createdAt=comments.createdAt;
        commentType=comments.commentType;
        message=comments.message;
        image=comments.image;
        video=comments.video;
        total_like=comments.total_like;
        total_unlike=comments.total_unlike;
        like_type=comments.like_type?comments.like_type.split(","):[];
        req.rData = { id, commented_by,createdAt, commentType ,message ,image,video,total_like,total_unlike,like_type,isLiked:"",my_liked_type:""};
        req.msg = 'memory_comments_added';
        next();


      }

  const updateCommentOnMemory = async (req, res, next, transaction) => {
      console.log("MemoryController=>editCommentOnMemory");
      console.log(req.body);
        let { commentId, commentType ,message ,image,video,userId } = req.body;
        let memoryComments = { commentType ,message ,image ,video};
        if(commentType=="text"){
          memoryComments.image = null;
          memoryComments.video = null;
        }
        if(commentType=="image"){
          memoryComments.message = null;
          memoryComments.video = null;
        }
        if(commentType=="video"){
          memoryComments.message = null;
          memoryComments.image = null;
        }
        let result = await CommentService().editComment({id:commentId},memoryComments, transaction);

        let comment_data = await CommentService().fetch(commentId, transaction);
        console.log('comment_data')
        console.log(comment_data)
        let memory_id = comment_data.feed_id;
        let update_data = {id:memory_id}
        let update_feed_result = await FeedService().editFeed({id:memory_id},update_data, transaction);

        let userLikeOnMemoryComment = await CommentService().fetchLikeOnComment({commentId,userId});
        let my_liked_type = userLikeOnMemoryComment?userLikeOnMemoryComment.like_type:'';
        let isLiked = userLikeOnMemoryComment?userLikeOnMemoryComment.isLiked:'';
        let {total_like,total_unlike,like_type} = comment_data;
        let id=comment_data.id;
        let commented_by=comment_data.commented_by;
        let createdAt=comment_data.createdAt;
        commentType=comment_data.commentType;
        message=comment_data.message;
        image=comment_data.image;
        video=comment_data.video;
        message=comment_data.message;
        req.rData = { id, commented_by,createdAt, commentType ,message ,image,video,total_like,total_unlike,like_type,isLiked,my_liked_type};

        req.msg = 'memory_comments_updated';
        next();


    }

  const deleteCommentOnMemory = async (req, res, next, transaction) => {
    console.log("MemoryController=>deleteMemoryComments");
      let { commentId, userId } = req.body;
      console.log('commentId');
      console.log(commentId);
      let query = {userId,id:commentId}
      let memory = await CommentService().fetch(commentId, transaction);
      result = await CommentService().deleteComment(query, transaction);
      let update_feed_result = await FeedService().editFeed({id:memory.feed_id},{ total_comment:Sequelize.literal('total_comment - 1')}, transaction);

      req.msg = 'memory_comments_deleted';
      next();


  }

  const getAllCommentsOnMemory = async (req, res, next, transaction) => {
    console.log("AlbumController=>memoryCommentList");
      let { memory_id,page ,limit  } = req.query;
      let { userId  } = req.body;

      let filters = { feed_id:memory_id,page ,limit };
      let comments = await CommentService().commentList(filters);
      console.log(comments)
      let total = comments.count;
      let data = comments.rows;
      if(data && data.length>0)
        comments =await fetchLikeOnCommentData(data,userId, transaction);
      else
        comments =[];
      req.rData = { total, page, limit, comments };
      req.msg = 'comment_list';
      next();


    }

  const fetchLikeOnCommentData = (data,userId, transaction) => {
      let commentData = []
        return new Promise(function(resolve, reject){
          data.forEach(async (item, i) => {
            console.log('item')
            console.log(item)
            let {id,commentType,message,image,video,createdAt,commented_by,total_like,total_unlike,like_type} = item;
            like_type = like_type?like_type.split(","):[];
            let userLikeOnMemoryComment = await CommentService().fetchLikeOnComment({commentId:id,userId});
            let my_liked_type = userLikeOnMemoryComment?userLikeOnMemoryComment.like_type:'';
            let isLiked = userLikeOnMemoryComment?userLikeOnMemoryComment.isLiked:'';
            commentData.push({id,commentType,message,image,video,commented_by,createdAt,total_like,total_unlike,like_type,isLiked,my_liked_type});

            if(i==data.length-1)
            resolve(commentData);
          });

        })
    }

  const likeUnlikeComments = async (req, res, next, transaction) => {
      console.log("AlbumController=>likeUnlikeComments");
        let { commentId,userId, like_type,isLiked } = req.body;
        let likeOnComment = { commentId,userId, like_type,isLiked };
        if(isLiked=='0') likeOnComment.like_type = null;
        let my_liked_type = likeOnComment.like_type;
        let UserLikesOnComment = await CommentService().fetchLikeOnComment({commentId,userId}, transaction);
        //let UserLikesOnComment = await AlbumService().fetchUserLikeOnMemoryComment(commentId,userId);
        if(UserLikesOnComment){
          result = await CommentService().editLikeOnComment({id:UserLikesOnComment.id},likeOnComment, transaction);
          //result = await AlbumService().updateCommentLike(UserLikesOnComment.id,likeOnComment, transaction);
          req.msg = 'like_on_comment_change';
        }else{
          result = await CommentService().addLikeOncomment(likeOnComment, transaction);
          //result = await AlbumService().likeOnComment(likeOnComment, transaction);
          //console.log(result);
          req.msg = 'like_added_on_comment';

        }
        comments = await CommentService().fetch(commentId, transaction);
        //comments = await AlbumService().fetchComments(commentId, transaction);
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

      const getTodayDate =()=>{
              var today = new Date();
              var dd = String(today.getDate()).padStart(2, '0');
              var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
              var yyyy = today.getFullYear();
              var hour = String(today.getHours()).padStart(2, '0');;
              var minutes = String(today.getMinutes()).padStart(2, '0');;
              var seconds = String(today.getSeconds()).padStart(2, '0');;

              return yyyy + '-' + mm + '-' + dd +' '+hour+':'+minutes+':'+seconds;

      }

  const onlyUnique = (value, index, self)=>{
     return self.indexOf(value) === index;
  }
    return {
      createAlbum,
      albumList,
      albumDetails,
      createMemory,
      memoryList,
      getTagedUserAndFiles,
      deleteAlbum,
      deleteAlbumMemories,
      likeMemory,
      getAllLikesOnMemory,
      addCommentOnMemory,
      updateCommentOnMemory,
      deleteCommentOnMemory,
      getAllCommentsOnMemory,
      likeUnlikeComments
    }
}
