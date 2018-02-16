
let data = [];
let mousex = 0;
let mousey = 0;
let dragging = false;
let predragging=false;
let numGraphs = 3;
let nameToIndex = {};
let indexToName = [];
let enabled = [];
let contexts = [];
let $graphs=[];
let graphXPos=[];
let graphYPos=[];
let countryIdMap={};
let count=0;
let asyncAddQueue=[];
let history=[];
let selectionchange=false;
let svg=document.querySelector('svg');
let countryDOMElements=[];

let historyCount = 0;
const historyRadius = 2;
let historyPosition = 0;
let historyTarget=0;
let historyAnimation = false;
let historyChanged=[];
let historyMovement=0;
let historyOffsetX=30;
let historyOffsetY=30;



$('#choosedatabtn').focusout(function () {
    $('#choosedatabtn').removeClass('choosedataexpand');
    let h1 = $('#choosedatabtn').height() - 20;
    $('#choosedatabtn')[0].innerHTML = '<div id="choosedatahead">Choose dataset...</div>';
    let h2 = $('#choosedatabtn').height() - 20;
    $('#choosedatahead').css('height', h1 + 'px');

    $('#choosedatahead').animate({ 'height': h2 + 'px' })
        .promise().then(function () {
            setTimeout(function () { $('#choosedatahead').css('height', '') }, 100);
        });
});

$('#choosedatabtn').focus(function () {
    $('#choosedatabtn').addClass('choosedataexpand');
    let c = document.createElement('div');
    c.setAttribute('class', 'dataoptioncont');
    $('#choosedatabtn').append(c);
    for (let i = 0; i < 4; i++) {
        let d = document.createElement('div');
        d.setAttribute('class', 'dataoption');
        d.innerHTML = 'dataset ' + i;
        $(d).click(function (e) {
            datasetChosen(i, e.currentTarget);
        });
        $(c).append(d);
    }

    let h = $(c).height();

    $(c).css('height', 0);


    $(c).animate({ 'height': h + 'px' });
});



function datasetChosen(i, tgt) {
    let position = $(tgt).offset();
    let w = $(tgt).width() * 1.5;
    let h = $(tgt).height() * 1.5;
    let exp = document.createElement('div');
    exp.setAttribute('id', 'dataoptionexpand');
    $(exp).css('position', 'absolute');
    $(exp).css('font-size', h / 40 * 13 + 'px');
    $(exp).css('line-height', h + 'px');
    $(exp).css('width', w + 'px');
    $(exp).css(position);
    exp.innerHTML = 'dataset ' + i;
    $('#main').append(exp);
    $(exp).animate({
        "line-height": $(window).height() + "px",
        "font-size": "50px",
        "width": $(window).width() + "px",
        "top": "0",
        "left": "0"
    }, 200)
        .promise().then(function () {
            setTimeout(function () {
                $(exp).css({ 'width': '100%', 'line-height': '100vh' });
                $('#choosedata').remove();
                loading();
            }, 200);
        });
}

function loading() {
    let l = document.createElement('div');
    l.setAttribute('id', 'loading-bar');
    $('#main').append(l);
    for (let i = 0; i < 3; i++) {
        let p = document.createElement('div');
        p.setAttribute('class', 'loading-segment');
        p.setAttribute('id', 'lseg' + i);
        $(l).append(p);
    }
    let lt = document.createElement('div');
    lt.setAttribute('id', 'loading-text');
    $('#main').append(lt);
    loading1();
    setTimeout(loading2, 100);
    setTimeout(loading3, 200);

    setTimeout(dissolveLoadingScreen, 240);

}

function loading1() {
    $('#loading-text')[0].innerHTML = "Loading data...";
    $('#lseg0').css('background-color', 'orange');
}
function loading2() {
    $('#loading-text')[0].innerHTML = "Starting session...";
    $('#lseg0').css('background-color', 'blue');
    $('#lseg1').css('background-color', 'orange');
}
function loading3() {
    $('#loading-text')[0].innerHTML = "Building graphs...";
    $('#lseg1').css('background-color', 'blue');
    $('#lseg2').css('background-color', 'orange');
}

function dissolveLoadingScreen() {
    $('#lseg2').css('background-color', 'blue');
    $('#loading-text').hide();
    hideLoadingScreen();
}

function hideLoadingScreen() {
    $('#loading-text').hide();
    $('#loading-bar').hide();
    $('#dataoptionexpand').animate({
        "font-size": "100px",
        "opacity": "0"
    }, 200, function () {
        $('#dataoptionexpand').remove();
        $('#loadingtext').remove();
    })
    graphView();
}

function graphView() {
    enableDragging();
    initGraphView();
    setTimeout(buildNamesMaps, 300);

}

function loadData(url) {
    $.getJSON(url, function (json) {
        data = json;
        sortData();
        buildGraphs();
    });
}

function initGraphView() {
    let graphContainer = document.createElement('div');
    graphContainer.setAttribute('id', 'graph-container');

    let wm = document.createElement('div');
    wm.setAttribute('class', 'graph');
    wm.setAttribute('id', 'worldmap');
    let obj = document.createElement('object');
    obj.setAttribute('data', 'worldLow.svg');
    obj.setAttribute('type', 'image/svg+xml');
    obj.setAttribute('id', 'worldmap-object');

    obj.addEventListener('load', function() {
        worldMapLoaded();
    }, true);

    //$e.replaceWith($($e[0].contentDocument.documentElement).clone());
    $(wm).append(obj);
    $(graphContainer).append(wm);
    $(graphContainer).append('<br>')
    for (let i = 0; i < numGraphs; i++) {
        let g = document.createElement('div');
        g.setAttribute('class', 'graph');
        $(graphContainer).append(g);
    }
    $('#main').append(graphContainer);

    let a = document.getElementById('worldmap-object');
    /*a.addEventListener("load",function(){

        // get the inner DOM of alpha.svg
        var svgDoc = a.contentDocument;
        // get the inner element by id
        var delta = svgDoc.getElementsByClass("land");
        // add behaviour
        for(let i=0;i<delta.length;i++){
            delta[i].addEventListener("mousedown",function(){
                alert('hello world!')
            }, false);
        }
    }, false);*/
}

function worldMapLoaded(){
    inlineWorldmap();
}

/**
 * Make the worldmap inline, so contents can be accessed. Timeout is required before calling this.
 */
function inlineWorldmap() {
    let $e = $('#worldmap-object');
    $e.replaceWith($($e[0].contentDocument.documentElement).clone());
    worldmapListeners();
}

function worldmapListeners() {
    let a = $('.land');
    for (let i = 0; i < a.length; i++) {
        a[i].addEventListener("mousedown", function (e) {

            
            toggleCountry(nameToIndex[e.target.getAttribute('title')]);
            save();
        }, false);
        
        countryIdMap[a[i].getAttribute('title')]=a[i].getAttribute('id');
        
    }
}

function toggleCountry(index) {
    selectionchange=true;
    count++;
    enabled[index] = !enabled[index];
    if(countryIdMap[indexToName[index]]!=null){
        $('#'+countryIdMap[indexToName[index]]).toggleClass('land-active').toggleClass('land');
    }else{
        console.log('id not found for: '+indexToName[index])
    
    }
    asyncAddQueue.push(index);
    //$(".graph-circle."+countryIdMap[name]).toggleClass('enabled');
}

function asyncAdd(){
    for(let i=0;i<10;i++){
        if(asyncAddQueue.length>0){
            index=asyncAddQueue.shift();
            //$(".graph-circle."+countryIdMap[name]).toggleClass('enabled');
            countryDOMElements[index].toggleClass('enabled');
            
        }
    }
    
    requestAnimationFrame(asyncAdd);
}

function buildGraphs() {
    let c = $('.graph');
    for (let i = 1; i < c.length; i++) {

        let can = document.createElement('canvas');
        can.setAttribute('width', $(c[i]).width());
        can.setAttribute('height', $(c[i]).height());
        $(c[i]).append(can);
        let ctx = can.getContext('2d');
        contexts.push(ctx);
        $graphs.push($(c[i]));
        //drawScatterPlot('Human Development Index HDI-2014','Change mobile usage 2009 2014',ctx);
    }
    createHistoryDOM();
    drawGraphs();
}

function drawGraphs() {
    let c = $('.graph');
    for (let i = 0; i < contexts.length; i++) {
        graphXPos[i]=[];
        graphYPos[i]=[];
        
        if(i==0) drawScatterPlot('Human Development Index HDI-2014', 'Change mobile usage 2009 2014', contexts[i],$graphs[i],i);
        if(i==1) drawScatterPlot('Internet users percentage of population 2014', 'MaleSuicide Rate 100k people', contexts[i],$graphs[i],i);
        if(i==2) drawScatterPlot('Expected years of schooling - Years', 'Public expenditure on education Percentange GDP', contexts[i],$graphs[i],i);
    }
    for(let i=0;i<indexToName.length;i++){
        countryDOMElements[i]=$('.graph-circle.'+countryIdMap[indexToName[i]]);
    }
    console.log(countryDOMElements);
    asyncAdd();
}

function buildNamesMaps() {
    let countries = $('#worldmap svg g').children();
    for (let i = 0; i < countries.length; i++) {
        let name = countries[i].getAttribute('title');
        nameToIndex[name] = i;
        indexToName[i] = name;
        enabled[i] = false;
    }
    loadData('worldindexes.json');
}

function sortData() {
    let newdata = [];
    for (let i = 0; i < nameToIndex.length; i++) {
        newdata.push({});
    }
    let l = data.length;
    for (let i = 0; i < l; i++) {
        if (nameToIndex[data[i].Id] != null) newdata[nameToIndex[data[i].Id]] = data[i];
    }
    data = newdata;
}



function drawScatterPlot(dataX, dataY, ctx, $graph,index) {
    let maxX = 0, minX = 0, maxY = 0, minY = 0;
    let width = 300, height = 300, r = 3,margin=20;
    let first=true;
    for (let i = 0; i < data.length; i++) {
        if (data[i]!=null) {
            let cur = data[i];
            if (first) {
                minX = cur[dataX];
                maxX = cur[dataX];
                minY = cur[dataY];
                maxY = cur[dataY];
                first=false;
            } else {
                minX = Math.min(minX, cur[dataX]);
                maxX = Math.max(maxX, cur[dataX]);
                minY = Math.min(minY, cur[dataY]);
                maxY = Math.max(maxY, cur[dataY]);
            }
        }
    }
    for (let i = 0; i < data.length; i++) {
        if ((data[i]!=null)) {
            let cur = data[i];
            let x = (cur[dataX] - minX) * (width-40) / (maxX - minX)+20;
            let y = (cur[dataY] - minY) * (height-40) / (maxY - minY)+20;
            let c=document.createElement('div');
            c.setAttribute('class','graph-circle '+countryIdMap[indexToName[i]]);
            let t=document.createElement('div');
            t.setAttribute('class','tooltip');
            t.innerHTML='tooltip';
            c.append(t);
            $(c).css({'top':y+'px','left':x+'px'})
            $graph.append(c);
            graphXPos[index][i]=$graph.offset().left+x;
            graphYPos[index][i]=$graph.offset().top+y;
        }
    }
    ctx.beginPath();
    ctx.translate(margin,margin);
    ctx.moveTo(0,0);
    ctx.lineTo(width-2*margin,0);
    ctx.moveTo(0,0);
    ctx.lineTo(0,height-2*margin);
    ctx.stroke();
    let dx=maxX-minX;
    let dy=maxY-minY;
    let stepx=Math.pow(10,Math.round(Math.log10(dx))-1);
    let stepy=Math.pow(10,Math.round(Math.log10(dy))-1);
    ctx.strokestyle='999';
    ctx.beginPath();
    for(let i=Math.ceil(minX/stepx)*stepx-minX;i<=dx;i=i+stepx){
        let x = i * (width-40) / (dx);
        ctx.moveTo(x,-3);
        ctx.lineTo(x,3);
        let txt=document.createElement('div');
        txt.setAttribute('class','axisnumber');
        txt.innerHTML=Math.round((minX+i)*100)/100;
        $(txt).css({'top':'9px','left':21+x+'px'})
        $graph.append(txt);
    }
    for(let i=Math.ceil(minY/stepy)*stepy-minY;i<=dy;i=i+stepy){
        let y = i * (height-40) / (dy);
        ctx.moveTo(-3,y);
        ctx.lineTo(3,y);
    }
    ctx.stroke();
    ctx.textAlign="center";
    ctx.fillText(dataX,width/2-margin,-10+0);
    ctx.rotate(0.5*Math.PI);
    ctx.fillText(dataY,width/2-margin,10+6);
    ctx.rotate(-0.5*Math.PI);
    ctx.translate(-margin,-margin);
}

function save(){
    let obj={};
    obj.enabled=enabled.slice();
    history.push(obj);
    addHistoryEntry();
}

function createHistoryDOM(){
    
    let history=document.createElement('div');
    history.setAttribute('id','history');
    $('#main').append(history);
    
    initHistory();
}

function updateHistoryDOM(){
    let hdata=history[history.length-1];
    let helem=document.createElement('img');
    let i=history.length-1;
    helem.setAttribute('src',hdata.img);
    helem.setAttribute('class','history-element');
    $(helem).css({'left':history.length*50+'px'})
    $(helem).click(function(event){
        event.stopPropagation();
        console.log(i);
        load(history[i].enabled);
    })
    $('#history').append(helem);
}

function load(newEnabled){
    console.log(newEnabled);
    for(let i=0;i<enabled.length;i++){
        if(enabled[i]!=newEnabled[i]){
            toggleCountry(i);
        }
    }
}

function addHistoryEntry(){
    svg=$('#worldmap').children().first()[0];
    var canvas = document.createElement('canvas');
    canvas.width=700;
    canvas.height=451;
    var ctx = canvas.getContext('2d');
    var data = (new XMLSerializer()).serializeToString(svg);
    var DOMURL = window.URL || window.webkitURL || window;

    var img = new Image();
    var svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
    var url = DOMURL.createObjectURL(svgBlob);
    img.src = url;
    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);

        var imgURI = canvas
            .toDataURL('image/png');
        history[history.length-1].img=imgURI;
        historyAddPanel();
    };

    
}

function triggerDownload (imgURI) {
    var evt = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true
    });
  
    var a = document.createElement('a');
    a.setAttribute('download', 'MY_COOL_IMAGE.png');
    a.setAttribute('href', imgURI);
    a.setAttribute('target', '_blank');
    a.dispatchEvent(evt);
}

function enableDragging() {
    d = document.createElement('div');
    d.setAttribute('id', 'dragbox');
    $('#main').append(d);
    $(window).mousedown(function (e) {
        e.stopPropagation();
        mousex = e.clientX;
        mousey = e.clientY;
        
        predragging=true;
        selectionchange=false;
    });
    $(window).mouseup(function (e) {
        predragging=false;
        
        if (dragging){
            $('#dragbox').hide();
            dragging=false;
            if(selectionchange) save();
        }
    });

    $(window).mousemove(function (e) {
        if(predragging){
            if(Math.abs(e.clientX-mousex)+Math.abs(e.clientY-mousey)>3){

                $('#dragbox').css('top', mousey + 'px');
                $('#dragbox').css('bottom', $(window).height() - mousey + 'px');

                $('#dragbox').css('left', mousex + 'px');
                $('#dragbox').css('right', $(window).width() - mousex + 'px');
                $('#dragbox').show();
                predragging=false;
                dragging=true;
                
            }
        }
        if (dragging) {
            if (e.clientX < mousex) {
                $('#dragbox').css('left', e.clientX + 'px');
                $('#dragbox').css('right', $(window).width() - mousex + 'px');
            } else {
                $('#dragbox').css('left', mousex + 'px');
                $('#dragbox').css('right', $(window).width() - e.clientX + 'px');
            }
            if (e.clientY < mousey) {
                $('#dragbox').css('top', e.clientY + 'px');
                $('#dragbox').css('bottom', $(window).height() - mousey + 'px');
            } else {
                $('#dragbox').css('top', mousey + 'px');
                $('#dragbox').css('bottom', $(window).height() - e.clientY + 'px');
            }
            let left=Math.min(e.clientX,mousex);
            let right=Math.max(e.clientX,mousex);
            let bottom=Math.min(e.clientY,mousey);
            let top=Math.max(e.clientY,mousey);
            let flags1=[];
            let flags2=[];
            for(let i=0;i<graphXPos.length;i++){
                
                for(let j=0;j<graphXPos[i].length;j++){
                    if((left<=graphXPos[i][j])&&(right>=graphXPos[i][j])&&(bottom<=graphYPos[i][j])&&(top>=graphYPos[i][j])){
                        if(!enabled[j]){
                            toggleCountry(j);
                        }
                        flags1[j]=true;
                    }else{
                        if(enabled[j]){
                            //toggleCountry(indexToName[j]);
                            flags2[j]=true;
                        }
                        
                    }
                }
            }
            for(let i=0;i<Math.max(flags1.length,flags2.length);i++){
                if(flags2[i] && !flags1[i]){
                    toggleCountry(i);
                }
            }

        }

    });
}

/**
 * history functions
 */

function initHistory(){
    historyWidth=$('#history').width()-historyOffsetX*2-180;
    console.log('historywidth '+historyWidth);
    historyLoadPanels();
    historyInitPanels();
    historyPanelLoop();
    $('#history').bind('mousewheel', function (e) {
        if (e.originalEvent.wheelDelta > 0) {
            //right
            if (historyTarget < historyCount-1) {
                historyTarget++;
                historyAnimation = true;
            }
        }
        else {
            //left        
            if (historyTarget > 0) {
                historyTarget--;
                historyAnimation = true;
            }
        }
    });
}

function historyLoadPanels() {
    for (let i = 0; i < 0; i++) {
        historyInitPanel(i);
    }
}

function historyInitPanels(){
    let ch=$('#history').children();
    historyTarget=historyCount-1;
    historyPosition=historyCount-1;
    //console.log('changing:');
    for(let i=0;i<historyCount;i++){
        $(ch[i]).css('left',historyWidth*0+historyOffsetX+'px');
    }
    historyUpdateDOM();
}

function historyInitPanel(index) {
    let panel = document.createElement('div');
    panel.setAttribute('class', 'history-element');
    $('#history').append(panel);
    historyCount++;
}

function historyAddPanel() {
    let hdata=history[history.length-1];
    let panel=document.createElement('img');
    let i=history.length-1;
    panel.setAttribute('src',hdata.img);
    panel.setAttribute('class','history-element');
    $(panel).click(function(event){
        event.stopPropagation();
        load(history[i].enabled);
    })
    $('#history').append(panel);
    historyCount++;
    historyTarget=historyCount-1;
    historyAnimation=true;
}


function historyPanelLoop() {
    if (historyAnimation) {
        historyUpdatePosition();
        historyUpdateDOM();
        
    }
    requestAnimationFrame(historyPanelLoop);
}

function historyUpdateDOM(){
    let ch=$('#history').children();
    for(let i=0;i<historyCount;i++){
        let pos=(i-historyPosition+historyRadius)/(historyRadius*2);
        let outside=(pos<-(1/historyRadius)) || (pos>1+1/historyRadius);
        if(!outside){
            if(pos<0) pos=0;
            if(pos>1) pos=1;
            $(ch[i]).css('left',historyWidth*historyPositionConverter(pos)+historyOffsetX+'px');
        }
    }
}

/**
 * converts from 0..1 to 0..1 using some mathematical function to create smooth movement from linear movement.
 */
function historyPositionConverter(pos){
    if(pos==0) return 0;
    if(pos==1) return 1;
    return pos;
    if(pos>=0.5){
        pos=1-pos;
        let a=pos/0.1;
        return 1-0.5*Math.pow(0.5,a);
    }
    if(pos<0.5){
        let a=pos/0.1;
        return 0.5*Math.pow(0.5,a);
    }
}

function historyUpdatePosition() {
    historyMovement=(historyTarget-historyPosition)/8;

    if(Math.abs(historyTarget-historyPosition)<0.005){
        historyPosition=historyTarget;
        historyAnimation=false;
    }else historyPosition+=historyMovement;
}