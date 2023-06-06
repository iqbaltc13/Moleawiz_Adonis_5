'use strict'
const Excel                = require('exceljs')
const CohortMember         = use('App/Models/CohortMember')
const User                 = use('App/Models/User')
const UserInfoDatum        = use('App/Models/UserInfoDatum')
const DaaReminder          = use('App/Models/DaaReminder')
const DaaReminderSetting   = use('App/Models/DaaReminderSetting')

class ImportService {
  static async ImportCohortMember(filelocation, cohortid) {
    var cohortId = cohortid;
    var workbook = new Excel.Workbook()
    var readWorksheet = await workbook.csv.readFile(filelocation);
    console.log(readWorksheet.name);
    await workbook.csv.readFile(filelocation)
    .then(function() {
        var worksheet = workbook.getWorksheet(readWorksheet.name);

      worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {

          let getUser = User.findBy('username', row.values[1]).then(function(result) {
            if (result) {
              let inputCohortMember = {
                  userid: result.id ,
                  cohortid: cohortId
                };

              let cohortMember = CohortMember.findOrCreate(
                inputCohortMember,
                { userid: result.id, cohortid: cohortId, timeadded : Date.now() }
              );
            }
          });

          //console.log(cohortMember);
        });
    });

  }
  static async ImportUser(filelocation, delimiter) {

    var workbook      = new Excel.Workbook()
    var strDelimiter  = ";"
    var readWorksheet = await workbook.csv.readFile(filelocation);
    console.log(readWorksheet);
    let users = [];
    let inputUsers = [];

    if (delimiter == "comma") {
      strDelimiter = ",";
    }
    else if (delimiter == "semicolon") {
      strDelimiter = ";";
    }
    else if (delimiter == "colon") {
      strDelimiter = ":";
    }
    await workbook.csv.readFile(filelocation)
    .then(function() {
        var worksheet = workbook.getWorksheet(readWorksheet.name);

        worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
          if(rowNumber > 1){
            //console.log(row.values);
            let extractRowValues = row.values[1].split(strDelimiter);
            console.log(strDelimiter);
            console.log(extractRowValues);

            let inputUser = {
              username         : extractRowValues[0],
              firstname        : extractRowValues[1],
              lastname         : extractRowValues[2],
              email            : extractRowValues[3],
              password         : extractRowValues[4],
              city             : extractRowValues[5],
              country          : extractRowValues[6],
              phone2           : extractRowValues[7],
              directorate      : extractRowValues[8],
              subdirectorate   : extractRowValues[9],
              group            : extractRowValues[10],
              division         : extractRowValues[11],
              superior         : extractRowValues[12],
              department       : extractRowValues[13],
              position         : extractRowValues[14],
              //joindate: extractRowValues[15] ? extractRowValues[15].split('/').reverse().join('-') : null,
              //joindate         : extractRowValues[15] ? extractRowValues[15].replace('/','-') : null,
            };

            let user = User.findOrCreate(
              {username : extractRowValues[0]},
              inputUser
            ).then(function (result) {
              //console.log(result);
              if (result) {
                let updateOrCreateInfoDataPhone = UserInfoDatum.updateOrCreate({userid: result.id , fieldid : 1},{userid: result.id , fieldid : 1, data:result.phone2 });
                let updateOrCreateInfoDataSubdirectorate = UserInfoDatum.updateOrCreate({userid: result.id , fieldid : 2},{ data:result.subdirectorate });
                let updateOrCreateInfoDataGroup = UserInfoDatum.updateOrCreate({userid: result.id , fieldid : 3},{ data:result.group });
                let updateOrCreateInfoDataDivision = UserInfoDatum.updateOrCreate({userid: result.id , fieldid : 4},{ data:result.division });
                let updateOrCreateInfoDataSuperior = UserInfoDatum.updateOrCreate({userid: result.id , fieldid : 5},{ data:result.superior });
                let updateOrCreateInfoDataDepartment = UserInfoDatum.updateOrCreate({userid: result.id , fieldid : 6},{ data:result.department  });
                let updateOrCreateInfoDataPosition = UserInfoDatum.updateOrCreate({userid: result.id , fieldid : 7},{ data:result.position });
                let updateOrCreateInfoDataDirectorate = UserInfoDatum.updateOrCreate({userid: result.id , fieldid : 11},{ data:result.directorate });
                let updateOrCreateInfoDataJoindate = UserInfoDatum.updateOrCreate({userid: result.id , fieldid : 12},{ data:result.joindate });
              }
            });

            users.push(user);
            inputUsers.push(inputUser);
          }

          //console.log(cohortMember);
        });
    });


    //console.log(inputUsers);

    // inputUsers.forEach(function (inputUser) {
    //   let getUser = User.findBy('username', inputUser.username).then(function(result) {
    //     if (result) {

    //     }
    //   });
    //   //cohort.timecreated_ymd = new Date(cohort.timecreated*1000)
    //   console.log(getUser);
    // })


  }

  static async ImportUserPreview(filelocation, delimiter, totalPreview) {

    var workbook      = new Excel.Workbook()
    var strDelimiter  = ";"
    var readWorksheet = await workbook.csv.readFile(filelocation);
    let users = [];
    let inputUsers = [];

    if (delimiter == "comma") {
      strDelimiter = ",";
    }
    else if (delimiter == "semicolon") {
      strDelimiter = ";";
    }
    else if (delimiter == "colon") {
      strDelimiter = ":";
    }
    await workbook.csv.readFile(filelocation)
    .then(function() {
        var worksheet = workbook.getWorksheet(readWorksheet.name);

        worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
          if(rowNumber > 1){

            let extractRowValues = row.values[1].split(strDelimiter);


            let inputUser = {
              username         : extractRowValues[0],
              firstname        : extractRowValues[1],
              lastname         : extractRowValues[2],
              email            : extractRowValues[3],
              password         : extractRowValues[4],
              city             : extractRowValues[5],
              country          : extractRowValues[6],
              phone2           : extractRowValues[7],
              directorate      : extractRowValues[8],
              subdirectorate   : extractRowValues[9],
              group            : extractRowValues[10],
              division         : extractRowValues[11],
              superior         : extractRowValues[12],
              department       : extractRowValues[13],
              position         : extractRowValues[14],

              joindate         : extractRowValues[15] ? extractRowValues[15].replace('/','-') : null,
            };

            inputUsers.push(inputUser);
          }



        });
    });

    return inputUsers;
  }

  static async ImporSyncActivetUser(filelocation) {

    var workbook = new Excel.Workbook()
    var readWorksheet = await workbook.csv.readFile(filelocation);

    await workbook.csv.readFile(filelocation)
    .then(function() {
        var worksheet = workbook.getWorksheet(readWorksheet.name);

        worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
          let getUser = User.findBy('username', row.values[1]).then(function(result) {
            if (result) {
              if (('1' == result.suspended || 1 == result.suspended) && ('1' == result.deleted || 1 == result.deleted)) {
                result.suspended = 0;
                result.deleted = 0;
              }
              if(('0' == result.suspended || 0 == result.suspended) && ('0' == result.deleted || 0 == result.deleted)){
                result.suspended = 1;
                result.deleted = 1;
              }
              result.save();
            }
          });
          //console.log(cohortMember);
        });
    });

  }

  static async ImportReminderSetting(filelocation, reminderId) {

    var workbook = new Excel.Workbook()

    var readWorksheet = await workbook.xlsx.readFile(filelocation);
    let datasUploadSetting  = [];

    await workbook.xlsx.readFile(filelocation)
    .then(function() {
        var worksheet = workbook.getWorksheet(readWorksheet.name);
        let create = null;
        worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
          if (rowNumber > 1) {
            create = new DaaReminderSetting();
            create.notif_date = row.values[1];
            if (row.values[2] != null) {
              if (row.values[2].toLowerCase().includes("push")) {
                create.notif_type = 1;
              }
              else if (row.values[2].toLowerCase().includes("email")) {
                create.notif_type = 2;
              }
              else if (row.values[2].toLowerCase().includes("all")) {
                create.notif_type = 3;
              }
              else {
                create.notif_type = 0;
              }

            }

             if (row.values[3] != null) {
              if (row.values[3].toLowerCase().includes("no")) {
                create.send_spv  = 0;
              }
              else if (row.values[3].toLowerCase().includes("yes")) {
                create.send_spv  = 1;
              }

              else {
                create.send_spv  = 0;
              }

            }
            if (row.values[4] != null) {
              if (row.values[4].toLowerCase().includes("no")) {
                create.send_nha  = 0;
              }
              else if (row.values[4].toLowerCase().includes("yes")) {
                create.send_nha  = 1;
              }

              else {
                create.send_nha  = 0;
              }

            }

            if (row.values[5] != null) {
              if (row.values[5].toLowerCase().includes("no")) {
                create.visible   = 0;
              }
              else if (row.values[5].toLowerCase().includes("yes")) {
                create.visible   = 1;
              }

              else {
                create.visible   = 0;
              }

            }

            create.reminder_id = reminderId;
            create.save();

            datasUploadSetting.push(create);
            console.log(create)
          }

        })

    });


    return datasUploadSetting;
  }

  static async ImportLearnerBuddy(filelocation, delimiter) {

    var workbook      = new Excel.Workbook()
    var strDelimiter  = ";"
    var readWorksheet = await workbook.csv.readFile(filelocation);
    let learnersId = [];
    let inputUsers = [];


    await workbook.csv.readFile(filelocation)
    .then(function() {
        var worksheet = workbook.getWorksheet(readWorksheet.name);

        worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {

             if (rowNumber > 0) {
                let extractRowValues = row.values[1];
                //console.log(strDelimiter);
                //console.log(extractRowValues);

                learnersId.push(extractRowValues);

             }






          //console.log(cohortMember);
        });
    });

    return learnersId;
  }
}

module.exports = ImportService
