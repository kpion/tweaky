

//it's like jquery document.ready.
l(function(){
   
    const serviceUrl = 'app/service.php';

    const codeEditorContainter = l('#code #editor-container');
    
    const autoEval = l('#auto-eval');

    const runIndicator = l('#run-indicator');
    const runResultStats = l('#run-result-stats');

    //number of concurrently running evals
    let runningCounter = 0;

    //when set to true the `eval` will be called in X miliseconds.
    //example use case: in eval() when it turns out one eval is already running. 
    let doDelayedEval = false;

    //should we save the code to local storage, next time a `tick` function will be called?
    let saveCode = false;

    //just so some css might apply after loading:
    document.body.classList.add('loaded');

    ///////////////////////////////
    //ace editor ( https://github.com/ajaxorg/ace/ )

    //options: https://github.com/ajaxorg/ace/wiki/Configuring-Ace
	const aceEditor = ace.edit(l('#code #editor')[0],{
		//autoScrollEditorIntoView: true,//auto resize in vertical
		//maxLines: 1000,//when to stop vertical resizing,
        showPrintMargin : false,
        enableBasicAutocompletion: true,
        fontSize: "15px"
		
    });
    aceEditor.setTheme("ace/theme/twilight");
	aceEditor.setShowPrintMargin(false);
	aceEditor.session.setMode("ace/mode/php");	//this one handles php, html, js.
    aceEditor.focus();
    aceEditor.resize();



    ///////////////////////////////
    //splitters (with https://github.com/nathancahill/split/ )

    Split(
        ['#code', '#outputs'],{
            direction: 'vertical',
            minSize: [30, 30],
            snapOffset:5,
            gutterSize:8
        });    


    //horiz (default), #outputs - left and right
    Split(
        ['#outputs .panel-left', '#outputs .panel-right'],{
            minSize: [160, 160],
            sizes: [80,20],
            snapOffset:5,
            gutterSize:8
        });    
 
   
    ///////////////////////////////
    //input event handling 

    l('#eval').on('click',event => {
        eval();
        aceEditor.focus();
    })

    //just a "demo", entering some code in to aceEditor
    let demo = null;
    document.addEventListener('keydown', (event) => {
        if(event.keyCode == 13 && (event.ctrlKey || event.altKey)){    
            event.preventDefault();
            eval();
        }
        if(event.key == 'F7' && event.ctrlKey && typeof Demo === 'function'){
            if(demo === null) {
                const s = `¤s6¤
Lorem Ipsum is simply dummy text of the printing and 
typesetting industry. Lorem Ipsum has been the industry's 
standard dummy text ever since the 1500s, when an unknown 
(...)`;
                //demo = new Demo(aceEditor, new Request('res/demo1.data.html'));
                demo = new Demo(aceEditor, s);
                demo.run();
            }else if(demo !== null){
                demo.stop();
                demo = null;
            }
        }
    }, true);  

    //any change in our code editor
    //this one here is to avoid uneccessasry eval when user is still (fast) typing.
    //only re-evaluate when user doesn't change anything for a number of miliseconds.
    let evalChangedCodeTimeoutId = null;
    aceEditor.getSession().on('change', function() {
        if(autoEval[0].checked){//should we automatically reevaluate?
            if(evalChangedCodeTimeoutId){
                clearTimeout(evalChangedCodeTimeoutId);
                evalChangedCodeTimeoutId = null;
            }
            evalChangedCodeTimeoutId = setTimeout(eval,300);
        }
        saveCode = true;        
    });

    //autoeval checkbbox clicked/changed
    //let onChangeEvalStarted = false;
    autoEval.on('change',(event)=>{
        if(event.target.checked){
            eval();
        }
        aceEditor.focus();
    })

    //'raw output' checkbox changed
    l('#raw-output-wrap').on('change',event => {
        if(event.target.checked){
            l('#output-raw').addClass('output-raw-wrapped');
        }else{
            l('#output-raw').removeClass('output-raw-wrapped');
        }
        aceEditor.focus();
    });


    ///////////////////////////////
    //config, i.e. keeping things in localstorage

    let config = new Config({
        mainKey : 'leval-config',
        //Optional defaults. Thanks to the them, our app can start and run when there is nothing in the storage yet. 
        default: {'answer': 42},
        //storage - defaults to window.localStorage, can be anything else, like chrome.storage.local or chrome.storage.sync etc.
        storage: window.localStorage,
      }); 
    
    config.load(() => {
        const codeString = config.get('code');
        if(codeString !== null){
            aceEditor.setValue(codeString);
        }
    });
    
    /**
     * saving stuff to local storage, called on every change in code editor and layout (that is, this one is a @todo :))
     * @param code -  if the code should be saved as well.
    */
    function saveState(code = true){
        if(code){
            let codeString = aceEditor.getValue();
            config.set('code',codeString);
        }
    }

    //called every 0.5 seconds.
    let codeEditorContHeight = null;
    function tick05(){
        //eval for some reason
        if(doDelayedEval){
            doDelayedEval = false;
            eval();
        }
        const curH = codeEditorContainter[0].clientHeight;
        if(codeEditorContHeight !== curH){
            //editor container size changed:
            codeEditorContHeight = curH;
            aceEditor.resize();
        }
        
    }

    //called every 2 seconds.
    function tick2(){
        if(saveCode){
            saveCode = false;
            saveState(true);
        }
    }
    
    setInterval(()=>{tick2();},2000);
    setInterval(()=>{tick05();},500);
 
    ///////////////////////////////
    //some other stuff

    //updating the Running (number processes) text
    let prevRunCounter = null;
    function updateRunStatus(){
        if(prevRunCounter === runningCounter){//no change, we won't be updating anything to avoid flashing
            return;
        }
        prevRunCounter = runningCounter;
        runIndicatorText = runningCounter > 0 ? 'Running ' : 'Done ';
        if(runningCounter > 0){
            runIndicator.addClass('visible')
        }else{
            //runIndicator.removeClass('visible')
        }
        
        if(runningCounter > 1){
            runIndicatorText += ` (${runningCounter})`;
        }
        runIndicator.text (runIndicatorText);
    }      

   ///////////////////////////////
    //the heart of everything 

    function eval(){
        if(runningCounter > 0){
            runIndicator.css('color','orange');
            doDelayedEval = true;//this will call us again
            setTimeout(()=>{
                runIndicator.css('color','inherit');
            },1000);
            return false;
        }
        runningCounter++;
        //updading 'run status' with a delay, to avoid flashing (the update will take place only if runningCounter will be different 
        //even still after this delay)
        setTimeout(()=>{
            updateRunStatus();
        },1000);
        
        runResultStats.css('opacity',0.5);
        let codeString = aceEditor.getValue();
        
        const outputRaw = l('#outputs #output-raw');
        const outputIframe = l('#outputs #output-iframe');
        const outputIframeEl = outputIframe[0];

        fetch(serviceUrl,{
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },                                
            body: JSON.stringify({
                'command' : 'eval',
                code: codeString,
            })   
        })
        .then(response => { return response.text(); })
        .then(result => {
            
            runningCounter--;
            updateRunStatus();
            
            try{
                result = JSON.parse(result);
            }catch(error){
                console.log('error parsing result:', error);
                outputRaw.text('Client error, error parsing result: ' + error);
            };
            outputRaw.text(result.output);

            //SO: Creating an iframe with given HTML dynamically - https://stackoverflow.com/a/10433550/4568686    
            //eh... in chrome [Violation] Avoid using document.write() blah blah blah

            /*outputIframeEl.contentWindow.document.open();
            outputIframeEl.contentWindow.document.write(result.output);
            outputIframeEl.contentWindow.document.close();
            */
            outputIframeEl.setAttribute('srcdoc', result.output);

            //stats
            //result.time is in seconds accurate to microseconds.
            let runStatsText = '';
            //runStatsText += result.length + 'B  ';
            //runStatsText += result.lengthCharacters + ' characters, ';
            runStatsText += Math.round(result.time * 1000 * 10) / 10 + ' ms';
            
            runResultStats.addClass('visible').css('opacity',1).text(runStatsText);
            runResultStats.attr('title',result.length + ' B')
        });
    }      
})

