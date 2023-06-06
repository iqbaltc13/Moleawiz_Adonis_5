'use strict'
const User                              = use('App/Models/User')
const DaaChallengeBuddy                 = use('App/Models/DaaChallengeBuddy')
const { validate }                      = use('Validator')
const UploadHelper                      = use('App/Controllers/Http/Helper/UploadFileController')
const Helpers                           = use('Helpers')
const TextHelper                        = use('App/Controllers/Http/Helper/TextController')
const Database                          = use('Database')
const ImportService                     = use('App/Services/ImportService')
const DaaFileExport                     = use('App/Models/DaaFileExport')
const Drive                             = use('Drive');
const ExportService                     = use('App/Services/ExportService')
const { PDFDocument, StandardFonts }    = require("pdf-lib");
const fs = require("fs");


class LearnerBuddyController {
  constructor() {
    this.text_helper = new TextHelper();

  }

  indexForm = async ({auth,request, response, view, params, session})=>{
    const authUsers = auth.user.toJSON();
    return view.render('dashboard.learner_buddy.index_form',{ authUser : authUsers})
  }
  indexPostSubmit = async ({auth,request, response, view, params, session})=>{
    const authUsers = auth.user.toJSON();

    let delimiter = ";"
    let upload  = request.file('learners_buddy_file')
    let fname   = `${new Date().getTime()}.${upload.extname}`
    let dir     = 'uploads/'

    //move uploaded file into custom folder
    await upload.move(Helpers.tmpPath(dir), {
        name: fname
    })

    if (!upload.moved()) {
        console.log('error')
        return (upload.error(), 'Error moving files', 500)
    }

    let learnersId = await ImportService.ImportLearnerBuddy('tmp/' + dir + fname,delimiter);

    let arrUsername = await User.query().select('username','id').whereIn('username',learnersId).fetch();
    let datas = await DaaChallengeBuddy.query()
                .with('user')
                .with('buddy')
                .whereIn('learnerid',arrUsername.rows.map(res => res.id))
                .whereNull('deleted_at').fetch();
    return view.render('dashboard.learner_buddy.index_post_submit',{ authUser : authUsers, datas : datas, learnersId : learnersId});

  }

  exportCsv = async({request, response, view, params, session, auth})=>{

    let requestParams = {};

    const authUser = auth.user.toJSON()
    //let csvtext = encodeURI(request.input('str_export').replace(" <br> ", "\n"));
    let arrUsername = request.input('arr_username').split(',');
    let users = await User.query().select('username','id').whereIn('username',arrUsername).fetch();
    let datas = await DaaChallengeBuddy.query()
              .with('user')
              .with('buddy')
              .whereIn('learnerid',users.rows.map(res => res.id))
              .whereNull('deleted_at').fetch();

    let rows = [];
    let header = ["Learner NIP", "Learner Name", "Buddy NIP", "Buddy Name"];
    rows.push(header);
    for (let index in datas.rows) {
      datas.rows[index].row = [];
      if (datas.rows[index].getRelated('user') && datas.rows[index].getRelated('buddy')){
        datas.rows[index].row.push(datas.rows[index].getRelated('user').username);
        datas.rows[index].row.push(datas.rows[index].getRelated('user').firstname +' '+ datas.rows[index].getRelated('user').lastname);
        datas.rows[index].row.push(datas.rows[index].getRelated('buddy').username );
        datas.rows[index].row.push(datas.rows[index].getRelated('buddy').firstname +' '+ datas.rows[index].getRelated('buddy').lastname);
        rows.push( datas.rows[index].row);
      }

    }
    //console.log(rows);
    let csvtext = rows.map(function(d){
       return JSON.stringify(d);
    })
    .join('\n')
    .replace(/(^\[)|(\]$)/mg, '');


    const today       = new Date();
    const date        = today.getFullYear()+'_'+(today.getMonth()+1)+'_'+today.getDate();
    const time        = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds()+'_'+today.getMilliseconds();
    const dateTime    = date+'__'+time;
    let filename = "export/export_learner_buddy_"+dateTime+".csv";



    await Drive.put(filename, Buffer.from(csvtext));
    const daaFileExport       = await new DaaFileExport();
    daaFileExport.name        = "export_learner_buddy_"+dateTime+".csv";
    daaFileExport.full_path   = Helpers.publicPath()+"/"+filename;
    daaFileExport.type        = "export_learner_buddy";
    daaFileExport.userid      =  auth.user.id;
    await daaFileExport.save();

    return response.download(Helpers.publicPath()+"/"+filename);

  }

  exportExcel = async ({request, response, view, params, session, auth})=>{
    let requestParams = {};

    const authUser = auth.user.toJSON()
    let arrUsername =  request.input('arr_username').split(',');
    let result =  await ExportService.ExportLearnerBuddyToExcel(arrUsername);
    const daaFileExport       = await new DaaFileExport();
    daaFileExport.name        = result.filename;
    daaFileExport.full_path   = Helpers.appRoot()+'/'+result.fullpath;
    daaFileExport.type        = "export_learner_buddy";
    daaFileExport.userid      =  auth.user.id;
    await daaFileExport.save();

    return response.download(result.fullpath);
  }

  exportPdf = async({request, response, view, params, session, auth})=>{
    let requestParams = {};

    const authUser = auth.user.toJSON()
    let arrUsername = request.input('arr_username').split(',');
    let users = await User.query().select('username','id').whereIn('username',arrUsername).fetch();
    let datas = await DaaChallengeBuddy.query()
              .with('user')
              .with('buddy')
              .whereIn('learnerid',users.rows.map(res => res.id))
              .whereNull('deleted_at').fetch();

    let rows = [];
    let header = ["Learner NIP", "Learner Name", "Buddy NIP", "Buddy Name"];
    let text = "<!DOCTYPE html><html><body><table style='border: 1px solid;'><thead><tr>";

    header.forEach((element) => {
      text += "<th style='border: 1px solid;'>"+element+"</th>";
      
    });
    text += "</tr></thead><tbody>";
    rows.push(header);
    for (let index in datas.rows) {
      datas.rows[index].row = [];
      if (datas.rows[index].getRelated('user') && datas.rows[index].getRelated('buddy')){
        datas.rows[index].row.push(datas.rows[index].getRelated('user').username);
        datas.rows[index].row.push(datas.rows[index].getRelated('user').firstname +' '+ datas.rows[index].getRelated('user').lastname);
        datas.rows[index].row.push(datas.rows[index].getRelated('buddy').username);
        datas.rows[index].row.push(datas.rows[index].getRelated('buddy').firstname +' '+ datas.rows[index].getRelated('buddy').lastname);
        text += "<tr>";
        text += "<td style='border: 1px solid;'>" + datas.rows[index].getRelated('user').username + "</td>";
        text += "<td style='border: 1px solid;'>" + datas.rows[index].getRelated('user').firstname +" "+ datas.rows[index].getRelated('user').lastname + "</td>";
        text += "<td style='border: 1px solid;'>" + datas.rows[index].getRelated('buddy').username + "</td>";
        text += "<td style='border: 1px solid;'>" + datas.rows[index].getRelated('buddy').firstname +" "+ datas.rows[index].getRelated('buddy').lastname + "</td>";
        text += "</tr>";
        rows.push(datas.rows[index].row);
      }

    }

    text += "</tbody></table></body></html>";


    const today       = new Date();
    const date        = today.getFullYear()+'_'+(today.getMonth()+1)+'_'+today.getDate();
    const time        = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds()+'_'+today.getMilliseconds();
    const dateTime    = date+'__'+time;
    
    const document = await PDFDocument.create();
    //const page = document.addPage([3508 , 2480]);
    const page = document.addPage([2480 , 3508]);
    
    const helveticaFont = await document.embedFont(StandardFonts.Helvetica);
    const textWidth = helveticaFont.widthOfTextAtSize(text, 36);
    const textHeight = helveticaFont.heightAtSize(36);

    page.drawText(text, {
      x: page.getWidth() / 2 - textWidth / 2,
      y: page.getHeight() / 2 - textHeight / 2,
    });
    let filename = "export_learner_buddy_"+dateTime+".pdf";
    fs.writeFileSync(Helpers.publicPath()+"/export/"+filename, await document.save());

    return response.download(Helpers.publicPath()+"/export/"+filename);
  }


}

module.exports = LearnerBuddyController
