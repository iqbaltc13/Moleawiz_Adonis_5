'use strict'

class TextController {
  async GetWrapedText(text, maxlength) {
    var resultText = [""];

    var len = text.length;
    if (maxlength >= len) {
        return text;
    }
    else {
        var totalStrCount = parseInt(len / maxlength);
        if (len % maxlength != 0) {
            totalStrCount++
        }

        for (var i = 0; i < totalStrCount; i++) {
            if (i == totalStrCount - 1) {
                resultText.push(text);
            }
            else {
                var strPiece = text.substring(0, maxlength - 1);
                resultText.push(strPiece);
                //resultText.push("<br>");
                text = text.substring(maxlength - 1, text.length);
            }
        }
    }
    return resultText;
  }
  async getWrapped(text, lengthSentence){
    let arrWrapped = [];
    let finishSubstring = lengthSentence - 1;
    let startSubstring = 0;
    if (text.length <= lengthSentence ){
        arrWrapped[0] = text;
    }
    else{
        while(startSubstring < text.length ){
            arrWrapped.push(text.substring(startSubstring, finishSubstring));
            startSubstring += lengthSentence-1;
            finishSubstring += lengthSentence-1;
            
            
        } 
    }
    return arrWrapped
  }
   async getWrappedBySpaceCharacter(text, lengthWords){
    let arrWrapped = [];
    let words      = text.split(" ");
    let finishWord = lengthWords - 1;
    let startWord  = 0;
    let sentence   = "";
    
    
    if(words.length <= lengthWords){
       arrWrapped.push(text);
    }
    else{
      while(startWord  < words.length ){
            for (let i = startWord; i < finishWord; i++) {
              if(words[i]){
                sentence = sentence + words[i]+" ";  
              }
              
            }    
            arrWrapped.push(sentence);
            sentence  = "";
            startWord += lengthWords-1;
            finishWord += lengthWords-1;
            
            
      } 
    }
    return arrWrapped
  }  
}


module.exports = TextController
