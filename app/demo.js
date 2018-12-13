/*
the purpose of this class is *only* to enter some code in an animated fashion, for no other reason than making 
an animated gif out of it:)

was bored a bit.

we can have 'commands' - using ¤ (decimal 244, currency sign in  extended ascii ) eg:
 ¤s0¤ lowest speed
 ¤s9¤ highest speed
 ¤p3¤ pause for 3 seconds.

*/
class Demo{
    /**
     * 
     * @param {*} aceEditor instance of aceditor
     * @param {*} code string or Request (fetch api)
     */
    constructor(aceEditor, code){
        this.aceEditor = aceEditor;
        this.code = code;
        this.timer = null;
        this.index = 0;
        this.metaChar = '¤';
        this.delay = 100;
    }
    next(){
        if(this.index >= this.code.length){
            return this.stop();
        }    
        let curCode = this.aceEditor.getValue();
        let char = this.code[this.index];
        
        if(char === this.metaChar){
            let meta = '';
            this.index++;
            meta = this.eat(this.metaChar);
            if(meta.length >= 1){
                const command = meta[0];//s(peed) or p(ause) etc.
                let param = meta[1] || '';
                //changing speed
                if(command === 's'){
                    this.delay = 200 - parseInt((param || 5) * 22);
                    this._run();
                }
                //pause (e..g p5 - 5 seconds)
                if(command === 'p'){
                    this.stop(false);
                    setTimeout(()=>{
                        this._run();
                    },(param || 3) * 1000)
                    return;
                }
                //a comment, we just eat up to the end of line
                if(command === '#'){
                    this.index++;//omitting newlne after comment.
                }

            }            
            return this.next();
        }
        this.index++;
        curCode += char;
        this.aceEditor.setValue(curCode, 1) // moves cursor to the end
    }

    run(){
        if(this.code instanceof Request){
            fetch(this.code).then(r => {return r.text()}).then(r => {
                this.code = r;
                this._run();
            });
            return;
        }
        this._run();
    }

    //starts or 'continues'
    _run(){
        if(this.timer){
            this.stop(false);
        }
        this.timer = setInterval(() => {
            this.next();
        },this.delay)
    }

    stop(reset = true){
        clearInterval(this.timer);
        this.timer = null;
        if(reset){
            this.index = 0;
        }
    }

    //'eats' up to toChar and returns result, the index is finally just after the toChar.
    eat(toChar){
        let result = '';
        let char = null;
        while(true){
            char = this.code[this.index++];
            if(char === toChar || this.index >= this.code.length){
                break;
            }
            result += char;
        }        
        return result;
    }

}
