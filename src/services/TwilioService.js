const AccessToken = require('twilio').jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;
const VoiceGrant = AccessToken.VoiceGrant;
const VideoGrant = AccessToken.VideoGrant;
const { JwtGenerator } = require('virgil-sdk');
const { initCrypto, VirgilCrypto, VirgilAccessTokenSigner } = require('virgil-crypto');
const config = require('../../config/twilio_config.js');
const { models } = require("../models");
const accountSid = config.TWILIO_ACCOUNT_SID;
const authToken = config.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
module.exports = () => {

  const generateToken = (identity,device,token_type,room,FriendlyName="Default") => {
          console.log("TwilioService => generateToken")
          return new Promise(async function(resolve, reject){
            // Create an access token which we will sign and return to the client
            let appName = "FamilyHives";
            let endpointId = `${appName}:${identity}`;//:${device}

            console.log("config");
            console.log(config);
            console.log("FriendlyName");
            console.log(FriendlyName);
            console.log("device");
            console.log(device);
            const accessToken = await new AccessToken(
               config.TWILIO_ACCOUNT_SID,
               config.TWILIO_API_KEY,
               config.TWILIO_API_SECRET,
               {identity: identity}
            );
            if(token_type=="chat"){

            const chatGrant = new ChatGrant({
              serviceSid: config.TWILIO_CHAT_SERVICE_SID,
              endpointId: endpointId,
              pushCredentialSid: config.TWILIO_NOTIFICATION_SERVICE_SID
            });

            accessToken.addGrant(chatGrant);
            await client.chat.services(config.TWILIO_CHAT_SERVICE_SID)
              .update({
                  'USER_FRIENDLY_NAME':`${FriendlyName}`,
                  'notifications.addedToChannel.enabled': true,
                  'notifications.new_message.enabled': true,
                  'notifications.new_message.template':  '${FriendlyName}',
                  'notifications.invited_to_channel.enabled': true,
                  'notifications.new_message.sound': 'default',
                  'notifications.addedToChannel.template': 'A New message from ${FriendlyName}'
              })
              .then(service => console.log("service.friendlyName",service));

          }else if (token_type=="video") {

            const videoGrant = new VideoGrant({
              room // the specific room's name
            });

            accessToken.addGrant(videoGrant);
          }else {

            const voiceGrant = new VoiceGrant({
              outgoingApplicationSid: config.TWILIO_PHONE_NUMBER_SID,
              incomingAllow: true // allows your client-side device to receive calls as well as make them
            });

            accessToken.addGrant(voiceGrant);
        }
        let token = {
              identity: accessToken.identity,
              token: accessToken.toJwt(),
              device,
              token_type,
              room
            };
            resolve(token);
          })
      }

  async function getJwtGenerator() {
  	await initCrypto();

  	const virgilCrypto = new VirgilCrypto();
    console.log('config.virgil');
    console.log(config.virgil);
  	return new JwtGenerator({
  		appId: config.virgil.appId,
  		apiKeyId: config.virgil.appKeyId,
  		apiKey: virgilCrypto.importPrivateKey(config.virgil.appKey),
  		accessTokenSigner: new VirgilAccessTokenSigner(virgilCrypto),
      millisecondsToLive:  5*60 * 60 * 1000
  	});
  }

  const generateVirgilJwt = async (identity) => {
    const generatorPromise = getJwtGenerator();
        return new Promise(async function(resolve, reject){
        	const generator = await generatorPromise;
          const virgilJwtToken = generator.generateToken(identity);
          console.log("virgilJwtToken");
          console.log(virgilJwtToken);
          resolve({identity,token: virgilJwtToken.toString() });
        });
      }

  const createGroup = (friendlyName,createdBy, transaction = null) => {
        return new Promise(function(resolve, reject){
              client.chat.services(config.TWILIO_CHAT_SERVICE_SID)
             .channels
             .create({friendlyName,uniqueName:friendlyName,type:"private",createdBy})
             .then(resolve).catch(reject);
        })
    }

  const saveGroup = (data, transaction = null) => {
      return new Promise(function(resolve, reject){
          models.twilio_groups.create(data, { transaction })
              .then(resolve).catch(reject);
      })
  }

  const getGroupDetails = (fetch_query, transaction = null) => {
      console.log("TwilioService => getGroupDetails")
      return new Promise(function(resolve, reject){

        let query = {
            where : fetch_query,
            attributes: {
                exclude: ["deletedAt","updatedAt"]

            },
            transaction
        }

          let orm = models.twilio_groups.findOne(query);

          orm.then(resolve).catch(reject);
      })
  }

  const getGroupList = (fetch_query,page=null,limit=null, transaction = null) => {
      console.log("TwilioService => getGroupList")
      return new Promise(function(resolve, reject){
        page = parseInt(page || 1);
        limit = parseInt(limit || 10);
        let offset = (page - 1) * limit;
        let query = {
              limit,
              offset,
            where : fetch_query,
            attributes: {
                exclude: ["userId","deletedAt","updatedAt"]

            },
            order: [
                ['id', 'DESC']
            ],
            transaction
        }

          let orm = models.twilio_groups.findAll(query);

          orm.then(resolve).catch(reject);
      })
  }

  const updateGroupDetails = (query,data, transaction = null) => {
    console.log("TwilioService=>updateGroupDetails");
    return new Promise(function(resolve, reject){
        models.twilio_groups.update(data, { where: query, transaction })
            .then(resolve).catch(reject);
    })
  }

  const addParticipants = (channel_sid,identity,roleSid, transaction = null) => {
        return new Promise(function(resolve, reject){
          /*client.conversations.conversations(conversations_sid)
                    .participants
                    .create({identity})*/

                    client.chat.services(config.TWILIO_CHAT_SERVICE_SID)
                     .channels(channel_sid)
                     .members
                     .create({identity,roleSid})
                     .then(resolve).catch(reject);
        })
    }

  const saveParticipants = (data, transaction = null) => {
    return new Promise(function(resolve, reject){
        models.twilio_group_members.create(data, { transaction })
            .then(resolve).catch(reject);
    })
  }

  const getAllParticipants = (fetch_query, transaction = null) => {
    console.log("TwilioService => getAllParticipants")
    return new Promise(function(resolve, reject){

      let query = {
          where : fetch_query,
          attributes: {
              exclude: ["deletedAt","updatedAt"]

          },
          order: [
              ['id', 'DESC']
          ],
          transaction
      }

        let orm = models.twilio_group_members.findAndCountAll(query);

        orm.then(resolve).catch(reject);
    })
}

const getParticipantsByQuery = (fetch_query, transaction = null) => {
  console.log("TwilioService => getParticipantsByQuery")
  return new Promise(function(resolve, reject){

    let query = {
        where : fetch_query,
        attributes: {
            exclude: ["deletedAt","updatedAt"]

        },
        order: [
            ['id', 'DESC']
        ],
        transaction
    }

      let orm = models.twilio_group_members.findAll(query);

      orm.then(resolve).catch(reject);
  })
}

  const addIndividualMember = (data, transaction = null) => {
      return new Promise(function(resolve, reject){
          models.twilio_individual_members.create(data, { transaction })
              .then(resolve).catch(reject);
      })
  }

  const getAllIndividualChats = (fetch_query,page = null,limit=null, transaction = null) => {
    console.log("TwilioService => getAllIndividualChats")
    return new Promise(function(resolve, reject){
      page = parseInt(page || 1);
      limit = parseInt(limit || 10);
      let offset = (page - 1) * limit;
      let query = {
          limit,
          offset,
          where : fetch_query,
          attributes: {
              exclude: ["deletedAt","updatedAt"]
          },
          order: [
              ['id', 'DESC']
          ],
          transaction
      }

        let orm = models.twilio_individual_members.findAndCountAll(query);

        orm.then(resolve).catch(reject);
    })
}

  const fetchIndividualChats = (fetch_query, transaction = null) => {
    console.log("TwilioService => fetchIndividualChats")
    return new Promise(function(resolve, reject){

      let query = {
          where : fetch_query,
          attributes: {
              exclude: ["createdAt","updatedAt"]

          },
          transaction
      }

        let orm = models.twilio_individual_members.findOne(query);

        orm.then(resolve).catch(reject);
    })
  }

  const updateIndividualMember = (query,data, transaction = null) => {
      return new Promise(function(resolve, reject){
          models.twilio_individual_members.update(data, {where: query,  transaction })
              .then(resolve).catch(reject);
      })
  }

const removeParticipants = (conversations_sid,member_sid, transaction = null) => {
      return new Promise(function(resolve, reject){
        try {
          client.chat.services(config.TWILIO_CHAT_SERVICE_SID)
             .channels(conversations_sid)
             .members(member_sid)
             .remove().then(resolve).catch(reject);
        } catch (e) {

        }

      })
  }

  const fetchChannelParticipants = (conversations_sid,member_sid, transaction = null) => {
    console.log("TwilioService=>fetchChannelParticipants");
        return new Promise(function(resolve, reject){
          try {
            client.chat.services(config.TWILIO_CHAT_SERVICE_SID)
               .channels(conversations_sid)
               .members(member_sid)
               .fetch().then(resolve).catch(reject);
          } catch (e) {

          }


        })
    }

  const removeGroupMember = (query, transaction = null) => {

    return new Promise(function(resolve, reject){
      models.twilio_group_members.destroy({ where: query, transaction })
          .then(resolve).catch(reject);
      })
  }
  const updateParticipants = (id,data, transaction = null) => {
    return new Promise(function(resolve, reject){
        models.twilio_group_members.update(data, { where: { id }, transaction })
            .then(resolve).catch(reject);
    })
  }
  const fetchParticipants = (id, transaction = null, scope = "defaultScope") => {
      console.log("UserService => fetch")
      return new Promise(function(resolve, reject){
          let query = {
              where : { id },
              attributes: {
                  exclude: ["createdAt","updatedAt"]
              },
              transaction
          };


          let orm = models.twilio_group_members.scope(scope).findOne(query)
          orm.then(resolve).catch(reject);
      })
  }

  const clearChatHistory = (conversations_sid,message_sid, transaction = null) => {
        return new Promise(function(resolve, reject){
          client.chat.services(config.TWILIO_CHAT_SERVICE_SID)
           .channels(conversations_sid)
           .messages(message_sid)
           .remove().then(resolve).catch(reject);
        })
    }

    const removeChannel = (channel_sid, transaction = null) => {
          return new Promise(function(resolve, reject){
            client.chat.services(config.TWILIO_CHAT_SERVICE_SID)
          .channels(channel_sid)
          .remove().then(resolve).catch(reject);
          })
      }

      const sendSMS = (phone,code, transaction = null) => {
        console.log("TwilioService => sendSMS")
            return new Promise(function(resolve, reject){

              client.messages
              .create({
                 body: 'Your Family Hives verification code is: ' + code + ". Don't share this code with anyone.",
                 messagingServiceSid: config.TWILIO_MESSAGING_SID,
                 to: phone
               }).then(resolve).catch(reject);

              /*client.api.messages.create({
                    body: 'Your Family Hives verification code is: ' + code + ". Don't share this code with anyone.",
                    to: phone,
                    from: config.TWILIO_PHONE_NUMBER
                }).then(resolve).catch(reject);*/
                
            })
        }
  return {
      generateToken,
      generateVirgilJwt,
      saveGroup,
      createGroup,
      getGroupList,
      updateGroupDetails,
      getGroupDetails,
      addParticipants,
      saveParticipants,
      getAllParticipants,
      getParticipantsByQuery,
      addIndividualMember,
      getAllIndividualChats,
      fetchIndividualChats,
      updateIndividualMember,
      removeParticipants,
      fetchChannelParticipants,
      removeGroupMember,
      updateParticipants,
      fetchParticipants,
      clearChatHistory,
      removeChannel,
      sendSMS
  }
}
