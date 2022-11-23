const { Op,QueryTypes  } = require("sequelize");
const NotificationService = require("../services/NotificationService")
const AlbumService = require("../services/AlbumService");
const FeedService = require("../services/FeedServices");
const LikeService = require("../services/LikeServices");
const CommentService = require("../services/CommentServices");
const UserService = require("../services/UserService")
const helpers = require("../util/helpers.js");

module.exports = () => {


const getNotification = async (req, res, next, transaction) => {
  console.log("NotificationController => getNotification");
  let {page,limit,search,user_type} = req.query;
  page = parseInt(page) ; //for next page pass 1 here
  limit = parseInt(limit) ;
  let notification = null;
  let {userId} = req.body;
  query = {userId}
  if(search) query.title =  { $regex: '.*' + search + '.*', '$options' : 'i' };
  notification = await NotificationService().getNotification(query,page,limit, transaction);
  let notification_id = await notification?notification.map(a=>a.id):[];
  console.log('notification_id');
  console.log(notification_id);
  if(notification_id.length>0){
    let  update_query = { "id": {[Op.in]:notification_id} }
    let update_reult = await NotificationService().updateMultipleNotification(update_query,{isRead:true}, transaction);
  }
  if(notification.length>0) notification = await getFeedDetails(notification,userId,transaction);
  req.rData = {notification};
  req.msg = 'notification_list';
  next();
}

const getFeedDetails = (notification_data,user_id,transaction) => {
  console.log("notification_data");
  console.log(notification_data);
  console.log("NotificationController=>getFeedDetails");
  let notificationData = []
        return new Promise(async function(resolve, reject){
          for (var i = 0; i < notification_data.length; i++) {
            let item  = notification_data[i];
            console.log("item");
            console.log(item);
            let {feed_id} = item
            let feed_data = await FeedService().fetch(feed_id,true,transaction);
            if(feed_data && feed_data!=null){
              console.log("feed_id");
              console.log(feed_id);
              //let feed_data = await FeedService().fetch(feed_id,true,transaction);
              console.log("feed_data");
              console.log(feed_data);
              let { id,albumId,userId,family_tree,title ,description,file,file_width,file_height,feed_type,content_type,privacy,total_like,total_unlike,total_comment,like_type,created_by,createdAt } = feed_data;
              like_type = like_type?like_type.split(","):[];
              let query = {userId:user_id,feed_id};
              let userLike = await LikeService().fetchByQuery(query,transaction);
              let userComments = await CommentService().fetchByQuery(query,transaction);
              let my_liked_type = userLike?userLike.like_type:'';

              let isLiked = userLike?userLike.isLiked=='1'?true:false:false;
              let isCommented = userComments?true:false;
              if(feed_type=="memory"){
                let tagged_user = await AlbumService().getTagedUser(feed_id,transaction);
                let files = await AlbumService().getFiles({memory_id:feed_id},transaction);
                let album = await AlbumService().getAlbumName(albumId,transaction);
                let tagged_user_count = tagged_user.count;
                let tagged_user_rows = tagged_user.rows;
                let tagged_user_details = await tagged_user_rows?tagged_user_rows.map(a => a.userDetails):[];
                tagged_user = {count:tagged_user_count,rows:tagged_user_details}
                let feedData = {id,userId,family_tree,title ,description,file_width,file_height,feed_type,content_type,privacy,total_like,total_unlike,total_comment,like_type,my_liked_type,isLiked,isCommented,created_by,createdAt,tagged_user,files,album};
                notificationData.push({notification_details:item,feedData});
              }else {
                let  feedData = {id,userId,family_tree,title ,description,file,file_width,file_height,feed_type,content_type,privacy,total_like,total_unlike,total_comment,like_type,my_liked_type,isLiked,isCommented,created_by,createdAt};
                notificationData.push({notification_details:item,feedData});
              }

            }else {
              notificationData.push({notification_details:item,feedData:null});

            }

            if(i==notification_data.length-1)
            resolve(notificationData);
          }

        })
    }

const setNotificationPermission = async (req, res, next) => {
  console.log("NotificationController => setNotificationPermission");
  let {userId,notification_permission} = req.body;
  data = {notification_permission}
  let result = await UserService().updateProfile(userId,data);

  req.rData = {notification_permission}
  req.msg = 'notification_permission_changed';
  next();
}

const updateNotification = async (req, res, next) => {
  console.log("NotificationController => getNotification");
  let {message_id,isRead} = req.body;
  let data = {isRead}
  notification = await NotificationService().updateNotification(message_id,data);

  req.msg = 'notification_updated';
  next();
}

const getUnreadNotificationCount = async (req, res, next) => {
  console.log("NotificationController => getUnreadNotificationCount");
  let {userId} = req.body;
  query = {userId:userId,isRead:'0'}
  let notification = await NotificationService().countNotification(query);
  req.rData = {notification};



  req.msg = 'notification_count';
  next();
}

const createNotification = async (req, res, next) => {
  console.log("NotificationController => createNotification");
  let {subject,message,sentTo,user} = req.body;
  let data = {subject,message,sentTo}
  try {
    if(user) user = JSON.parse(user.replace(/\\/g,""))

  } catch (e) {

  }

  data.user = user
  notification = await NotificationService().addAdminNotification(data);
  for (var i = 0; i < user.length; i++) {
    let userId = user[i];
    let user_data = await UserService().fetch(userId);
    if(user_data.device_token!=null){
      data ={};
      result = await helpers().sendNotification(user_data.device_token,user_data.device_type,subject,message,data,user_data._id);
    }
  }

  req.msg = 'notification_created';
  next();
}

const deleteNotification = async (req, res, next) => {
  console.log("NotificationController => deleteNotification");
  let { notification_id} = req.body;
  notification = await NotificationService().deleteNotification(notification_id);

  req.msg = 'notification_deleted';
  next();


}

const getAdminNotification = async (req, res, next) => {
  console.log("NotificationController => getAdminNotification");
  let {page,limit,subject} = req.query;
   page = parseInt(page) ; //for next page pass 1 here
   limit = parseInt(limit) ;
  let query = {}
  if(subject) query.subject = { $regex: '.*' + subject + '.*', '$options' : 'i' };;
  notification = await NotificationService().getAdminNotification(query,page,limit);
  let total_notification = await NotificationService().countAdminNotification(query,page,limit);
  notification = await validateNotification(notification);
  req.rData= {page,limit,subject,total_notification,notification}
  req.msg = 'notification_list';
  next();


}

const getAdminNotificationDetails = async (req, res, next) => {
  console.log("NotificationController => getAdminNotificationDetails");
  let { notification_id} = req.query;

  notification = await NotificationService().getAdminNotificationDetails(notification_id);
  let {subject,_id,message,sentTo,time,user} = notification;
  notification = {subject,_id,message,sentTo,time,user};
  req.rData= {notification}
  req.msg = 'notification_details';
  next();


}

const validateNotification = (data) => {
    let notificationData = []
      return new Promise(async function(resolve, reject){
        for (var i = 0; i < data.length; i++) {
          console.log('data[i]');
          console.log(data[i]);
          let {subject,_id,message,sentTo,time,user} = data[i];
          notificationData.push({subject,_id,message,sentTo,time,user});
          if(i==data.length-1)
          resolve(notificationData);
        }

      })
  }


return {
  getNotification,
  setNotificationPermission,
  updateNotification,
  getUnreadNotificationCount,
  createNotification,
  deleteNotification,
  getAdminNotification,
  getAdminNotificationDetails,
}

}
