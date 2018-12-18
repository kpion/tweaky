
/**
 * in the future maybe this will handle other stuff, like whole projects (directories), adding files etc.
 * but in this version of tweaky this will only handle one file (importing/saving as) and a drop zone.
 */
class FileManager{
    /**
     * 
     * @param {*} aceEditor AceEditor instance
     * @param {*} saveLinkSelector - <a href> link selector, e.g. #fm-save-file-link
     */
    constructor (aceEditor, saveLinkSelector){
        this.aceEditor = aceEditor;
        //used e.g. when downloading/saving as.
        this.recentlyOpenedFileName = null;
        //opening file stuff
        const inputEl = document.createElement('input');
        inputEl.type = 'file';
        inputEl.id = 'fm-file-open-input';
        inputEl.style.display = 'none';
        document.querySelector('body').appendChild(inputEl);
        l('#fm-file-open-input').on('change', e => {
            this.onFileInput(e);
        }, false);

        //dropping files
        document.querySelector('body').addEventListener('dragover',(e) => {
            this.onDragOver(e);
        });  

        document.querySelector('body').addEventListener('drop',(e) => {
            this.onDrop(e);
        });          

        //downloading/saving file
        if(saveLinkSelector){
            //this.saveLinkElement = document.querySelector(saveLinkSelector);
            document.querySelector(saveLinkSelector).addEventListener('click',e => {
                this.onDownloadClick(e);
            })
            document.querySelector(saveLinkSelector).addEventListener('contextmenu',e => {
                this.onDownloadClick(e);
            })
        }
    }

    //Here only making the 'open file' dialog to open.
    startOpenFileDlg(){
        document.querySelector('#fm-file-open-input').click();
    }

    //internal. Called when user selects a file to open (with browser native open file dialog)
    onFileInput(e){
        var file = e.target.files[0];
        if (!file) {
          return;
        }        
        this.readFile(file);    
        this.recentlyOpenedFileName = file.name;
        console.log(file);
        e.target.value = null;//only needed because otherwise opening the very same file will not trigger anything.
    }

    onDragOver(e){
        e.preventDefault();
    }

    onDrop(e){
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if(file){
            this.readFile(e.dataTransfer.files[0]);
            this.recentlyOpenedFileName = files[0].name;
        }
    };

    /**
     * Reading browser's native "File" object.
     * @param {*} file a file being used with <input type = 'file'> and in onDrop event -> dataTransfer.files
     *           ( https://developer.mozilla.org/en-US/docs/Web/API/File )
     * @param {*} callback - function (contents) - which will be called with the content of the file. 
     *          if empty, this will change the aceEditor contents.
     */
    readFile(file, callback = null){
        var reader = new FileReader();
        reader.onload = (readerEvent) => {
          var contents = readerEvent.target.result;
          if(callback){
            callback(contents);
          }else{
            this.aceEditor.setValue(contents);
          }
        };
        reader.readAsText(file);                 
    }

    onDownloadClick(e){
        const type = e.type;//'click' (when left click) or 'contextmenu' (when right click);
        try{
            e.currentTarget.href = 'data:attachment/text,' + encodeURI(this.aceEditor.getValue());
            e.currentTarget.download = this.recentlyOpenedFileName || 'code';//file name
        }catch($error){
            alert($error);
        }
    }
}