const AlarmService = require("../services/AlarmService");
const helpers = require("../util/helpers");

module.exports = () => {
  const addAlarm = async (req, res, next, transaction) => {
    console.log("AlarmController => addAlarm");
    let { alarm_type ,file,time ,userId,is_repeat,days,alarmId } = req.body;

    let alarm_data = {alarm_type ,file,time ,userId,is_repeat,days};

    if(!alarmId){
      let result = await AlarmService().add(alarm_data, transaction);
      alarmId = result.id;
      msg = "alarm_added";
    }else {
      result = await AlarmService().update(alarmId,alarm_data, transaction);
      msg = "alarm_updated";
    }
    alarm = await AlarmService().fetch(alarmId,transaction);

    req.rData = { alarm };
    req.msg = msg;

    next();
}

const deleteAlarm = async (req, res, next, transaction) => {
  console.log("AlarmController => delete");
  let { userId,alarmId } = req.body;

  let query = {userId,id:alarmId};
  let result = await AlarmService().deleteAlarm(query, transaction);
  req.msg = "alarm_deleted";
  next();
}


const getAlarm = async (req, res, next, transaction) => {
  console.log("AlarmController=>alarmList");
    let { userId  } = req.body;

    let query = { userId } ;

    data = await AlarmService().getList(query,transaction);

    let total = data.count;
    let alarm = data.rows;
    req.rData = { total, alarm };
    req.msg = 'alarm_list';
    next();


  }

  const setAlarmStatus = async (req, res, next, transaction) => {
    console.log("AlarmController => setAlarmStatus");
    let { userId,alarmId,status } = req.body;

    let query = {userId,id:alarmId,status};
    let result = await AlarmService().update(alarmId, {status}, transaction);
    req.msg = "alarm_updated";
    next();
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

    return {
      addAlarm,
      deleteAlarm,
      getAlarm,
      setAlarmStatus
    }
}
