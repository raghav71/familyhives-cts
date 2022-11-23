const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const fs = require("fs");
const serverConfig = require("../../config/server");
const messages = require("./messages");
const notification_messages = require("./notification_messages");
const { Op } = require("sequelize");
var FCM = require('fcm-push');
const NotificationService = require("../services/NotificationService")
const AlbumService = require("../services/AlbumService");
const FeedService = require("../services/FeedServices");
const LikeService = require("../services/LikeServices");
const CommentService = require("../services/CommentServices");
const FamilyService = require("../services/FamilyService");
var fcmServerkey = serverConfig.fcmServerkey; //put your server key here

var fcm = new FCM(fcmServerkey);
module.exports = function() {
    const resp = (response, lang, m = "success", data = {}, code = 1) => {
        return response.send({
            message: messages(lang)[m],
            data,
            code
        })
    }

    const getErrorMessage = (errors) => {
        console.log("Helpers => getErrorMessage");

        try {
            console.log(errors);
            for (var key in errors) {
                let rule = errors[key]['rule'];

                let exists = messages()[rule];
                if(exists) return messages()[rule](key)['en']

                return errors[key]['message'];
            }
        }catch(ex) {
            return "Something is wrong, Please try again later !!" + ex.message;
        }
    }


    const generateOTP = (length = 6) => {

        return Math.floor(100000 + Math.random() * 900000);
    }

    const createJWT = (payload) => {
        return jwt.sign(payload, serverConfig.jwtSecret, {
            expiresIn: '30d' // expires in 30 days
        });
    }
    const hashPassword = async password => {
        const salt = await bcrypt.genSalt()
        const hash = await bcrypt.hash(password, salt)
        return hash;
    }

    const checkPassword = async (password, hash) => {
        console.log("Helpers => checkPassword");

        let result = await bcrypt.compare(password, hash);
        return result;
    }

    const sendNotification = async (device_token,device_type,title,msg,name,type,feed_id=null,userId,lang="en",additional_msg=null) => {
      console.log("Helpers => sendNotification");
      title = await notification_messages(lang)[title];
      let body = await notification_messages(lang,name)[msg];
      if(additional_msg) body = body+additional_msg;
      let feedData = null;
      if(feed_id!=null){
        let feed_data = await FeedService().fetch(feed_id,true);
        feedData = feed_data!=null?await getFeedsDetails(feed_data,userId):null;
      }
      let data = {title,body,type}
      let notification_data = { device_token,device_type,title,body,data:JSON.stringify(data),feed_id:feed_id,notification_type:type,userId,isRead:0 };
      let result = await NotificationService().addNotification(notification_data);
      data.message_id = result.id;
      data.feedData = feedData;
      var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
          to: device_token,
          //collapse_key: 'your_collapse_key',

          notification: {
              title: title,
              body: body
          },

          data: data,
      }
      console.log(message);
      fcm.send(message, async function(err, response){
          if (err) {
              console.log("Something has gone wrong!",err)
          } else {
              console.log("Successfully sent with response: ", response)
          }
      })
    }

    const getFeedsDetails = (feed_data,user_id) => {
      console.log("UserController=>getFeedsDetails");
            return new Promise(async function(resolve, reject){
                console.log("feed_data");
                console.log(feed_data);
                let { id,albumId,userId,family_tree,title ,description,file,file_width,file_height,feed_type,content_type,privacy,total_like,total_unlike,total_comment,like_type,created_by,createdAt } = feed_data;
                like_type = like_type?like_type.split(","):[];
                let query = {userId:user_id,feed_id:id};
                let userLike = await LikeService().fetchByQuery(query);
                let userComments = await CommentService().fetchByQuery(query);
                let my_liked_type = userLike?userLike.like_type:'';

                let isLiked = userLike?userLike.isLiked=='1'?true:false:false;
                let isCommented = userComments?true:false;
                if(feed_type=="memory"){
                  let tagged_user = await AlbumService().getTagedUser(id);
                  let files = await AlbumService().getFiles({memory_id:id});
                  let album = await AlbumService().getAlbumName(albumId);
                  let tagged_user_count = tagged_user.count;
                  let tagged_user_rows = tagged_user.rows;
                  let tagged_user_details = await tagged_user_rows?tagged_user_rows.map(a => a.userDetails):[];
                  tagged_user = {count:tagged_user_count,rows:tagged_user_details}
                  resolve({id,userId,family_tree,title ,description,file_width,file_height,feed_type,content_type,privacy,total_like,total_unlike,total_comment,like_type,my_liked_type,isLiked,isCommented,created_by,createdAt,tagged_user,files,album});
                }else {
                  resolve({id,userId,family_tree,title ,description,file,file_width,file_height,feed_type,content_type,privacy,total_like,total_unlike,total_comment,like_type,my_liked_type,isLiked,isCommented,created_by,createdAt});
                }


            })
        }

    const sendNotificationToAllFamilyMembers = (userId,family_tree,title,msg,name,type,feed_id=null,additional_msg=null) => {
      console.log("helpers=>sendNotificationToAllFamilyMembers");
      var UserService = require("../services/UserService");
            return new Promise(async function(resolve, reject){
              let family_member = await FamilyService().fetchMemberByQuery({family_tree,added_by:"manual",registered_id:{[Op.ne]: null},registered_id:{[Op.ne]: userId}});

              for (var i = 0; i < family_member.length; i++) {
                let user_id = family_member[i].registered_id;
                console.log("user_id");
                console.log(user_id);
                let user_details = await UserService().fetch(user_id);

                let notification_result = sendNotification(user_details.device_token,user_details.device_type,title,msg,name,type,feed_id,user_details.id,user_details.language)


                if(i==family_member.length-1) resolve(true);
              }



            })
        }

    function shuffle(array) {
      let currentIndex = array.length,  randomIndex;

      // While there remain elements to shuffle...
      while (currentIndex != 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }

      return array;
    }

    function sortArray(array) {

      array.sort(function(a, b) {

          return b.lastCommentAt - a.lastCommentAt; // for descending order
      });

      return array;
    }



    const sendEmail = function(to, subject, html) {
        return new Promise((resolve, reject) => {
            const sgMail = require('@sendgrid/mail')
            sgMail.setApiKey(serverConfig.sendgridApiKey) //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
            const msg = {
                to,
                from: serverConfig.sendgridSender, //uttam.kumar@appsinvo.com
                subject,
                html
            }
             console.log(msg);
            sgMail.send(msg).then(resolve).catch(reject);
        })
    }
      return {
        generateOTP,
        resp,
        getErrorMessage,
        createJWT,
        hashPassword,
        checkPassword,
        sendNotification,
        sendNotificationToAllFamilyMembers,
        shuffle,
        sortArray,
        sendEmail
    }
}
