'use strict'
const Excel                = require('exceljs')
const User                 = use('App/Models/User')
const DaaChallengeBuddy    = use('App/Models/DaaChallengeBuddy')

class ExportService {
  constructor() {
    this.column_name = [
      '','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
      'AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ','AK','AL','AM','AN','AO','AP','AQ','AR','AS','AT','AU','AV','AW','AX','AY','AZ',
      'BA','BB','BC','BD','BE','BF','BG','BH','BI','BJ','BK','BL','BM','BN','BO','BP','BQ','BR','BS','BT','BU','BV','BW','BX','BY','BZ',
      'CA','CB','CC','CD','CE','CF','CG','CH','CI','CJ','CK','CL','CM','CN','CO','CP','CQ','CR','CS','CT','CU','CV','CW','CX','CY','CZ',
      'DA','DB','DC','DD','DE','DF','DG','DH','DI','DJ','DK','DL','DM','DN','DO','DP','DQ','DR','DS','DT','DU','DV','DW','DX','DY','DZ',
      'EA','EB','EC','ED','EE','EF','EG','EH','EI','EJ','EK','EL','EM','EN','EO','EP','EQ','ER','ES','ET','EU','EV','EW','EX','EY','EZ',
      'FA','FB','FC','FD','FE','FF','FG','FH','FI','FJ','FK','FL','FM','FN','FO','FP','FQ','FR','FS','FT','FU','FV','FW','FX','FY','FZ',
      'GA','GB','GC','GD','GE','GF','GG','GH','GI','GJ','GK','GL','GM','GN','GO','GP','GQ','GR','GS','GT','GU','GV','GW','GX','GY','GZ',
      'HA','HB','HC','HD','HE','HF','HG','HH','HI','HJ','HK','HL','HM','HN','HO','HP','HQ','HR','HS','HT','HU','HV','HW','HX','HY','HZ',
      'IA','IB','IC','ID','IE','IF','IG','IH','II','IJ','IK','IL','IM','IN','IO','IP','IQ','IR','IS','IT','IU','IV','IW','IX','IY','IZ',
      'JA','JB','JC','JD','JE','JF','JG','JH','JI','JJ','JK','JL','JM','JN','JO','JP','JQ','JR','JS','JT','JU','JV','JW','JX','JY','JZ'
    ];
  }
  static async ExportLearnerBuddyToCSV(arrUsername){




  }

  static async ExportLearnerBuddyToExcel(arrUsername){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet("Learners Buddy"); // New Worksheet
    //const path = "./export";  // Path to download excel
    // Column for data in excel. key must match data key
    worksheet.columns = [
      { header: "Learners NIP", key: "learners_nip", width: 20 },
      { header: "Learners Name", key: "learners_name", width: 20 },
      { header: "Buddy NIP", key: "buddy_nip", width: 20 },
      { header: "Buddy Name", key: "buddy_name", width: 20 },

    ];

    let getUsernames = await User.query().select('username','id').whereIn('username',arrUsername).fetch();
    let datas = await DaaChallengeBuddy.query()
                .with('user')
                .with('buddy')
                .whereIn('learnerid',getUsernames.rows.map(res => res.id))
                .whereNull('deleted_at').fetch();

    // Looping through User data
    let counter = 1;
    datas.rows.forEach((data) => {
      if (data.getRelated('user') && data.getRelated('buddy')) {
        worksheet.addRow([data.getRelated('user').username, data.getRelated('user').firstname + ' ' + data.getRelated('user').lastname, data.getRelated('buddy').username, data.getRelated('buddy').firstname + ' ' + data.getRelated('buddy').lastname]); // Add data in worksheet
      }
    });
    // Making first line in excel bold
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    const today       = new Date();
    const date        = today.getFullYear()+'_'+(today.getMonth()+1)+'_'+today.getDate();
    const time        = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds()+'_'+today.getMilliseconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/export_learner_buddy_"+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : "export_learner_buddy_"+dateTime+".xlsx",
      fullpath : "public/export/export_learner_buddy_"+dateTime+".xlsx"
    }

    return result;

  }

  static async ExportRegisteredLearnersToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= params.table_heads.length; i++) {
      if (i == 1) {
        worksheet.getColumn(i).width = 10;
      }
      else if (i == 2) {
        worksheet.getColumn(i).width = 15;
      }
      else if (i == 9 || i == 10) {
        worksheet.getColumn(i).width = 20;
      }
      else {
        worksheet.getColumn(i).width = 50;
      }

    }
    //worksheet.columns = params.table_heads
    console.log(params.table_heads.map(res => res.header));
    worksheet.getRow(7).values = params.table_heads.map(res => res.header);
    worksheet.getRow(7).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });


    // Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = 8;
    datas.forEach((data) => {

      worksheet.getRow(startRowData).values = [
        counter,
        data.nip,
        data.myname.toUpperCase(),
        data.email,
        data.directorate.toUpperCase(),
        data.subdirectorate.toUpperCase(),
        data.positions,
        data.journey_name.toUpperCase(),
        data.enrolledDate.getFullYear() + '-' + (data.enrolledDate.getMonth() + 1) + '-' + data.enrolledDate.getDate(),
        data.enrolledDate.toTimeString().split(' ')[0]]; // Add data in worksheet
        counter++;
        startRowData++;
    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }

  static async ExportLearnerAccessToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= 26; i++) {
      if (i == 1 || i==26) {
        worksheet.getColumn(i).width = 15;
      }
      else {
        worksheet.getColumn(i).width = 10;
      }

    }
    //worksheet.columns = params.table_heads
    console.log(params.table_heads.map(res => res.header));

    worksheet.getRow(4).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });
     worksheet.getRow(4).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
     });

    worksheet.mergeCells('A4:A5');
    worksheet.mergeCells('B4','Y4');
    worksheet.mergeCells('Z4:Z5');
    worksheet.getCell('A4').value = params.table_heads[0].header;
    worksheet.getCell('B4').value = params.table_heads[1].header;
    worksheet.getCell('Z4').value = params.table_heads[2].header;
    worksheet.getCell('A4').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('B4').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('Z4').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A4').border = {
      top: { style: "thick" },
      left: { style: "thick" },
      bottom: { style: "thick" },
      right: { style: "thick" }
    };
    worksheet.getCell('B4').border = {
      top: { style: "thick" },
      left: { style: "thick" },
      bottom: { style: "thick" },
      right: { style: "thick" }
    };
    worksheet.getCell('Z4').border = {
      top: { style: "thick" },
      left: { style: "thick" },
      bottom: { style: "thick" },
      right: { style: "thick" }
    };
    worksheet.getCell('A4').font = { bold: true };
    worksheet.getCell('B4').font = { bold: true };
    worksheet.getCell('Z4').font = { bold: true };

    //worksheet.getRow(4).values = params.table_heads.map(res => res.header);
    worksheet.getCell('Z4').alignment = { wrapText: true };
    let strColumns = "BCDEFGHIJKLMNOPQRSTUVWXY";
    for (let i = 0; i < params.table_heads_child.length; i++) {
      worksheet.getCell(strColumns[i] + '5').value = params.table_heads_child[i];
      worksheet.getCell(strColumns[i] + '5').font = { bold: true };
      worksheet.getCell(strColumns[i] + '5').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell(strColumns[i] + '5').border = { top: { style: "thick" }, left: { style: "thick" }, bottom: { style: "thick" }, right: { style: "thick" }};
    }


    //Looping through  datas
    let counter = 1;
    let datas = params.datas;
    let startRowData = 6;
    let lastRow = datas.length + startRowData - counter;
    datas.forEach((data) => {
        if (startRowData == 6) {
          worksheet.getRow(startRowData).values = [data.access_date,data.h0,data.h1,data.h2,data.h3,data.h4,data.h5,data.h6,data.h7,data.h8,data.h9,data.h10,data.h11,data.h12,data.h13,data.h14,data.h15,data.h16,data.h17,data.h18,data.h19,data.h20,data.h21,data.h22,data.h23,data.total_user ];
          worksheet.getRow(startRowData).eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
              //top: { style: "thick" },
              left: { style: "medium" },
              bottom: { style: "medium" },
              right: { style: "medium" }
            };
          });
        }
        if (startRowData == lastRow) {
          worksheet.getRow(startRowData).values = ['Σ Users',data.h0,data.h1,data.h2,data.h3,data.h4,data.h5,data.h6,data.h7,data.h8,data.h9,data.h10,data.h11,data.h12,data.h13,data.h14,data.h15,data.h16,data.h17,data.h18,data.h19,data.h20,data.h21,data.h22,data.h23,data.total_user ];
          worksheet.getRow(startRowData).eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
              //top: { style: "medium" },
              left: { style: "medium" },
              bottom: { style: "medium" },
              right: { style: "medium" }
            };
          });
        }
        if(startRowData != lastRow && startRowData != 6 ){
          worksheet.getRow(startRowData).values = [data.access_date,data.h0,data.h1,data.h2,data.h3,data.h4,data.h5,data.h6,data.h7,data.h8,data.h9,data.h10,data.h11,data.h12,data.h13,data.h14,data.h15,data.h16,data.h17,data.h18,data.h19,data.h20,data.h21,data.h22,data.h23,data.total_user ];
          worksheet.getRow(startRowData).eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
              top: { style: "medium" },
              left: { style: "medium" },
              bottom: { style: "medium" },
              right: { style: "medium" }
            };
          });
        }

         // Add data in worksheet
        counter++;
        startRowData++;
    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }

  static async ExportDetailOfLearnerAccesssToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= params.table_heads.length; i++) {

        worksheet.getColumn(i).width = params.table_heads[i-1].width;


    }
    //worksheet.columns = params.table_heads
    //console.log(params.table_heads.map(res => res.header));
    worksheet.getRow(4).values = params.table_heads.map(res => res.header);
    worksheet.getRow(4).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });


    // Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = 5;
    datas.forEach((data) => {

        worksheet.getRow(startRowData).values = [data.access_date, data.username,data.fullname.toUpperCase() ]; // Add data in worksheet
        counter++;
        startRowData++;
        worksheet.getRow(startRowData).eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            //top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
          cell.alignment = { wrapText: true };
        });
    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }

  static async ExportActiveLearnersToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= params.table_heads.length; i++) {

        worksheet.getColumn(i).width = params.table_heads[i-1].width;


    }
    //worksheet.columns = params.table_heads
    //console.log(params.table_heads.map(res => res.header));
    worksheet.getRow(4).values = params.table_heads.map(res => res.header);
    worksheet.getRow(4).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });


    // Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = 5;
    datas.forEach((data) => {

        worksheet.getRow(startRowData).values = [
          counter,
          data.nip,
          data.fullname.toUpperCase(),
          data.email,
          data.directorate.toUpperCase(),
          data.subdirectorate.toUpperCase(),
          data.positions.toUpperCase(),
          data.access_date.getDate()+'-'+(data.access_date.getMonth()+1)+'-'+data.access_date.getFullYear(),
          data.access_date.toTimeString().split(' ')[0]
        ]; // Add data in worksheet
        worksheet.getRow(startRowData).eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            //top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
          cell.alignment = { wrapText: true };
        });
        counter++;
        startRowData++;

    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }

  static async ExportLearningPointToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= params.table_heads.length; i++) {

        worksheet.getColumn(i).width = params.table_heads[i-1].width;


    }
    //worksheet.columns = params.table_heads
    //console.log(params.table_heads.map(res => res.header));
    worksheet.getRow(5).values = params.table_heads.map(res => res.header);
    worksheet.getRow(5).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });


    // Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = 6;
    datas.forEach((data) => {

        worksheet.getRow(startRowData).values = [
          counter,
          data.username,
          data.firstname.toUpperCase()+' '+data.lastname.toUpperCase(),
          data.email,
          data.directorate.toUpperCase(),
          data.subdirectorate.toUpperCase(),
          data.positions.toUpperCase(),
          data.total_point,
          data.badges_points,
          data.tot_point_approved,
          data.actual_point
        ]; // Add data in worksheet
        worksheet.getRow(startRowData).eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            //top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
          cell.alignment = { wrapText: true };
        });
        counter++;
        startRowData++;

    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }
  static async ExportCertificateNumberToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= params.table_heads.length; i++) {

        worksheet.getColumn(i).width = params.table_heads[i-1].width;


    }
    //worksheet.columns = params.table_heads
    //console.log(params.table_heads.map(res => res.header));
    worksheet.getRow(7).values = params.table_heads.map(res => res.header);
    worksheet.getRow(7).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });


    // Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = 8;
    datas.forEach((data) => {

        worksheet.getRow(startRowData).values = [
          counter,
          data.nip,
          data.fullname.toUpperCase(),
          data.directorate.toUpperCase(),
          data.subdirectorate.toUpperCase(),
          data.number_certificate.toUpperCase(),
          data.completed_date,
          data.score
        ]; // Add data in worksheet
        worksheet.getRow(startRowData).eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            //top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
          cell.alignment = { wrapText: true };
        });
        counter++;
        startRowData++;

    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }

  static async ExportCertificateNumberToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= params.table_heads.length; i++) {

        worksheet.getColumn(i).width = params.table_heads[i-1].width;


    }
    //worksheet.columns = params.table_heads
    //console.log(params.table_heads.map(res => res.header));
    worksheet.getRow(7).values = params.table_heads.map(res => res.header);
    worksheet.getRow(7).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });


    // Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = 8;
    datas.forEach((data) => {

        worksheet.getRow(startRowData).values = [
          counter,
          data.nip,
          data.fullname.toUpperCase(),
          data.directorate.toUpperCase(),
          data.subdirectorate.toUpperCase(),
          data.number_certificate.toUpperCase(),
          data.completed_date,
          data.score
        ]; // Add data in worksheet
        worksheet.getRow(startRowData).eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            //top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
          cell.alignment = { wrapText: true };
        });
        counter++;
        startRowData++;

    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }

  getColumnName(param){
    let columnIndex = Math.abs(param);

    // When using position comment the line above and uncomment the one below
    // $columnIndex = abs($columnIndex) - 1;

    let alphabet = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
        'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
        'Y', 'Z'
    ];

    // Recursive approach
    if(columnIndex >= 1 && columnIndex <= 26)
    {
        return alphabet[columnIndex -1 ];
    }
    else
    {
        // . is string conactenation in php
        // % is modulus

        return this.getColumnName(Math.floor(columnIndex / 26)) + this.getColumnName((columnIndex % 26));
    }
  }


  static async ExportLearningLogToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= params.table_heads.length; i++) {

        worksheet.getColumn(i).width = params.table_heads[i-1].width;


    }
    //worksheet.columns = params.table_heads
    //console.log(params.table_heads.map(res => res.header));
    worksheet.getRow(5).values = params.table_heads.map(res => res.header);
    worksheet.getRow(5).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });


    // Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = 6;
    datas.forEach((data) => {

        worksheet.getRow(startRowData).values = [
          counter,
          data.userid.toUpperCase(),
          data.journey.toUpperCase(),
          data.course.toUpperCase(),
          data.module.toUpperCase(),
          data.attempt,
          data.score,
          data.status.toUpperCase(),
          data.lates_module_page,
          data.time_end,
          data.duration
        ]; // Add data in worksheet
        worksheet.getRow(startRowData).eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            //top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
          cell.alignment = { wrapText: true };
        });
        counter++;
        startRowData++;

    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }
  static async ExportLearningHours1ToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= params.table_heads.length; i++) {

        worksheet.getColumn(i).width = params.table_heads[i-1].width;


    }
    //worksheet.columns = params.table_heads
    //console.log(params.table_heads.map(res => res.header));
    worksheet.getRow(params.headers.length+1).values = params.table_heads.map(res => res.header);
    worksheet.getRow(params.headers.length+1).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });


    // Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = params.headers.length+2;
    datas.forEach((data) => {

        worksheet.getRow(startRowData).values = data.row_values;
        worksheet.getRow(startRowData).eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            //top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
          cell.alignment = { wrapText: true };
        });
        counter++;
        startRowData++;

    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }

  static async ExportLearningHours2ToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= params.table_heads.length; i++) {

        worksheet.getColumn(i).width = params.table_heads[i-1].width;


    }
    let rowHeaderUp = params.headers.length + 1;
    let rowHeaderDown = params.headers.length + 2;
    let rowIndex      = [
      '','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
      'AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ','AK','AL','AM','AN','AO','AP','AQ','AR','AS','AT','AU','AV','AW','AX','AY','AZ',
      'BA','BB','BC','BD','BE','BF','BG','BH','BI','BJ','BK','BL','BM','BN','BO','BP','BQ','BR','BS','BT','BU','BV','BW','BX','BY','BZ',
      'CA','CB','CC','CD','CE','CF','CG','CH','CI','CJ','CK','CL','CM','CN','CO','CP','CQ','CR','CS','CT','CU','CV','CW','CX','CY','CZ',
      'DA','DB','DC','DD','DE','DF','DG','DH','DI','DJ','DK','DL','DM','DN','DO','DP','DQ','DR','DS','DT','DU','DV','DW','DX','DY','DZ',
      'EA','EB','EC','ED','EE','EF','EG','EH','EI','EJ','EK','EL','EM','EN','EO','EP','EQ','ER','ES','ET','EU','EV','EW','EX','EY','EZ',
      'FA','FB','FC','FD','FE','FF','FG','FH','FI','FJ','FK','FL','FM','FN','FO','FP','FQ','FR','FS','FT','FU','FV','FW','FX','FY','FZ',
      'GA','GB','GC','GD','GE','GF','GG','GH','GI','GJ','GK','GL','GM','GN','GO','GP','GQ','GR','GS','GT','GU','GV','GW','GX','GY','GZ',
      'HA','HB','HC','HD','HE','HF','HG','HH','HI','HJ','HK','HL','HM','HN','HO','HP','HQ','HR','HS','HT','HU','HV','HW','HX','HY','HZ',
      'IA','IB','IC','ID','IE','IF','IG','IH','II','IJ','IK','IL','IM','IN','IO','IP','IQ','IR','IS','IT','IU','IV','IW','IX','IY','IZ',
      'JA','JB','JC','JD','JE','JF','JG','JH','JI','JJ','JK','JL','JM','JN','JO','JP','JQ','JR','JS','JT','JU','JV','JW','JX','JY','JZ'
    ];
    for (let i = 0; i < params.table_heads.map(res => res.main_header).length; i++) {
      //worksheet.mergeCells('A4:A5');
      worksheet.mergeCells(rowIndex[i+1]+rowHeaderUp+":"+rowIndex[i+1]+rowHeaderDown);
      worksheet.getColumn(i+1).width = params.table_heads[i].main_header_width;

    }
    worksheet.getRow(rowHeaderUp).values = params.table_heads.map(res => res.main_header);
    let startIndexJourneyHeader = params.table_heads.map(res => res.main_header).length + 1;
    let endIndexJourneyHeader = startIndexJourneyHeader+ (params.table_heads_additional.map(res => res.journey_header).length*3);
    for (let i = startIndexJourneyHeader; i <= endIndexJourneyHeader; i++) {
      worksheet.getColumn(i).width = 20;
    }
    for (let i = 0; i < params.table_heads_additional.map(res => res.journey_header).length; i++) {

       worksheet.mergeCells(rowIndex[i+parseInt(startIndexJourneyHeader)]+rowHeaderUp+":"+rowIndex[i+startIndexJourneyHeader+2]+rowHeaderUp);
       worksheet.getCell(rowIndex[i+parseInt(startIndexJourneyHeader)]+rowHeaderUp).value = params.table_heads_additional[i].journey_header;
       worksheet.getCell(rowIndex[i+parseInt(startIndexJourneyHeader)]+rowHeaderUp).width = 150;
       worksheet.getCell(rowIndex[i+parseInt(startIndexJourneyHeader)] + rowHeaderDown).value = "Learning Hours";
       worksheet.getCell(rowIndex[i+parseInt(startIndexJourneyHeader)] + rowHeaderDown).alignment = { vertical: 'middle', horizontal: 'center' };
       worksheet.getCell(rowIndex[i+parseInt(startIndexJourneyHeader)+1] + rowHeaderDown).value = "Actual Duration";
       worksheet.getCell(rowIndex[i+parseInt(startIndexJourneyHeader)+1] + rowHeaderDown).alignment =  { vertical: 'middle', horizontal: 'center' };
       worksheet.getCell(rowIndex[i + parseInt(startIndexJourneyHeader) + 2] + rowHeaderDown).value = "Completions";
       worksheet.getCell(rowIndex[i + parseInt(startIndexJourneyHeader) + 2] + rowHeaderDown).alignment =  { vertical: 'middle', horizontal: 'center' };
       startIndexJourneyHeader += 2;
    }
    worksheet.getRow(rowHeaderUp).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });
     worksheet.getRow(rowHeaderDown).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });



    //Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = params.headers.length+3;
    datas.forEach((data) => {

        worksheet.getRow(startRowData).values = data.row_values;
        worksheet.getRow(startRowData).eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            //top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
          cell.alignment = { wrapText: true };
        });
        counter++;
        startRowData++;

    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }

   static async ExportDetailLearningHours1ToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= params.table_heads.length; i++) {

        worksheet.getColumn(i).width = params.table_heads[i-1].width;


    }
    //worksheet.columns = params.table_heads
    //console.log(params.table_heads.map(res => res.header));
    worksheet.getRow(params.headers.length+1).values = params.table_heads.map(res => res.header);
    worksheet.getRow(params.headers.length+1).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });


    // Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = params.headers.length+2;
    datas.forEach((data) => {

        worksheet.getRow(startRowData).values = data.row_values;
        worksheet.getRow(startRowData).eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            //top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
          cell.alignment = { wrapText: true };
        });
        counter++;
        startRowData++;

    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }
  static async ExportDetailLearningPointToExcel(params) {
    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= params.table_heads.length; i++) {

        worksheet.getColumn(i).width = params.table_heads[i-1].width;


    }
    //worksheet.columns = params.table_heads
    //console.log(params.table_heads.map(res => res.header));
    worksheet.getRow(params.headers.length+1).values = params.table_heads.map(res => res.header);
    worksheet.getRow(params.headers.length+1).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });


    // Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = params.headers.length+2;
    datas.forEach((data) => {

        worksheet.getRow(startRowData).values = data.row_values;
        worksheet.getRow(startRowData).eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            //top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
          cell.alignment = { wrapText: true };
        });
        counter++;
        startRowData++;

    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;
  }



  static async ExportSummaryLearningCompletionsToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= params.table_heads.length; i++) {

        worksheet.getColumn(i).width = params.table_heads[i-1].width;


    }
    let rowHeaderUp = params.headers.length + 1;
    let rowHeaderDown = params.headers.length + 2;
    let rowIndex      = [
      '','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
      'AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ','AK','AL','AM','AN','AO','AP','AQ','AR','AS','AT','AU','AV','AW','AX','AY','AZ',
      'BA','BB','BC','BD','BE','BF','BG','BH','BI','BJ','BK','BL','BM','BN','BO','BP','BQ','BR','BS','BT','BU','BV','BW','BX','BY','BZ',
      'CA','CB','CC','CD','CE','CF','CG','CH','CI','CJ','CK','CL','CM','CN','CO','CP','CQ','CR','CS','CT','CU','CV','CW','CX','CY','CZ',
      'DA','DB','DC','DD','DE','DF','DG','DH','DI','DJ','DK','DL','DM','DN','DO','DP','DQ','DR','DS','DT','DU','DV','DW','DX','DY','DZ',
      'EA','EB','EC','ED','EE','EF','EG','EH','EI','EJ','EK','EL','EM','EN','EO','EP','EQ','ER','ES','ET','EU','EV','EW','EX','EY','EZ',
      'FA','FB','FC','FD','FE','FF','FG','FH','FI','FJ','FK','FL','FM','FN','FO','FP','FQ','FR','FS','FT','FU','FV','FW','FX','FY','FZ',
      'GA','GB','GC','GD','GE','GF','GG','GH','GI','GJ','GK','GL','GM','GN','GO','GP','GQ','GR','GS','GT','GU','GV','GW','GX','GY','GZ',
      'HA','HB','HC','HD','HE','HF','HG','HH','HI','HJ','HK','HL','HM','HN','HO','HP','HQ','HR','HS','HT','HU','HV','HW','HX','HY','HZ',
      'IA','IB','IC','ID','IE','IF','IG','IH','II','IJ','IK','IL','IM','IN','IO','IP','IQ','IR','IS','IT','IU','IV','IW','IX','IY','IZ',
      'JA','JB','JC','JD','JE','JF','JG','JH','JI','JJ','JK','JL','JM','JN','JO','JP','JQ','JR','JS','JT','JU','JV','JW','JX','JY','JZ'
    ];
    for (let i = 0; i < params.table_heads.map(res => res.main_header).length; i++) {
      //worksheet.mergeCells('A4:A5');
      worksheet.mergeCells(rowIndex[i+1]+rowHeaderUp+":"+rowIndex[i+1]+rowHeaderDown);
      worksheet.getColumn(i+1).width = params.table_heads[i].width;

    }
    worksheet.getRow(rowHeaderUp).values = params.table_heads.map(res => res.header);
    let startIndexCourseHeader = params.table_heads.map(res => res.header).length + 1;
    let endIndexCourseHeader = startIndexCourseHeader+ (params.table_heads_additional.map(res => res.course_header).length*2);

    for (let i = 0; i < params.table_heads_additional.map(res => res.course_header).length; i++) {

       worksheet.mergeCells(rowIndex[i+parseInt(startIndexCourseHeader)]+rowHeaderUp+":"+rowIndex[i+startIndexCourseHeader+1]+rowHeaderUp);
       worksheet.getCell(rowIndex[i+parseInt(startIndexCourseHeader)]+rowHeaderUp).value = params.table_heads_additional[i].course_header;

       worksheet.getCell(rowIndex[i+parseInt(startIndexCourseHeader)] + rowHeaderDown).value = "Complete";
       worksheet.getColumn(i+parseInt(startIndexCourseHeader)).width = 50;
       worksheet.getCell(rowIndex[i+parseInt(startIndexCourseHeader)] + rowHeaderDown).alignment = { vertical: 'middle', horizontal: 'center' };
       worksheet.getCell(rowIndex[i+parseInt(startIndexCourseHeader)+1] + rowHeaderDown).value = "% Complete";
       worksheet.getColumn(i+parseInt(startIndexCourseHeader)+1).width = 50;
       worksheet.getCell(rowIndex[i+parseInt(startIndexCourseHeader)+1] + rowHeaderDown).alignment =  { vertical: 'middle', horizontal: 'center' };

       startIndexCourseHeader += 1;
    }


    for (let i = 0; i < params.table_heads_end.map(res => res.header).length; i++) {
      //worksheet.mergeCells('A4:A5');
      worksheet.mergeCells(rowIndex[i+parseInt(endIndexCourseHeader)]+rowHeaderUp+":"+rowIndex[i+parseInt(endIndexCourseHeader)]+rowHeaderDown);
      worksheet.getColumn(i+endIndexCourseHeader).width = params.table_heads_end[i].width;
      worksheet.getCell(rowIndex[i+parseInt(endIndexCourseHeader)] + rowHeaderUp).value = params.table_heads_end[i].header;

    }
    worksheet.getRow(rowHeaderUp).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });
     worksheet.getRow(rowHeaderDown).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });



    //Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = params.headers.length+3;
    datas.forEach((data) => {

        worksheet.getRow(startRowData).values = data.row_values;
        worksheet.getRow(startRowData).eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            //top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
          cell.alignment = { wrapText: true };
        });
        counter++;
        startRowData++;

    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }

  static async ExportContentLibraryCompletionsToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= params.table_heads.length; i++) {

        worksheet.getColumn(i).width = params.table_heads[i-1].width;


    }
    let rowHeaderUp = params.headers.length + 1;
    let rowHeaderDown = params.headers.length + 2;
    let rowIndex      = [
      '','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
      'AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ','AK','AL','AM','AN','AO','AP','AQ','AR','AS','AT','AU','AV','AW','AX','AY','AZ',
      'BA','BB','BC','BD','BE','BF','BG','BH','BI','BJ','BK','BL','BM','BN','BO','BP','BQ','BR','BS','BT','BU','BV','BW','BX','BY','BZ',
      'CA','CB','CC','CD','CE','CF','CG','CH','CI','CJ','CK','CL','CM','CN','CO','CP','CQ','CR','CS','CT','CU','CV','CW','CX','CY','CZ',
      'DA','DB','DC','DD','DE','DF','DG','DH','DI','DJ','DK','DL','DM','DN','DO','DP','DQ','DR','DS','DT','DU','DV','DW','DX','DY','DZ',
      'EA','EB','EC','ED','EE','EF','EG','EH','EI','EJ','EK','EL','EM','EN','EO','EP','EQ','ER','ES','ET','EU','EV','EW','EX','EY','EZ',
      'FA','FB','FC','FD','FE','FF','FG','FH','FI','FJ','FK','FL','FM','FN','FO','FP','FQ','FR','FS','FT','FU','FV','FW','FX','FY','FZ',
      'GA','GB','GC','GD','GE','GF','GG','GH','GI','GJ','GK','GL','GM','GN','GO','GP','GQ','GR','GS','GT','GU','GV','GW','GX','GY','GZ',
      'HA','HB','HC','HD','HE','HF','HG','HH','HI','HJ','HK','HL','HM','HN','HO','HP','HQ','HR','HS','HT','HU','HV','HW','HX','HY','HZ',
      'IA','IB','IC','ID','IE','IF','IG','IH','II','IJ','IK','IL','IM','IN','IO','IP','IQ','IR','IS','IT','IU','IV','IW','IX','IY','IZ',
      'JA','JB','JC','JD','JE','JF','JG','JH','JI','JJ','JK','JL','JM','JN','JO','JP','JQ','JR','JS','JT','JU','JV','JW','JX','JY','JZ'
    ];
    for (let i = 0; i < params.table_heads.map(res => res.main_header).length; i++) {
      //worksheet.mergeCells('A4:A5');
      worksheet.mergeCells(rowIndex[i+1]+rowHeaderUp+":"+rowIndex[i+1]+rowHeaderDown);
      worksheet.getColumn(i+1).width = params.table_heads[i].width;

    }
    worksheet.getRow(rowHeaderUp).values = params.table_heads.map(res => res.header);
    let startIndexDirectorateHeader = params.table_heads.map(res => res.header).length + 1;
    let endIndexDirectorateHeader = startIndexDirectorateHeader+ (params.table_heads_additional.map(res => res.header).length*2);

    for (let i = 0; i < params.table_heads_additional.map(res => res.header).length; i++) {

       worksheet.mergeCells(rowIndex[i+parseInt(startIndexDirectorateHeader)]+rowHeaderUp+":"+rowIndex[i+startIndexDirectorateHeader+params.table_heads_down_additional.length-1]+rowHeaderUp);
       worksheet.getCell(rowIndex[i+parseInt(startIndexDirectorateHeader)]+rowHeaderUp).value = params.table_heads_additional[i].header;
       for (let j = 0; j < params.table_heads_down_additional.map(res => res.header).length; j++) {
         worksheet.getCell(rowIndex[j+parseInt(startIndexDirectorateHeader)] + rowHeaderDown).value = params.table_heads_down_additional[j].header;
         worksheet.getColumn(j+parseInt(startIndexDirectorateHeader)).width = 50;
         worksheet.getCell(rowIndex[j+parseInt(startIndexDirectorateHeader)] + rowHeaderDown).alignment = { vertical: 'middle', horizontal: 'center' };

       }

       startIndexDirectorateHeader +=params.table_heads_down_additional.map(res => res.header).length;

    }



    worksheet.getRow(rowHeaderUp).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });
     worksheet.getRow(rowHeaderDown).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });



    //Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = params.headers.length+3;
    datas.forEach((data) => {

        worksheet.getRow(startRowData).values = data.row_values;
        worksheet.getRow(startRowData).eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            //top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
          cell.alignment = { wrapText: true };
        });
        counter++;
        startRowData++;

    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }
  static async ExportJourneyCourseModuleCompletionsToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;

    for (let i = 1; i <= params.table_heads.length; i++) {

        worksheet.getColumn(i).width = params.table_heads[i-1].width;

    }
    let rowHeaderUp = params.headers.length + 1;
    let rowHeaderDown = params.headers.length + 2;
    let rowIndex      = [
      '','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
      'AA','AB','AC','AD','AE','AF','AG','AH','AI','AJ','AK','AL','AM','AN','AO','AP','AQ','AR','AS','AT','AU','AV','AW','AX','AY','AZ',
      'BA','BB','BC','BD','BE','BF','BG','BH','BI','BJ','BK','BL','BM','BN','BO','BP','BQ','BR','BS','BT','BU','BV','BW','BX','BY','BZ',
      'CA','CB','CC','CD','CE','CF','CG','CH','CI','CJ','CK','CL','CM','CN','CO','CP','CQ','CR','CS','CT','CU','CV','CW','CX','CY','CZ',
      'DA','DB','DC','DD','DE','DF','DG','DH','DI','DJ','DK','DL','DM','DN','DO','DP','DQ','DR','DS','DT','DU','DV','DW','DX','DY','DZ',
      'EA','EB','EC','ED','EE','EF','EG','EH','EI','EJ','EK','EL','EM','EN','EO','EP','EQ','ER','ES','ET','EU','EV','EW','EX','EY','EZ',
      'FA','FB','FC','FD','FE','FF','FG','FH','FI','FJ','FK','FL','FM','FN','FO','FP','FQ','FR','FS','FT','FU','FV','FW','FX','FY','FZ',
      'GA','GB','GC','GD','GE','GF','GG','GH','GI','GJ','GK','GL','GM','GN','GO','GP','GQ','GR','GS','GT','GU','GV','GW','GX','GY','GZ',
      'HA','HB','HC','HD','HE','HF','HG','HH','HI','HJ','HK','HL','HM','HN','HO','HP','HQ','HR','HS','HT','HU','HV','HW','HX','HY','HZ',
      'IA','IB','IC','ID','IE','IF','IG','IH','II','IJ','IK','IL','IM','IN','IO','IP','IQ','IR','IS','IT','IU','IV','IW','IX','IY','IZ',
      'JA', 'JB', 'JC', 'JD', 'JE', 'JF', 'JG', 'JH', 'JI', 'JJ', 'JK', 'JL', 'JM', 'JN', 'JO', 'JP', 'JQ', 'JR', 'JS', 'JT', 'JU', 'JV', 'JW', 'JX', 'JY', 'JZ',
      'KA', 'KB', 'KC', 'KD', 'KE', 'KF', 'KG', 'KH', 'KI', 'KJ', 'KK', 'KL', 'KM', 'KN', 'KO', 'KP', 'KQ', 'KR', 'KS', 'KT', 'KU', 'KV', 'KW', 'KX', 'KY', 'KZ',
      'LA', 'LB', 'LC', 'LD', 'LE', 'LF', 'LG', 'LH', 'LI', 'LJ', 'LK', 'LL', 'LM', 'LN', 'LO', 'LP', 'LQ', 'LR', 'LS', 'LT', 'LU', 'LV', 'LW', 'LX', 'LY', 'LZ',
      'MA', 'MB', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MI', 'MJ', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ',
      'NA','NB','NC','ND','NE','NF','NG','NH','NI','NJ','NK','NL','NM','NN','NO','NP','NQ','NR','NS','NT','NU','NV','NW','NX','NY','NZ',
      'OA','OB','OC','OD','OE','OF','OG','OH','OI','OJ','OK','OL','OM','ON','OO','OP','OQ','OR','OS','OT','OU','OV','OW','OX','OY','OZ',
      'PA','PB','PC','PD','PE','PF','PG','PH','PI','PJ','PK','PL','PM','PN','PO','PP','PQ','PR','PS','PT','PU','PV','PW','PX','PY','PZ',
      'QA','QB','QC','QD','QE','QF','QG','QH','QI','QJ','QK','QL','QM','QN','QO','QP','QQ','QR','QS','QT','QU','QV','QW','QX','QY','QZ',
      'RA','RB','RC','RD','RE','RF','RG','RH','RI','RJ','RK','RL','RM','RN','RO','RP','RQ','RR','RS','RT','RU','RV','RW','RX','RY','RZ',
      'SA','SB','SC','SD','SE','SF','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SP','SQ','SR','SS','ST','SU','SV','SW','SX','SY','SZ',
      'TA','TB','TC','TD','TE','TF','TG','TH','TI','TJ','TK','TL','TM','TN','TO','TP','TQ','TR','TS','TT','TU','TV','TW','TX','TY','TZ',
      'UA','UB','UC','UD','UE','UF','UG','UH','UI','UJ','UK','UL','UM','UN','UO','UP','UQ','UR','US','UT','UU','UV','UW','UX','UY','UZ',
      'VA','VB','VC','VD','VE','VF','VG','VH','VI','VJ','VK','VL','VM','VN','VO','VP','VQ','VR','VS','VT','VU','VV','VW','VX','VY','VZ'
    ];
    for (let i = 0; i < params.table_heads.map(res => res.main_header).length; i++) {
      //worksheet.mergeCells('A4:A5');
      worksheet.mergeCells(rowIndex[i+1]+rowHeaderUp+":"+rowIndex[i+1]+rowHeaderDown);
      worksheet.getColumn(i+1).width = params.table_heads[i].width;

    }
    worksheet.getRow(rowHeaderUp).values = params.table_heads.map(res => res.header);
    let startIndexAdditionalHeader = params.table_heads.map(res => res.header).length+1;
    let endIndexAdditionalHeader = startIndexAdditionalHeader;

    for (let i = 0; i < params.table_heads_additional.map(res => res.header).length; i++) {

       worksheet.mergeCells(rowIndex[parseInt(startIndexAdditionalHeader)]+rowHeaderUp+":"+rowIndex[startIndexAdditionalHeader+params.table_heads_additional[i].child.length-1]+rowHeaderUp);
       worksheet.getCell(rowIndex[parseInt(startIndexAdditionalHeader)]+rowHeaderUp).value = params.table_heads_additional[i].header;
       for (let j = 0; j < params.table_heads_additional[i].child.length; j++) {
         worksheet.getCell(rowIndex[j+parseInt(startIndexAdditionalHeader)] + rowHeaderDown).value = params.table_heads_additional[i].child[j].header;
         worksheet.getColumn(j+parseInt(startIndexAdditionalHeader)).width = 60;
         worksheet.getCell(rowIndex[j+parseInt(startIndexAdditionalHeader)] + rowHeaderDown).alignment = { vertical: 'middle', horizontal: 'center' };

       }

       startIndexAdditionalHeader +=params.table_heads_additional[i].child.length;

    }
    endIndexAdditionalHeader = startIndexAdditionalHeader

    for (let i = 0; i < params.table_heads_end.map(res => res.header).length; i++) {

      worksheet.mergeCells(rowIndex[parseInt(endIndexAdditionalHeader)]+rowHeaderUp+":"+rowIndex[parseInt(endIndexAdditionalHeader)]+rowHeaderDown);
      worksheet.getColumn(endIndexAdditionalHeader).width = params.table_heads_end[i].width;
      worksheet.getCell(rowIndex[parseInt(endIndexAdditionalHeader)] + rowHeaderUp).value = params.table_heads_end[i].header;

    }


    worksheet.getRow(rowHeaderUp).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });
     worksheet.getRow(rowHeaderDown).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });



    //Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = params.headers.length+3;
    datas.forEach((data) => {

        worksheet.getRow(startRowData).values = data.row_values;
        worksheet.getRow(startRowData).eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            //top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
          cell.alignment = { wrapText: true };
        });
        counter++;
        startRowData++;

    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }

  static async ExportMultiJourneyCompletionsToExcel(params){

    const workbook = new Excel.Workbook();  // Create a new workbook
    const worksheet = workbook.addWorksheet(params.sheetname); // New Worksheet

    worksheet.getColumn(1).values = params.headers;



    for (let i = 1; i <= params.table_heads.length; i++) {

        worksheet.getColumn(i).width = params.table_heads[i-1].main_header_width;


    }
    worksheet.getRow(params.headers.length+1).values = params.table_heads.map(res => res.main_header);

    worksheet.getRow(params.headers.length+1).eachCell((cell) => {
      cell.font = { bold: true };
      //cell.width = 20;
      cell.border = {
        top: { style: "thick" },
        left: { style: "thick" },
        bottom: { style: "thick" },
        right: { style: "thick" }
      };
    });



    //Looping through User data
    let counter = 1;
    let datas = params.datas;
    let startRowData = params.headers.length+2;
    datas.forEach((data) => {

        worksheet.getRow(startRowData).values = data.row_values;
        worksheet.getRow(startRowData).eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.border = {
            //top: { style: "medium" },
            left: { style: "medium" },
            bottom: { style: "medium" },
            right: { style: "medium" }
          };
          cell.alignment = { wrapText: true };
        });
        counter++;
        startRowData++;

    });
    // Making first line in excel bold


    const today       = new Date();
    const date        = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds();
    const dateTime    = date+'__'+time;
    let fullPath = "public/export/"+params.filename+dateTime+".xlsx";

    const data = await workbook.xlsx.writeFile(fullPath);
    let result = {
      filename : params.filename+dateTime+".xlsx",
      fullpath : "public/export/"+params.filename+dateTime+".xlsx"
    }

    return result;

  }
  static async ExportLearnerBuddyToPDF(arrUsername){

  }



}
module.exports = ExportService
