/*
the purpose of this class is *only* to enter some code in an animated fashion, for no other reason than making 
an animated gif out of it:)

was bored a bit.

we can have 'commands' - using ¤ (decimal 244, currency sign in  extended ascii ) eg:
 ¤s1¤ 1 chars pers second
 ¤s20¤ 20 chars per second
 ¤p3¤ pause for 3 seconds.
 ¤c -...¤ command, like ¤c -r¤ - 'refresh', specific to Tweaky app.
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
        this.listeners = {
            change: () => {},//every single change
            refresh: () => {}, //the 'c-r' command
            done: () => {},
        };
    }

    setListeners(listeners){
        Object.assign(this.listeners,listeners);        
    }

    next(){
        if(this.index >= this.code.length){
            return this.stop().done();
        }    
        let curCode = this.aceEditor.getValue();
        let char = this.code[this.index];
        
        if(char === this.metaChar){
            let meta = '';
            this.index++;
            meta = this.eat(this.metaChar);
            if(meta.length >= 1){
                const command = meta[0];//s(peed) or p(ause) etc. 
                let param = meta.substring(1) || '';
                //changing speed
                if(command === 's'){
                    // this.delay = 200 - parseInt((param || 5) * 22);
                    this.delay = 1000 / parseInt(param || 5);
                    this._run();
                }
                //pause (e..g p5 - 5 seconds)
                if(command === 'p'){
                    return this.pause((param || 3) * 1000);
                }
                //command, like r(efresh)
                if(command === 'c'){
                    if(param === 'r'){
                        this.listeners.refresh();    
                    }
                }                
                //a comment, we just eat up to the end of line
                if(command === '#'){
                    this.index++;//omitting newline after comment.
                }

            }            
            return this.next();
        }
        this.index++;
        curCode += char;
        this.aceEditor.setValue(curCode, 1) // moves cursor to the end
        this.listeners.change();
    }

    run(){
        if(this.code instanceof Request){
            fetch(this.code).then(r => {return r.text()}).then(r => {
                this.code = r;
                this._run();
            });
            return;
        }
        return this._run();
    }

    //starts or 'continues'
    _run(){
        if(this.timer){
            this.stop(false);
        }
        this.timer = setInterval(() => {
            this.next();
        },this.delay);
        return this;
    }

    stop(reset = true){
        clearInterval(this.timer);
        this.timer = null;
        if(reset){
            this.index = 0;
        }
        return this;
    }

    //called when completely done
    done(){
        this.listeners.done();
        return this;
    }

    pause(ms){
        this.stop(false);
        setTimeout(()=>{
            this._run();
        },ms);
        return this;
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
