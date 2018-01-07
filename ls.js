
let data = [];
let mousex = 0;
let mousey = 0;
let dragging = false;
let numGraphs=3;
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
    for(let i=0;i<3;i++){
        let p=document.createElement('div');
        p.setAttribute('class','loading-segment');
        p.setAttribute('id','lseg'+i);
        $(l).append(p);
    }
    let lt=document.createElement('div');
    lt.setAttribute('id','loading-text');
    $('#main').append(lt);
    loading1();
    setTimeout(loading2, 1000);
    setTimeout(loading3, 2000);
    
    setTimeout(dissolveLoadingScreen, 2400);

}

function loading1() {
    $('#loading-text')[0].innerHTML = "Loading data...";
    $('#lseg0').css('background-color','orange');
}
function loading2() {
    $('#loading-text')[0].innerHTML = "Starting session...";
    $('#lseg0').css('background-color','blue');
    $('#lseg1').css('background-color','orange');
}
function loading3() {
    $('#loading-text')[0].innerHTML = "Building graphs...";
    $('#lseg1').css('background-color','blue');
    $('#lseg2').css('background-color','orange');
}

function dissolveLoadingScreen() {
    $('#lseg2').css('background-color','blue');
    $('#loading-text').hide();
    console.log('loading done');
    hideLoadingScreen();
}

function hideLoadingScreen(){
    $('#loading-text').hide();
    $('#loading-bar').hide();
    $('#dataoptionexpand').animate({
        "font-size": "100px",
        "opacity": "0"
    }, 200,function(){
        $('#dataoptionexpand').remove();
        $('#loadingtext').remove();
    })
    graphView();
}

function graphView() {
    enableDragging();
    initGraphView();
    buildGraphs();
}

function initGraphView(){
    let graphContainer=document.createElement('div');
    graphContainer.setAttribute('id','graph-container');
    
    let wm=document.createElement('div');
    wm.setAttribute('class','graph');
    wm.setAttribute('id','worldmap');
    let obj=document.createElement('object');
    obj.setAttribute('data','worldLow.svg');
    obj.setAttribute('type','image/svg+xml');
    obj.setAttribute('id','worldmap-object');
    $(wm).append(obj);
    $(graphContainer).append(wm);
    $(graphContainer).append('<br>')
    for(let i=0;i<numGraphs;i++){
        let g=document.createElement('div');
        g.setAttribute('class','graph');
        $(graphContainer).append(g);
    }
    $('#main').append(graphContainer);
    let a=document.getElementById('worldmap-object');
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

function buildGraphs(){
    graphContainer=document.createElement('div');
    
    
    $('#main').append(graphContainer);
}


function enableDragging() {
    d = document.createElement('div');
    d.setAttribute('id', 'dragbox');
    $('#main').append(d);
    $(window).mousedown(function (e) {
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