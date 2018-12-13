## "Evil/Eval" animowany, że 'i' zamienia się powoli w "a"

html:
<!-- Ev<span class = 'fade-out-rot'>i</span><span class = 'fade-in-rot'>a</span>l -->
css:

/* letters showing/hiding */

/* letter A in Eval :) Initial values */
.fade-in-rot{
  display: inline-block;
  transform: rotateY(90deg); 
  transition:1.5s 0.7s; 
  transition-property: transform;
}

/* letter I in Eval/Evil, initial values */
.fade-out-rot{
  display: inline-block;
  
  transform: rotateY(0deg); 
  transition:2s 0.7s; 
  transition-property: transform opacity;
}


/* letter A in Eval :) */
body.loaded .fade-in-rot{
  transform: rotateY(0deg);  
}

/* letter I in Eval/Evil */
body.loaded .fade-out-rot{
  transform: rotateY(90deg);   
  opacity: 0;
  width:0px;
  
}

## spinner
 
/*
-------------------------------------------------------------------------------
loader (spinner), (from https://loading.io/css/ )
usage:
<div class="loader"><div></div><div></div></div> 

-------------------------------------------------------------------------------
*/

@keyframes loader {
  0% {
    top: 14px;
    left: 14px; 
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: -1px;
    left: -1px;
    width: 30px;
    height: 30px;
    opacity: 0;
  }
}

.loader {
  display: inline-block;
  position: relative;
  width: 32px;
  height: 32px;
  vertical-align: middle;
}

.loader div {
  position: absolute;
  border: 2px solid orange;  
  opacity: 1;
  border-radius: 50%;
  animation: loader 1s cubic-bezier(0, 0.2, 0.8, 1) infinite; 
}
.loader div:nth-child(2) {
  animation-delay: -0.5s;
}

