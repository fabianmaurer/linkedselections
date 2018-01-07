

let num=20;

function init(){
    for(let i=0;i<num;i++){
        let t=document.createElement('div');
        t.setAttribute('class','thumbnail');
        $('#wrapper').append(t);
    }
    
}