'use strict'

const Helpers = use('Helpers')

class UploadFileController {

    async uploadFile(file) {

        let nameFile = `${new Date().getTime()}.${file.subtype}`
        await file.move(Helpers.tmpPath('uploads/profpic'), {
            name: nameFile,
            file: true
        })

        if (!file.moved()) {
            //return profilePic.error()
            console.log(file.error());
        }
        return nameFile
    }
}

module.exports = UploadFileController
