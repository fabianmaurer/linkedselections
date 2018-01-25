
let data = [];
let mousex = 0;
let mousey = 0;
let dragging = false;
let numGraphs = 3;
let nameToIndex = {};
let indexToName = [];
let enabled = [];
let contexts = [];
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
    console.log(h);
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
    console.log('loading done');
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
        console.log(json);
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
    setTimeout(inlineWorldmap, 200);
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

            if (e.target.getAttribute('class') == 'land')
                e.target.setAttribute('class', 'land-active');
            else
                e.target.setAttribute('class', 'land');
            enableCountry(e.target.getAttribute('title'));
            refreshGraphs();
        }, false);
    }
}

function enableCountry(title) {
    enabled[nameToIndex[title]] = !enabled[nameToIndex[title]];
    console.log(title + ' selected');
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
        //drawScatterPlot('Human Development Index HDI-2014','Change mobile usage 2009 2014',ctx);
    }
    refreshGraphs();
}

function refreshGraphs() {
    let c = $('.graph');
    for (let i = 0; i < contexts.length; i++) {

        if(i==0) drawScatterPlot('Human Development Index HDI-2014', 'Change mobile usage 2009 2014', contexts[i]);
        if(i==1) drawScatterPlot('Internet users percentage of population 2014', 'MaleSuicide Rate 100k people', contexts[i]);
        if(i==2) drawScatterPlot('Expected years of schooling - Years', 'Public expenditure on education Percentange GDP', contexts[i]);
    }
}

function buildNamesMaps() {
    let countries = $('#worldmap svg g').children();
    for (let i = 0; i < countries.length; i++) {
        let name = countries[i].getAttribute('title');
        nameToIndex[name] = i;
        indexToName[i] = name;
        enabled[i] = false;
    }
    console.log(nameToIndex);
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

function drawScatterPlot(dataX, dataY, ctx) {
    
    let maxX = 0, minX = 0, maxY = 0, minY = 0;
    let width = 300, height = 300, r = 3,margin=20;
    
    ctx.fillStyle = '#4264cd';
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
        if (enabled[i] && (data[i]!=null)) {
            let cur = data[i];
            if (i == 0) {
                minX = cur[dataX];
                maxX = cur[dataX];
                minY = cur[dataY];
                maxY = cur[dataY];
            } else {
                minX = Math.min(minX, cur[dataX]);
                maxX = Math.max(maxX, cur[dataX]);
                minY = Math.min(minY, cur[dataY]);
                maxY = Math.max(maxY, cur[dataY]);
            }
        }
    }
    for (let i = 0; i < data.length; i++) {
        if (enabled[i] && (data[i]!=null)) {
            let cur = data[i];
            let x = (cur[dataX] - minX) * (width-40) / (maxX - minX)+20;
            let y = (cur[dataY] - minY) * (height-40) / (maxY - minY)+20;
            ctx.moveTo(x + r, y);
            ctx.arc(x, y, r, 0, 2 * Math.PI);
        }
    }
    ctx.fill();

    ctx.globalAlpha=1;
    ctx.beginPath();
    ctx.translate(margin,margin);
    ctx.moveTo(0,0);
    ctx.lineTo(width-2*margin,0);
    ctx.moveTo(0,0);
    ctx.lineTo(0,height-2*margin);
    ctx.stroke();
    ctx.textAlign="center";
    ctx.fillText(dataX,width/2-margin,-10+3);
    ctx.rotate(0.5*Math.PI);
    ctx.fillText(dataY,width/2-margin,10+3);
    ctx.rotate(-0.5*Math.PI);
    ctx.translate(-margin,-margin);
}


function enableDragging() {
    d = document.createElement('div');
    d.setAttribute('id', 'dragbox');
    $('#main').append(d);
    $(window).mousedown(function (e) {

        //console.log($e.contentDocument);
        mousex = e.clientX;
        mousey = e.clientY;
        $('#dragbox').css('top', mousey + 'px');
        $('#dragbox').css('bottom', $(window).height() - mousey + 'px');

        $('#dragbox').css('left', mousex + 'px');
        $('#dragbox').css('right', $(window).width() - mousex + 'px');
        $('#dragbox').show();
        dragging = true;
    });
    $(window).mouseup(function (e) {
        if (dragging) $('#dragbox').hide();
    });

    $(window).mousemove(function (e) {
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
        }

    });
}