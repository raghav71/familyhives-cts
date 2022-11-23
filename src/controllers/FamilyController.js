const { Op } = require("sequelize");
const FamilyService = require("../services/FamilyService");
const UserService = require("../services/UserService");
const helpers = require("../util/helpers");
const TwilioService = require('../services/TwilioService');
const config = require('../../config/twilio_config.js');

module.exports = () => {

        const addFamilyMembers = async (req, res, next, transaction) => {
        console.log("FamilyController=>addFamilyMembers");
          let { userId,family_tree, name,countryCode ,mobile ,image,parent,relationship_name,isMarried,spouse_name,spouse_countryCode,spouse_mobile,spouse_image,spouse_relationship_name,memberId,spouse_id } = req.body;
          let check_flag = true;
          let registered_member = await UserService().fetchByMobile(countryCode,mobile, transaction);

          let registered_id = registered_member?registered_member.id:null;
          let registered_spouse = await  (isMarried==1 && spouse_countryCode!="" && spouse_mobile!="")? await UserService().fetchByMobile(spouse_countryCode,spouse_mobile, transaction):null;
          let spouse_registered_id = registered_spouse?registered_spouse.id:null;

          if(registered_id && registered_id==userId) {
            memberId=req.authUser.member_id;

            let self_relation = await FamilyService().fetchFamilyRelation({member_1:memberId,member_2:memberId}, transaction);

            if(!self_relation){
              if(memberId) relation_result = await addRelation(memberId,memberId,relationship_name,transaction);
            }

          }else if(spouse_registered_id && spouse_registered_id==userId) {

            spouse_id=req.authUser.member_id;

            let self_relation = await FamilyService().fetchFamilyRelation({member_1:spouse_id,member_2:spouse_id}, transaction);
            if(!self_relation){
              if(spouse_id && spouse_id!="") relation_result = await addRelation(spouse_id,spouse_id,relationship_name,transaction);

            }

          }else{

          }
          let member = { userId,family_tree,registered_id, name,countryCode ,mobile ,image,parent,isMarried,added_by:"manual"};
          let spouse_details = { userId,family_tree,parent,registered_id:spouse_registered_id, name:spouse_name,countryCode:spouse_countryCode ,mobile:spouse_mobile ,image:spouse_image,isMarried:true,added_by:"manual"};
          if(parent==0){
            member.parent = null;
            spouse_details.parent =null;
          }

          let spouse_result = null;
          if(memberId){
            spouse_details.spouseId = memberId;
            update_result = await FamilyService().updateFamilyMemberProfile({id:memberId},member, transaction);
            if(!spouse_id){
              let exist_spouse = await FamilyService().fetchSpouse({spouseId:memberId}, transaction);
              if(exist_spouse) spouse_id = exist_spouse.id;
            }
            if(memberId) relation_result = await addRelation(req.authUser.member_id,memberId,relationship_name,transaction);

            if(isMarried==1 && spouse_name!=''){
              console.log("spouse_id");
              console.log(spouse_id);
                if(spouse_id && spouse_id!='' && spouse_id!="null"){
                   spouse_update_result = await FamilyService().updateSpouse(spouse_id,spouse_details, transaction);
                }else{
                  spouse_result = await FamilyService().addFamilyMember(spouse_details, transaction);
                  spouse_id = spouse_result.id;
                  console.log("update member notification");
                  console.log(registered_spouse);
                  if(registered_spouse){
                    console.log(registered_spouse.notification_permission);

                    if(registered_spouse.notification_permission=="allow"){
                      let title = "member_added_title";
                      let msg = "member_added";
                      let notification_result = helpers().sendNotification(registered_spouse.device_token,registered_spouse.device_type,title,msg,req.authUser.name,"family",null,registered_spouse.id,registered_spouse.language)
                    }
                  }
                }
                if(spouse_id && spouse_id!='' && spouse_id!="null") relation_result = await addRelation(req.authUser.member_id,spouse_id,spouse_relationship_name,transaction);
            }
            req.rCode=1;
            req.msg = 'family_member_updated';
          }else{
              member_result = await FamilyService().addFamilyMember(member, transaction);
              if(member_result.id) relation_result = await addRelation(req.authUser.member_id,member_result.id,relationship_name,transaction);
              //let member_relation_result = await FamilyService().addFamilyRelation({member_1:req.authUser.member_id,member_2:member_result.id,member_1_relation_with_member_2:relationship_name}, transaction);
              let activity = req.authUser.name+" added "+name+" as family member";

              let activity_data = {userId,activity}
              let user_log_result = await FamilyService().addUserActivity(activity_data, transaction);

              if(isMarried==1 && spouse_name!=''){
                spouse_details.spouseId = await member_result.id;
                spouse_result = await FamilyService().addFamilyMember(spouse_details, transaction);
                if(spouse_result.id) relation_result = await addRelation(req.authUser.member_id,spouse_result.id,spouse_relationship_name,transaction);
                let spouse_relation_result = await FamilyService().addFamilyRelation({member_1:req.authUser.member_id,member_2:spouse_result.id,member_1_relation_with_member_2:spouse_relationship_name}, transaction);
                spouse_id = spouse_result.id;
                let spouse_activity = req.authUser.name+" added "+spouse_name+" as family member";

                let spouse_activity_data = {userId,activity:spouse_activity}
                let user_log_result2 = await FamilyService().addUserActivity(spouse_activity_data, transaction);

              }
              memberId = member_result.id;
              req.rCode=1;
              req.msg = 'family_member_added';
              console.log("check notification");
              console.log(registered_id);
              if(registered_id){

                let chat_result = await addMemberInDefaultChatGroup(userId,registered_id,family_tree,config.TWILIO_USER_ROLE_SID,transaction);
                let member_details = await UserService().fetch(registered_id, transaction);
                console.log(member_details.length);
                if(member_details){
                  console.log(member_details.notification_permission);

                  if(member_details.notification_permission=="allow"){
                    let title = "member_added_title";
                    let msg = "member_added";

                    let notification_result = helpers().sendNotification(member_details.device_token,member_details.device_type,title,msg,req.authUser.name,"family",null,member_details.id,member_details.language)
                    }
                }
                let member_tree_data = await FamilyService().fetchUsersFamilyTree({userId:registered_id}, transaction);
                let active_tree = await !member_tree_data.active_tree?family_tree:member_tree_data.active_tree;;
                let update_data = {};
                if(!member_tree_data.family_tree_1 || !member_tree_data.family_tree_2){
                  update_data = !member_tree_data.family_tree_1?{family_tree_1:family_tree,active_tree}:{family_tree_2:family_tree,active_tree};
                  let update_result = await FamilyService().updateUsersFamilyTree({id:member_tree_data.id},update_data, transaction);
                }
              }
              console.log("check spouse notification");
              console.log(spouse_registered_id);

              if(spouse_registered_id){

              let spouse_chat_result = await addMemberInDefaultChatGroup(userId,spouse_registered_id,family_tree,config.TWILIO_USER_ROLE_SID,transaction);
              let member_spouse_details = await UserService().fetch(spouse_registered_id, transaction);
              console.log(member_spouse_details.length);
              if(member_spouse_details){
                console.log(member_spouse_details.notification_permission);

                if(member_spouse_details.notification_permission=="allow"){
                  let title = "member_added_title";
                  let msg = "member_added";

                  let notification_result = helpers().sendNotification(member_spouse_details.device_token,member_spouse_details.device_type,title,msg,req.authUser.name,"family",null,member_spouse_details.id,member_spouse_details.language)
                  }
              }
              let spouse_tree_data = await FamilyService().fetchUsersFamilyTree({userId:spouse_registered_id}, transaction);
              let spouse_active_tree = await !spouse_tree_data.active_tree?family_tree:spouse_tree_data.active_tree;
              let spouse_update_data = {};
              if(!spouse_tree_data.family_tree_1 || !spouse_tree_data.family_tree_2){
                spouse_update_data = !spouse_tree_data.family_tree_1?{family_tree_1:family_tree,active_tree:spouse_active_tree}:{family_tree_2:family_tree,active_tree:spouse_active_tree};
                let spouse_update_result = await FamilyService().updateUsersFamilyTree({id:spouse_tree_data.id},spouse_update_data, transaction);
              }
            }
            //}

          }
          //if(check_flag==true){
            if(parent==0){
              let tree_data = {parent:memberId};
              let update_tree = await FamilyService().updateFamilyTree({id:family_tree},tree_data, transaction);
              let  parent_update_result = await FamilyService().updateFamilyMemberProfile({family_tree,parent:null,id:{[Op.notIn]: [memberId,spouse_id]}},{parent:memberId}, transaction);
            }
            let family_member = await FamilyService().fetchFamilyMember(memberId, transaction);
            if(spouse_id) spouse_details = await FamilyService().fetchFamilyMember(spouse_id, transaction);
            else spouse_details = null;
            req.rData = { family_member,spouse_details };
          /*}else {
            req.rCode=0;
            req.msg='family_member_already_added';
          }*/
          next();


        }

        const addRelation = async (first_member_id,second_member_id,relationship_name,transaction)=>{

          let first_relation = await FamilyService().fetchFamilyRelation({member_1:first_member_id,member_2:second_member_id}, transaction);
          let second_relation = await FamilyService().fetchFamilyRelation({member_2:first_member_id,member_1:second_member_id}, transaction);
          if(first_relation){
            let relation_result = await FamilyService().updateFamilyRelation({id:first_relation.id},{member_1_relation_with_member_2:relationship_name}, transaction);

          }else if (second_relation) {
            let relation_result = await FamilyService().updateFamilyRelation({id:second_relation.id},{member_2_relation_with_member_1:relationship_name}, transaction);

          }else {
            let relation_result = await FamilyService().addFamilyRelation({member_1:first_member_id,member_2:second_member_id,member_1_relation_with_member_2:relationship_name}, transaction);

          }

        }

        const addMemberInDefaultChatGroup = async (userId,member_id,family_tree,role_sid,transaction) =>{
          console.log("addMemberInDefaultChatGroup");
          let group_data = await TwilioService().getGroupDetails({userId,isDefaultGroup:1,family_tree},transaction);
          let group_id =null;
          let group_sid =null;
          if(!group_data){
            let family_tree_data = await FamilyService().fetchFamilyTree({userId}, transaction);

            let group_name=family_tree_data.name;

            let group_result = await TwilioService().saveGroup({userId,group_name,isDefaultGroup:1,family_tree},transaction);
            group_id =group_result.id;
            let twilio_result = await TwilioService().createGroup(group_id,userId,transaction);
            group_sid =twilio_result.sid;
            let update_result = await TwilioService().updateGroupDetails({id:group_id},{group_sid:twilio_result.sid},transaction);
          }else {
            group_id = group_data.id;
            group_sid =group_data.group_sid;
          }

          let twilio_participants_result = await TwilioService().addParticipants(group_sid,member_id,role_sid,transaction);
          console.log("twilio_participants_result");
          console.log(twilio_participants_result);
          let participants_result = await TwilioService().saveParticipants({group_id,member_id,member_sid:twilio_participants_result.sid},transaction);
        }

        const getFamilyMembers = async (req, res, next, transaction) => {
          console.log("FamilyController=>getFamilyMembers");
            let { userId} = req.body;
            let user_family_tree = await FamilyService().fetchUsersFamilyTree({userId}, transaction);
            if(user_family_tree){
              let family_tree_data = await FamilyService().fetchFamilyTree({id:user_family_tree.active_tree}, transaction);
              let member_id = family_tree_data.parent;
              let family_tree = user_family_tree.active_tree;
              let family_member = await FamilyService().fetchFamilyMemberByQuery({id:member_id},null,null, transaction);

              let members_rows = family_member.rows;
              let total_generation_level = 0;
              let main_parent = 0;
              let members = null;
              let members_ids = [];
              if(members_rows.length>0) members = await getAllFamilyMembers2(members_rows,userId,total_generation_level,req,family_tree,members_ids,transaction);
              let family_tree_1 = user_family_tree.family_tree_1_details?user_family_tree.family_tree_1_details.name:null;
              let family_tree_1_id = user_family_tree.family_tree_1_details?user_family_tree.family_tree_1_details.id:null;
              let family_tree_2 = user_family_tree.family_tree_2_details?user_family_tree.family_tree_2_details.name:null;
              let family_tree_2_id = user_family_tree.family_tree_2_details?user_family_tree.family_tree_2_details.id:null;
              req.rData = { user_can_add_member:1,members,family_tree:{family_tree_1,family_tree_1_id,family_tree_2,family_tree_2_id,active_tree:user_family_tree.active_tree} };
              req.msg = "family_tree"
            }else {
              req.rData = { user_can_add_member:0  };
              req.msg = "no_family_tree_found"
            }
            next();


          }

        const getAllFamilyMembers = (data,userId,total_generation_level,req,family_tree,members_ids,transaction) => {
                let membersData = []
                  return new Promise(async function(resolve, reject){
                  for (var i = 0; i < data.length; i++) {
                      console.log('data');
                      console.log(data[i]);
                      let { id,registered_id,name,countryCode,mobile,image,parent,isMarried,partner_name,partner_image,family_tree,spouseId,registered_user_details } = data[i];
                      total_generation_level++;
                      if(members_ids.indexOf(id)==-1){
                      let member_relation_result = await FamilyService().fetchFamilyRelation({[Op.or]:[{member_1:req.authUser.member_id,member_2:id},{member_1:id,member_2:req.authUser.member_id}]}, transaction);

                      let member_relation = member_relation_result?member_relation_result.member_1==req.authUser.member_id?member_relation_result.member_1_relation_with_member_2:member_relation_result.member_2_relation_with_member_1:null;
                      let query = null;
                      let spouse_query = {spouseId:id,status:true,family_tree,added_by:"manual"}
                      if(spouseId!=null) spouse_query = await {id:spouseId,status:true,family_tree,added_by:"manual"}

                      let spouse_details = await FamilyService().fetchSpouse(spouse_query, transaction);
                      if(spouse_details){
                        if(spouse_details.spouseId) query = await {[Op.or]:[{parent:spouse_details.id},{parent:spouse_details.spouseId}],status:true,family_tree,added_by:"manual"}
                        else query = await {[Op.or]:[{parent:id},{parent:spouse_details.id}],status:true,family_tree,added_by:"manual"}
                      }else {
                        query = await {parent:id,status:true,family_tree,added_by:"manual"}
                      }
                      let child_family_member = await FamilyService().fetchFamilyMemberByQuery(query,null,null, transaction);

                      let spouse_relation =null;
                      let flag = true;

                      let childCount = child_family_member.count;
                      let childData = child_family_member.rows;
                      if(spouse_details){
                        let spouse_relation_result = await FamilyService().fetchFamilyRelation({[Op.or]:[{member_1:req.authUser.member_id,member_2:spouse_details.id},{member_1:spouse_details.id,member_2:req.authUser.member_id}]}, transaction);

                        registered_spouse_details = null;
                        spouse_relation = spouse_relation_result?spouse_relation_result.member_1==req.authUser.member_id?spouse_relation_result.member_1_relation_with_member_2:spouse_relation_result.member_2_relation_with_member_1:null;
                        if(members_ids.indexOf(spouse_details.id)!=-1) flag = await false;

                        members_ids.push(spouse_details.id);
                      }
                      //if(childData.length==0) membersData['total_generation_level'] = await total_generation_level;
                      if(members_ids.indexOf(id)!=-1)flag = false;

                      if(flag==true){

                        console.log("childData");
                        console.log(childData.length);
                        if(childData.length>0) childData = await getAllFamilyMembers(childData,userId,total_generation_level,req,family_tree,members_ids,transaction);

                        members_ids.push(id);
                        membersData.push({id,registered_id,registered_user_details,family_tree,name,countryCode,mobile,image,parent,isMarried,member_relation,spouse_relation,spouse_details,childCount,childData});
                      }
                    }
                      if(i==data.length-1)
                      resolve(membersData);
                    }

                  })
              }

        const getAllFamilyMembers2 = (data,userId,total_generation_level,req,family_tree,members_ids,transaction) => {
                let membersData = []
                  return new Promise(async function(resolve, reject){
                  for (var i = 0; i < data.length; i++) {
                      console.log('data');
                      console.log(data[i]);
                      let { id,registered_id,name,countryCode,mobile,image,parent,isMarried,family_tree,spouseId,registered_user_details } = data[i];
                      total_generation_level++;
                      let spouse_query = {spouseId:id,status:true,family_tree,added_by:"manual"}
                      let spouse_details = await FamilyService().fetchSpouse(spouse_query, transaction);

                      if(members_ids.indexOf(id)==-1){
                      let member_relation_result = await FamilyService().fetchFamilyRelation({[Op.or]:[{member_1:req.authUser.member_id,member_2:id},{member_1:id,member_2:req.authUser.member_id}]}, transaction);

                      let member_relation = member_relation_result?member_relation_result.member_1==req.authUser.member_id?member_relation_result.member_1_relation_with_member_2:member_relation_result.member_2_relation_with_member_1:null;
                      let query = null;
                      if(spouse_details) query = {[Op.or]:[{parent:spouse_details.id},{parent:id}],status:true,family_tree,added_by:"manual",spouseId:null}
                      else query = {parent:id,status:true,family_tree,added_by:"manual",spouseId:null}

                      let child_family_member = await FamilyService().fetchFamilyMemberByQuery(query,null,null, transaction);

                      let spouse_relation =null;
                      let flag = true;

                      let childCount = child_family_member.count;
                      let childData = child_family_member.rows;
                      if(spouse_details){
                        let spouse_relation_result = await FamilyService().fetchFamilyRelation({[Op.or]:[{member_1:req.authUser.member_id,member_2:spouse_details.id},{member_1:spouse_details.id,member_2:req.authUser.member_id}]}, transaction);
                        spouse_relation = spouse_relation_result?spouse_relation_result.member_1==req.authUser.member_id?spouse_relation_result.member_1_relation_with_member_2:spouse_relation_result.member_2_relation_with_member_1:null;
                        if(members_ids.indexOf(spouse_details.id)!=-1) flag = await false;

                        await members_ids.push(spouse_details.id);
                      }
                      //if(childData.length==0) membersData['total_generation_level'] = await total_generation_level;
                      if(members_ids.indexOf(id)!=-1)flag = false;

                      if(flag==true){
                        if(childData.length>0) childData = await getAllFamilyMembers2(childData,userId,total_generation_level,req,family_tree,members_ids,transaction);

                        members_ids.push(id);
                        membersData.push({id,registered_id,registered_user_details,family_tree,name,countryCode,mobile,image,parent,isMarried,member_relation,spouse_relation,spouse_details,childCount,childData});
                      }
                    }
                      if(i==data.length-1)
                      resolve(membersData);
                    }

                  })
              }


        const getFamilyMemberList = async (req, res, next, transaction) => {
          console.log("FamilyController=>getFamilyMembers");
            let { userId,family_tree} = req.body;
            //let user_tree_data = await FamilyService().fetchUsersFamilyTree({userId}, transaction);
            //let family_tree = user_tree_data.active_tree;
            //let family_tree_data = await FamilyService().fetchFamilyTree({id:family_tree}, transaction);
            let { page,limit,search,status,is_only_registered } = req.query;
            let query={family_tree,added_by:"manual",[Op.or]:[{registered_id: {[Op.not]: userId}},{registered_id: null}]};
            if(search) query.name={[Op.like]:'%'+search+'%'};
            if(status) query.status = status;
            if(is_only_registered==1) query.registered_id =  await {[Op.ne]: null};
            let family_member = await FamilyService().fetchFamilyMemberByQuery(query,page,limit, transaction);
            let total_member = family_member.count;
            let members = family_member.rows;
            req.rData = { page,limit,search,total_member,members };
            next();


          }

        const changeMemberStatus = async (req, res, next, transaction) => {
            console.log("FamilyController => changeMemberStatus");
            let { userId,status,memberId } = req.body;
            let member = {status};
            console.log(status);
            let update_result = await FamilyService().updateFamilyMemberProfile({id:memberId},member, transaction);

            req.msg = 'status_changed';
            next();


          }

          const removeMember = async (req, res, next, transaction) => {
              console.log("FamilyController => removeMember");
              let { userId,memberId } = req.body;
              let member_details = await FamilyService().fetchFamilyMember(memberId, transaction);
              let {spouseId} = member_details;
              let activity = req.authUser.name+" has removed "+member_details.name+" from the family";

              let activity_data = {userId,activity}
              let user_log_result = await FamilyService().addUserActivity(activity_data, transaction);
              let child_query = {parent:memberId};
              if(spouseId) child_query = {[Op.or]:[{parent:memberId},{parent:spouseId}]};
              let child_member = await FamilyService().fetchFamilyMemberByQuery(child_query,null,null, transaction);
              let childData = child_member.rows;
              console.log('childData');
              console.log(childData);
              if(childData.length>0) childData = await removeAllChildMembers(userId,req,childData,transaction);
              if(member_details.registered_id!=member_details.userId){

                let update_result = await FamilyService().removeMember({id:memberId}, transaction);
                let spouse_query = {spouseId:memberId};
                if(spouseId) spouse_query = {[Op.or]:[{spouseId:memberId},{id:spouseId}]};
                let delete_spouse_result = await FamilyService().removeMember(spouse_query, transaction);
                let remove_result = await removeMemberFromChat(userId,member_details.registered_id,transaction)
                if(member_details.registered_id!=null) tree_validate_result = await validateFamilyTreeForRemovedMember(req,member_details.registered_id,memberId,member_details.family_tree,transaction);
              }else {
                let update_result = await FamilyService().updateFamilyMemberProfile({id:member_details.id},{added_by:"default",parent:null}, transaction);

              }
              req.msg = 'member_removed';
              next();


            }

            const removeAllChildMembers = (userId,req,data,transaction) => {
              return new Promise(async function(resolve, reject){
              for (var i = 0; i < data.length; i++) {

                  let { id,registered_id,name,countryCode,mobile,image,parent,isMarried,partner_name,partner_image,family_tree,spouseId } = data[i];

                  let query = {parent:id}
                  let child_query = {parent:id};
                  if(spouseId) child_query = {[Op.or]:[{parent:id},{parent:spouseId}]};
                  console.log("removeAllChildMembers");
                  console.log(child_query);
                  let child_member = await FamilyService().fetchFamilyMemberByQuery(child_query,null,null, transaction);

                  let activity = req.authUser.name+" has removed "+name+" from the family tree";

                  let activity_data = {userId,activity}
                  let user_log_result = await FamilyService().addUserActivity(activity_data, transaction);

                  let childCount = child_member.count;
                  let childData = child_member.rows;

                  let delete_result = await FamilyService().removeMember({id}, transaction);
                  let spouse_query = {spouseId:id};
                  if(spouseId) spouse_query = {[Op.or]:[{spouseId:id},{id:spouseId}]};
                  let delete_spouse_result = await FamilyService().removeMember(spouse_query, transaction);
                  let remove_result = await removeMemberFromChat(userId,registered_id,transaction)
                  if(registered_id!=null) tree_validate_result = await validateFamilyTreeForRemovedMember(req,registered_id,id,family_tree,transaction);
                  if(childData.length>0) childData = await removeAllChildMembers(req,childData,transaction);
                  //if(childData.length==0) membersData['total_generation_level'] = await total_generation_level;

                  if(i==data.length-1)
                  resolve(true);
                }

              })
          }

          const removeMemberFromChat = async (userId,registered_id,transaction) =>{
            let family_tree_data = await FamilyService().fetchUsersFamilyTree({userId}, transaction);
            let family_tree=family_tree_data.active_tree;
            let group_data = await TwilioService().getGroupList({userId,family_tree},null,null,transaction);
            for (var i = 0; i < group_data.length; i++) {
              let {id,group_sid} = group_data[i];
              let participants_details = await TwilioService().getParticipantsByQuery({group_id:id,member_id:registered_id},transaction);
              if(participants_details.length>0){
                try {
                  if(participants_details[0].member_sid){
                    let member_result = await TwilioService().fetchChannelParticipants(group_sid,participants_details[0].member_sid,transaction);
                    console.log("member_result");
                    console.log(member_result);
                    if(member_result){
                      let result = await TwilioService().removeParticipants(group_sid,participants_details[0].member_sid,transaction);
                    }
                  }
                } catch (e) {
                  console.log("Something went wrong");
                  console.log(e);
                }

                let result2 = await TwilioService().removeGroupMember({id:participants_details[0].id},transaction);


              }
            }
          }

          const validateFamilyTreeForRemovedMember = async (req,userId,memberId,family_tree,transaction) =>{
            let user_family_tree = await FamilyService().fetchUsersFamilyTree({userId}, transaction);

            let update_data = null;
            if(user_family_tree){
              let name = family_tree==user_family_tree.family_tree_1?"Family Tree 2":"Family Tree 1";

              let family_tree_result = await FamilyService().addFamilyTree({userId,name}, transaction);

              if(family_tree==user_family_tree.family_tree_1){

                update_data = {family_tree_2:family_tree_result.id,active_tree:user_family_tree.family_tree_2}
              }else {
                update_data = {family_tree_1:family_tree_result.id,active_tree:user_family_tree.family_tree_1}

              }
              let member = { userId,family_tree:family_tree_result.id,registered_id:userId, name:req.authUser.name,countryCode:req.authUser.countryCode ,mobile:req.authUser.mobile ,image:req.authUser.image,added_by:"default"};
              let member_result = await FamilyService().addFamilyMember(member, transaction);
              let update_result = await FamilyService().updateUsersFamilyTree({id:user_family_tree.id},update_data, transaction);
            }
          }

        const switchFamilyTree = async (req, res, next, transaction) => {
          console.log("FamilyController => switchFamilyTree");
          let { userId,active_tree } = req.body;
          let data = {active_tree};
          let update_result = await FamilyService().updateUsersFamilyTree({userId},data, transaction);

          req.msg = 'family_tree_switched';
          next();


        }

        const getFamilyTree = async (req, res, next, transaction) => {
          console.log("FamilyController => switchFamilyTree");
          let { userId } = req.body;

          let user_family_tree = await FamilyService().fetchUsersFamilyTree({userId}, transaction);
          console.log('user_family_tree');
          console.log(user_family_tree);
          let family_tree_1 = user_family_tree.family_tree_1_details?user_family_tree.family_tree_1_details.name:null;
          let family_tree_1_id = user_family_tree.family_tree_1_details?user_family_tree.family_tree_1_details.id:null;
          let family_tree_2 = user_family_tree.family_tree_2_details?user_family_tree.family_tree_2_details.name:null;
          let family_tree_2_id = user_family_tree.family_tree_2_details?user_family_tree.family_tree_2_details.id:null;
          req.rData = {family_tree:{family_tree_1,family_tree_1_id,family_tree_2,family_tree_2_id,active_tree:user_family_tree.active_tree}}
          req.msg = 'family_tree';
          next();
        }

        const editFamilyTree = async (req, res, next, transaction) => {
          console.log("FamilyController => changeMemberStatus");
          let { userId,family_tree_id,family_tree_name } = req.body;
          let tree = {name:family_tree_name};
          let update_result = await FamilyService().updateFamilyTree({id:family_tree_id},tree, transaction);
          let user_family_tree = await FamilyService().fetchUsersFamilyTree({userId}, transaction);
          let update_group_data = await TwilioService().updateGroupDetails({isDefaultGroup:1,family_tree:family_tree_id},{group_name:family_tree_name},transaction);
          let family_tree_1 = user_family_tree.family_tree_1_details?user_family_tree.family_tree_1_details.name:null;
          let family_tree_1_id = user_family_tree.family_tree_1_details?user_family_tree.family_tree_1_details.id:null;
          let family_tree_2 = user_family_tree.family_tree_2_details?user_family_tree.family_tree_2_details.name:null;
          let family_tree_2_id = user_family_tree.family_tree_2_details?user_family_tree.family_tree_2_details.id:null;
          req.rData = {family_tree:{family_tree_1,family_tree_1_id,family_tree_2,family_tree_2_id,active_tree:user_family_tree.active_tree}}
          req.msg = 'family_tree_updated';
          next();
        }
        const updateFamilyRelation = async (req, res, next, transaction) => {
            console.log("FamilyController => updateFamilyRelation");
            let { userId,relationship_name,memberId } = req.body;

            let exist_result = await FamilyService().fetchFamilyRelation({member_1:req.authUser.member_id,member_2:memberId}, transaction);
            if(exist_result){
              member_relation_result = await FamilyService().updateFamilyRelation({id:exist_result.id},{member_1_relation_with_member_2:relationship_name}, transaction);
            }else {
              member_relation_result = await FamilyService().updateFamilyRelation({member_2:req.authUser.member_id,member_1:memberId},{member_2_relation_with_member_1:relationship_name}, transaction);
            }
            req.msg = 'relation_updated';
            next();
          }

        const removeFamilyTree = async (req, res, next, transaction) => {
          console.log("FamilyController => changeMemberStatus");
          let { userId,family_tree_id } = req.body;
          let user_family_tree = await FamilyService().fetchUsersFamilyTree({userId}, transaction);
          let active_tree = null;
          let update_data = {};
          if(user_family_tree.family_tree_1==family_tree_id){
            active_tree = await user_family_tree.active_tree==family_tree_id?user_family_tree.family_tree_2:user_family_tree.family_tree_1;
            update_data = {family_tree_1:null,active_tree}
          }else {
            active_tree = await user_family_tree.active_tree==family_tree_id?user_family_tree.family_tree_1:user_family_tree.family_tree_2;
            update_data = {family_tree_2:null,active_tree}
          }
          let update_result = await FamilyService().updateUsersFamilyTree({id:user_family_tree.id},update_data, transaction);
          let remove_result = await FamilyService().removeFamilyTree({userId,id:family_tree_id}, transaction);

          req.msg = 'family_tree_removed';
          next();
        }

    return {
      addFamilyMembers,
      getFamilyMembers,
      getFamilyMemberList,
      changeMemberStatus,
      removeMember,
      switchFamilyTree,
      getFamilyTree,
      editFamilyTree,
      removeFamilyTree,
      updateFamilyRelation,
      addMemberInDefaultChatGroup
    }
}
