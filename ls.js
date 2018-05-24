let data = [];
let mousex = 0;
let mousey = 0;
let dragging = false;
let predragging = false;
let numGraphs = 6;
let nameToIndex = {};
let indexToName = [];
let enabled = [];
let oldEnabled = [];
let contexts = [];
let $graphs = [];
let graphXPos = [];
let graphYPos = [];
let graphXPosLocal = [];
let graphYPosLocal = [];
let countryIdMap = {};
let count = 0;
let asyncAddQueue = [];
let history = [];
let allHistoryData = [];
let selectionchange = false;
let svg = document.querySelector('svg');
let countryDOMElements = [];

let historyCount = 0;
const historyRadius = 3;
let historyPosition = 0;
let historyTarget = 0;
let historyAnimation = false;
let historyMovement = 0;
let historyOffsetX = 30;
let historyOffsetY = 30;
let selector = 0;
const selectors = ['box', 'resizebox', 'line', 'remove', 'clear'];


let availablePanels = [];
let availableProperties = [];
const numAvailableGraphs = 20;

let activeGraphs = [];

let historyInfo = [];

let previousEntry = 0;

let currentUser = "";

let menuNames = ['history', 'panels', 'social', 'options'];

const serviceURL = "http://localhost:8080/history";

let vBoxDrag = false;
let hBoxDrag = false;
let $dragTarget = null;

let currentColor = 'blue';
let shiftMode = false;

let boxSelectors = [];
let currentBoxSelectorIndex = 0;
let currentBoxSelector = null;
let boxSelectorId = 0;
let mouseEnabled = [];
let waiting = 0;
let menuMode = 'detached';
let showTimer = 0;
let historyDisplayMode = 0;
let historyImpFilter = false;
let historyCommFilter = false;
let historyDoms=[];
let historyPositions=[];
let historyTargets=[];

$('#choosedatabtn').focusout(function () {
    /*
    $('#choosedatabtn').removeClass('choosedataexpand');
    let h1 = $('#choosedatabtn').height() - 20;
    $('#choosedatabtn')[0].innerHTML = '<div id="choosedatahead">Choose dataset...</div>';
    let h2 = $('#choosedatabtn').height() - 20;
    $('#choosedatahead').css('height', h1 + 'px');

    $('#choosedatahead').animate({ 'height': h2 + 'px' })
        .promise().then(function () {
            setTimeout(function () { $('#choosedatahead').css('height', '') }, 100);
        });*/
});

$('#choosedatabtn').click(function (e) {
    if ($(e.currentTarget).children().length < 2) {
        $(e.currentTarget).addClass('active');
        $('#choosedatabtn').addClass('choosedataexpand');
        let c = document.createElement('div');
        c.setAttribute('class', 'dataoptioncont');
        $('#choosedatabtn').append(c);
        for (let i = 0; i < 4; i++) {
            let d = document.createElement('div');
            d.setAttribute('class', 'dataoption');
            d.innerHTML = 'dataset ' + i;
            $(d).click(function (e) {
                currentUser = $('#username').val();
                $('#username').remove();
                datasetChosen(i, e.currentTarget);
            });
            $(c).append(d);
        }

        let h = $(c).height();

        $(c).css('height', 0);


        $(c).animate({ 'height': h + 'px' });
    }
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
    graphView();
    setTimeout(dissolveLoadingScreen, 200);

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

}

function graphView() {
    enableDragging();
    initGraphView();
    //setTimeout(buildNamesMaps, 300);

}

function loadData(url) {
    $.getJSON(url, function (json) {
        data = json;
        sortData();
        buildGraphs();
    });
}

function initGraphView() {
    createSelectorButtons();
    let graphContainer = document.createElement('div');
    graphContainer.setAttribute('id', 'graph-container');

    let wm = document.createElement('div');
    wm.setAttribute('class', 'graph');
    wm.setAttribute('id', 'worldmap');
    let obj = document.createElement('object');
    obj.setAttribute('data', 'worldLow.svg?version=8');
    obj.setAttribute('type', 'image/svg+xml');
    obj.setAttribute('id', 'worldmap-object');

    obj.addEventListener('load', function () {
        worldMapLoaded();
    }, true);

    //$e.replaceWith($($e[0].contentDocument.documentElement).clone());
    $(wm).append(obj);
    $(graphContainer).append(wm);
    for (let i = 0; i < numAvailableGraphs; i++) {
        activeGraphs[i] = false;
    }
    for (let i = 0; i < numGraphs; i++) {
        let g = document.createElement('div');
        g.setAttribute('class', 'graph panel' + i);
        $(graphContainer).append(g);
        activeGraphs[i] = true;
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

function worldMapLoaded() {
    inlineWorldmap();
}

/**
 * Make the worldmap inline, so contents can be accessed from this js.
 */
function inlineWorldmap() {
    let $e = $('#worldmap-object');
    $e.replaceWith($($e[0].contentDocument.documentElement).clone());
    //copyWorldMap();
    initZoom($('#worldmap').children()[0]);
    worldmapListeners();
    buildNamesMaps();
}

function copyWorldMap(){
    let w=$('#worldmap').clone();
    w.attr('id','worldmap-copy');
    $('#main').append(w);
}

function initZoom(svg) {
    let zoom = svgPanZoom(svg, {
        zoomScaleSensitivity: 0.5,
        minZoom: 1,
        maxZoom: 10,
        dblClickZoomEnabled: false
    });
}

function worldmapListeners() {
    let a = $('.land');
    for (let i = 0; i < a.length; i++) {
        a[i].addEventListener("mousedown", function (e) {


            toggleCountry(nameToIndex[e.target.getAttribute('title')]);
            save();
        }, false);

        countryIdMap[a[i].getAttribute('title')] = a[i].getAttribute('id');

    }
}

function toggleCountry(index) {
    selectionchange = true;
    count++;
    enabled[index] = !enabled[index];
    if (countryIdMap[indexToName[index]] != null) {
        $('#' + countryIdMap[indexToName[index]]).toggleClass('land-active').toggleClass('land');
    } else {
        console.log('id not found for: ' + indexToName[index])

    }
    //countryDOMElements[index].addClass('enabled');
    asyncAddQueue.push(index);
    //$(".graph-circle."+countryIdMap[name]).toggleClass('enabled');
}

function asyncAdd() {
    if (asyncAddQueue.length == 0) {
        waiting = 0;
    } else if (waiting < 1) {
        waiting++;
    } else {
        waiting = 0;
        for (let i = 0; i < 30; i++) {
            if (asyncAddQueue.length > 0) {
                index = asyncAddQueue.shift();
                //$(".graph-circle."+countryIdMap[name]).toggleClass('enabled');
                countryDOMElements[index].toggleClass('enabled');

            }
        }
    }


    requestAnimationFrame(asyncAdd);
}

function buildGraphs() {
    let c = $('.graph');
    c.splice(0, 1);
    for (let i = 0; i < activeGraphs.length; i++) {
        if (activeGraphs[i]) {
            let can = document.createElement('canvas');
            can.setAttribute('width', $(c[i]).width());
            can.setAttribute('height', $(c[i]).height());
            $(c[i]).append(can);
            let ctx = can.getContext('2d');
            contexts[i] = ctx;
            $graphs[i] = $(c[i]);
        }

        //drawScatterPlot('Human Development Index HDI-2014','Change mobile usage 2009 2014',ctx);
    }

    generatePanels();
    createMenus();
    toggleMenuMode();
    drawGraphs();
}

function drawGraphs() {
    let c = $('.graph');

    for (let i = 0; i < activeGraphs.length; i++) {

        graphXPosLocal[i] = [];
        graphYPosLocal[i] = [];

        if (activeGraphs[i]) {
            graphXPos[i] = $graphs[i].offset().left;
            graphYPos[i] = $graphs[i].offset().top;
            drawScatterPlot(availablePanels[i][0], availablePanels[i][1], contexts[i], $graphs[i], i);
        }


        /*
        if (i == 0) drawScatterPlot('Human Development Index HDI-2014', 'Change mobile usage 2009 2014', contexts[i], $graphs[i], i);
        if (i == 1) drawScatterPlot('Internet users percentage of population 2014', 'MaleSuicide Rate 100k people', contexts[i], $graphs[i], i);
        if (i == 2) drawScatterPlot('Expected years of schooling - Years', 'Public expenditure on education Percentange GDP', contexts[i], $graphs[i], i);
        */
    }
    for (let i = 0; i < indexToName.length; i++) {
        countryDOMElements[i] = $('.graph-circle.' + countryIdMap[indexToName[i]]);
    }
    $('#worldmap').children().first().mousedown(function (e) {
        e.stopPropagation();
    });
    asyncAdd();
}

function addGraph(index) {
    let g = document.createElement('div');
    g.setAttribute('class', 'graph panel' + index);
    $('#graph-container').append(g);
    let can = document.createElement('canvas');
    can.setAttribute('width', $(g).width());
    can.setAttribute('height', $(g).height());
    $(g).append(can);
    let ctx = can.getContext('2d');

    drawScatterPlot(availablePanels[index][0], availablePanels[index][1], ctx, $(g), index);
    refreshGraphPositions();


}

function removeGraph(index) {
    $('.panel' + index).remove();
    refreshGraphPositions();
}

function refreshGraphPositions() {
    for (let i = 0; i < activeGraphs.length; i++) {
        if (activeGraphs[i]) {
            graphXPos[i] = $('.panel' + i).offset().left;
            graphYPos[i] = $('.panel' + i).offset().top;
        }

    }
    for (let i = 0; i < indexToName.length; i++) {
        countryDOMElements[i] = $('.graph-circle.' + countryIdMap[indexToName[i]]);
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



function drawScatterPlot(dataX, dataY, ctx, $graph, index) {
    let maxX = 0, minX = 0, maxY = 0, minY = 0;
    let width = 300, height = 300, r = 3, margin = 20;
    let first = true;
    for (let i = 0; i < data.length; i++) {
        if (data[i] != null) {
            let cur = data[i];
            if (first) {
                minX = cur[dataX];
                maxX = cur[dataX];
                minY = cur[dataY];
                maxY = cur[dataY];
                first = false;
            } else {
                minX = Math.min(minX, cur[dataX]);
                maxX = Math.max(maxX, cur[dataX]);
                minY = Math.min(minY, cur[dataY]);
                maxY = Math.max(maxY, cur[dataY]);
            }
        }
    }
    for (let i = 0; i < data.length; i++) {
        if ((data[i] != null)) {
            let cur = data[i];
            let x = (cur[dataX] - minX) * (width - 40) / (maxX - minX) + 20;
            let y = (cur[dataY] - minY) * (height - 40) / (maxY - minY) + 20;
            let c = document.createElement('div');
            c.setAttribute('class', 'graph-circle ' + countryIdMap[indexToName[i]]);
            let t = document.createElement('div');
            t.setAttribute('class', 'tooltip');
            t.innerHTML = indexToName[i] + '<br>' + Math.round(cur[dataX] * 100) / 100 + '<br>' + Math.round(cur[dataY] * 100) / 100;
            c.appendChild(t);
            $(c).css({ 'top': y + 'px', 'left': x + 'px' });
            $(c).click(function () {
                if (selector == 2) {
                    mouseEnabled[i] = !mouseEnabled[i];
                    toggleCountry(i);
                }
            })
            $graph.append(c);
            graphXPosLocal[index][i] = x;
            graphYPosLocal[index][i] = y;
        }
    }
    ctx.beginPath();
    ctx.translate(margin, margin);
    ctx.moveTo(0, 0);
    ctx.lineTo(width - 2 * margin, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, height - 2 * margin);
    ctx.stroke();
    let dx = maxX - minX;
    let dy = maxY - minY;
    let stepx = Math.pow(10, Math.round(Math.log10(dx)) - 1);
    let stepy = Math.pow(10, Math.round(Math.log10(dy)) - 1);
    ctx.strokestyle = '999';
    ctx.beginPath();
    for (let i = Math.ceil(minX / stepx) * stepx - minX; i <= dx; i = i + stepx) {
        let x = i * (width - 40) / (dx);
        ctx.moveTo(x, -3);
        ctx.lineTo(x, 3);
        let txt = document.createElement('div');
        txt.setAttribute('class', 'axisnumber');
        txt.innerHTML = numberToShort(minX + i);
        //txt.innerHTML = Math.round((minX + i) * 100) / 100;
        $(txt).css({ 'top': '9px', 'left': 21 + x + 'px' })
        $graph.append(txt);
    }
    for (let i = Math.ceil(minY / stepy) * stepy - minY; i <= dy; i = i + stepy) {
        let y = i * (height - 40) / (dy);
        ctx.moveTo(-3, y);
        ctx.lineTo(3, y);
        let txt = document.createElement('div');
        txt.setAttribute('class', 'axisnumber');
        txt.innerHTML = numberToShort(minY + i);
        //txt.innerHTML = Math.round((minY + i) * 100) / 100;
        $(txt).css({ 'top': 18 + y + 'px', 'right': '282px' })
        $graph.append(txt);
    }
    /*
    for (let i = Math.ceil(minY / stepy) * stepy - minY; i <= dy; i = i + stepy) {
        let y = i * (height - 40) / (dy);
        ctx.moveTo(-3, y);
        ctx.lineTo(3, y);
    }*/
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillText(dataX, width / 2 - margin, -10 + 0);
    ctx.rotate(0.5 * Math.PI);
    ctx.fillText(dataY, width / 2 - margin, 10 + 6);
    ctx.rotate(-0.5 * Math.PI);
    ctx.translate(-margin, -margin);
}

function numberToShort(num) {
    let digits = Math.log10(num);
    if (digits > 1) {
        num = Math.round(num);
        if (digits < 3) return num;
        if (digits < 6) return num / 1000 + 'K';
        if (digits < 9) return num / 1000000 + 'M';
        if (digits < 12) return num / 1000000000 + 'B';
    }
    return Math.round(num * 100) / 100;
    let suffixes = ['', 'K', 'M', 'B', 'T'];
    let suffix = suffixes[Math.floor(digits / 3)];
    num = num / (Math.pow(10, Math.floor(digits / 3) * 3));
    return num + suffix;
}

function save() {
    let obj = {};
    obj.enabled = enabled.slice();
    console.log('prev:' + previousEntry + ' / ' + (history.length - 1));

    if (previousEntry < history.length - 1) {
        obj.previous = previousEntry;
    }
    previousEntry = history.length;
    obj.timestamp = Date.now();
    obj.boxSelectors = boxSelectors.slice();
    obj.mouseEnabled = mouseEnabled;
    history.push(obj);
    saveHistoryEntry(obj);
    addHistoryEntry(history.length - 1);
}

function toggleMenuMode() {
    if (menuMode == 'attached') {
        menuMode = 'detached';
        $('#menucontainer').css('bottom', '');
        $('#menucontainer').css('top', '');
        $('#menucontainer').css('height', '');
        $('.buttonmenu-bottom-right').css('bottom', '');
        $('.buttonmenu-bottom-left').css('bottom', '');
    }
    if (menuMode == 'detached') {
        let dist = $(window).height() - $('#worldmap').height() - 60;
        menuMode = 'attached';
        $('#menucontainer').css('bottom', -1 * dist + 'px');
        $('#menucontainer').css('top', 'auto');
        $('#menucontainer').css('height', dist + 'px');
        if ($('#menucontainer').is(':visible')) {
            $('.buttonmenu-bottom-right').css('bottom', dist + 'px');
            $('.buttonmenu-bottom-left').css('bottom', dist + 'px');
        }
    }
}

function toggleMenu(type) {
    console.log('toggled ' + type);
    let $content = $('.menucontent.' + type);

    if ($content.hasClass('visible')) {
        $content.removeClass('visible');
        if (menuMode == "detached") {
            $('#menucontainer').fadeOut(200);
        }
        if (menuMode == "attached") {
            let dist = -($(window).height() - $('#worldmap').height() - 60) + 'px';
            $('#menucontainer').animate({ 'bottom': dist }, 200, function () {
                $('#menucontainer').css('display', 'none');
            });
            $('.buttonmenu-bottom-right').animate({ 'bottom': 0 }, 200);
            $('.buttonmenu-bottom-left').animate({ 'bottom': 0 }, 200);
        }

    } else {

        $('.overlay-header').html(type);
        $('.overlay-header').attr('class', 'overlay-header color-' + type);
        let $old = $('.menucontent.visible');
        if ($('#menucontainer').is(':visible')) {
            $content.addClass('visible');
            if ($content.index() > $old.index()) {
                $old.animate({ 'margin-left': '-100%' }, 500, function () {
                    $old.removeClass('visible');
                    $old.css('margin-left', '');
                })
            } else {
                $content.css('margin-left', '-100%');
                $content.animate({ 'margin-left': '0' }, 500, function () {
                    $old.removeClass('visible');
                    $content.css('margin-left', '');
                })
            }
        } else {
            if (menuMode == "detached") {
                $('#menucontainer').fadeIn(200);
            }
            if (menuMode == "attached") {
                let dist = $(window).height() - $('#worldmap').height() - 60 + 'px';
                $('#menucontainer').css('display', 'block');
                $('#menucontainer').animate({ 'bottom': 0 }, 200);
                $('.buttonmenu-bottom-right').animate({ 'bottom': dist }, 200);
                $('.buttonmenu-bottom-left').animate({ 'bottom': dist }, 200);
            }
            $content.addClass('visible');
            $old.removeClass('visible');
        }
    }
    /*
    $menu=$('#menu-'+type);
    if($menu.is(':visible')){
        $menu.fadeOut(200);
    }else{
        $menu.fadeIn(200);
    }
    */
}

function closeMenu() {
    if (menuMode == "detached") {
        $('#menucontainer').fadeOut(200);
    }
    if (menuMode == "attached") {
        let dist = -($(window).height() - $('#worldmap').height() - 60) + 'px';
        $('#menucontainer').animate({ 'bottom': dist }, 200, function () {
            $('#menucontainer').css('display', 'none');
        });
        $('.buttonmenu-bottom-right').animate({ 'bottom': 0 }, 200);
        $('.buttonmenu-bottom-left').animate({ 'bottom': 0 }, 200);
    }
}

function createMenus() {
    let buttonMenu = document.createElement('div');
    buttonMenu.setAttribute('class', 'buttonmenu-bottom-right');

    let icons = ['fas fa-history', 'far fa-chart-bar', 'fas fa-users', 'fas fa-cog'];

    for (let i = 0; i < menuNames.length; i++) {
        let button = document.createElement('button');
        button.setAttribute('class', 'iconbutton color-' + menuNames[i]);
        button.innerHTML = '<i class="' + icons[i] + '"></i>'
        $(button).click(function () {
            toggleMenu(menuNames[i]);
        });
        buttonMenu.appendChild(button);
    }


    $('#main').append(buttonMenu);
    let menus = document.createElement('div');
    menus.setAttribute('id', 'menucontainer');
    let header = document.createElement('div');
    header.setAttribute('class', 'overlay-header color-history');
    header.innerHTML = 'History';

    menus.appendChild(header);
    let overlay = document.createElement('div');
    overlay.setAttribute('class', 'menuoverlay');
    menus.append(overlay);

    let closeButton = document.createElement('button');
    closeButton.setAttribute('class', 'close-icon');
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    $(closeButton).click(function () {
        closeMenu();
    })
    overlay.appendChild(closeButton);

    overlay.appendChild(createHistoryMenu());
    overlay.appendChild(createPanelMenu());
    overlay.appendChild(createSocialMenu());
    overlay.appendChild(createOptionsMenu());


    $('#main').append(menus);
    initHistory();
}

function createHistoryMenu() {

    let content = document.createElement('div');
    content.setAttribute('class', 'menucontent history');

    let history = document.createElement('div');
    history.setAttribute('id', 'history');
    content.appendChild(history);

    let filterButtons = document.createElement('div');
    let impFilter = document.createElement('button');
    let commFilter = document.createElement('button');

    filterButtons.setAttribute('class', 'history-filter-area');
    impFilter.setAttribute('class', 'history-important-button');
    impFilter.innerHTML = '<i class="fas fa-exclamation"></i>';
    commFilter.setAttribute('class', 'history-comment-button');
    commFilter.innerHTML = '<i class="fas fa-comment"></i>'

    $(impFilter).click(function () {
        historyImpFilter = !historyImpFilter;
        $(impFilter).toggleClass('enabled');
        historyAnimation = true;
        historyModeInitial = true;
    });
    $(commFilter).click(function () {
        historyCommFilter = !historyCommFilter;
        $(commFilter).toggleClass('enabled');
        historyAnimation = true;
        historyModeInitial = true;
    })

    filterButtons.innerHTML = 'Filters';
    filterButtons.appendChild(impFilter);
    filterButtons.appendChild(commFilter);

    content.appendChild(filterButtons);

    return content;
}

function createPanelMenu() {
    let content = document.createElement('div');
    content.setAttribute('class', 'menucontent panels');

    let panels = document.createElement('div');
    //history.setAttribute('id', 'history');

    for (let i = 0; i < availablePanels.length; i++) {
        let panel = document.createElement('button');

        if (activeGraphs[i]) {
            panel.setAttribute('class', 'preview-panel active');
        } else {
            panel.setAttribute('class', 'preview-panel');
        }

        $(panel).click(function () {
            $(panel).toggleClass('active');
            activeGraphs[i] = !activeGraphs[i];
            if (activeGraphs[i]) {
                addGraph(i);
            } else {
                removeGraph(i);
            }
            console.log('a');
        })

        panel.innerHTML = availablePanels[i][0] + ' / ' + availablePanels[i][1];
        panels.appendChild(panel);
    }

    content.appendChild(panels);

    return content;
}

function createSocialMenu() {
    let content = document.createElement('div');
    content.setAttribute('class', 'menucontent social');
    
    content.append(getUserSelection());


    return content;
}

function getUserSelection(){
    let usernames=[];
    for(let i=0;i<allHistoryData.length;i++){
        if(allHistoryData[i].lastName!=null && (allHistoryData[i].lastName!=currentUser)){
            if(!(usernames.includes(allHistoryData[i].lastName))){
                let user={lastName:allHistoryData[i].lastName,recentChange:allHistoryData[i].timestamp};
                usernames.push(allHistoryData[i].lastName);
            }else{
                let index=usernames.find(allHistoryData[i].lastName);
                if(allHistoryData[i].timestamp>usernames[index].recentChange) usernames[index].recentChange=allHistoryData[i].timestamp;
            }
        }
    }

    for(let i=0;i<usernames.length;i++){
        let b=document.createElement('button');
        b.setAttribute('class','preview-panel');
        b.innerHTML=usernames[i].lastName+' time:'+usernames[i].recentChange;
        $(b).click(function(){
            loadUserHistory(usernames[i]);
        });

    }
}

function loadUserHistory(username){
    let div=$('.social');
}

function createOptionsMenu() {
    let content = document.createElement('div');
    content.setAttribute('class', 'menucontent options');

    let options = document.createElement('div');
    options.setAttribute('class', 'options-container');
    /*
    for (let i = 0; i < 5; i++) {
        let option = document.createElement('div');
        option.setAttribute('class', 'option-box');
        let checkbox = document.createElement('input');
        checkbox.setAttribute('id', 'option' + i);
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('name', 'option ' + i)
        let txt = document.createElement('label');
        txt.setAttribute('for', 'option' + i);
        txt.innerHTML = 'option ' + i;
        option.appendChild(checkbox);
        option.appendChild(txt);
        options.appendChild(option);
    }
    */
    options.innerHTML = "(nothing here)";
    content.appendChild(options);


    return content;

}

function createPanelOverlay() {
    let overlay = document.createElement('div');
    overlay.setAttribute('class', 'menuoverlay bordercolor-history');
    overlay.setAttribute('id', 'menu-history');
    let header = document.createElement('div');
    header.setAttribute('class', 'overlay-header color-panels');
    header.innerHTML = 'History';
    overlay.appendChild(header);
    return overlay;
}

function generatePanels() {
    availableProperties = Object.getOwnPropertyNames(data[1]);
    // remove country id property
    availableProperties.shift();
    let r1 = 0, r2 = 0;
    for (let i = 0; i < numAvailableGraphs; i++) {
        // r1 = Math.floor(Math.random() * availableProperties.length);
        // r2 = Math.floor(Math.random() * (availableProperties.length - 1));
        r1 = i;
        r2 = availableProperties.length - i - 2;
        if (r2 >= r1) r2++;
        availablePanels.push([availableProperties[r1], availableProperties[r2]]);
    }
}

function updateHistoryDOM() {
    let hdata = history[history.length - 1];
    let helem = document.createElement('div');
    let himg = document.createElement('img');
    let i = history.length - 1;
    himg.setAttribute('src', hdata.img);
    helem.setAttribute('class', 'history-element');
    $(helem).css({ 'left': history.length * 50 + 'px' })
    $(himg).click(function (event) {
        event.stopPropagation();
        load(history[i].enabled, history[i].mouseEnabled, history[i].boxSelectors);
    })
    helem.appendChild(himg);
    $('#history').append(helem);
}

function load(newEnabled, mouseEnabled_, boxSelectors_) {
    mouseEnabled = mouseEnabled_;
    boxSelectors = boxSelectors_;

    loadBoxSelectors();
    for (let i = 0; i < enabled.length; i++) {
        if (enabled[i] != newEnabled[i]) {
            toggleCountry(i);
        }
    }
}

function loadBoxSelectors() {
    $('.boxselector').remove();
    for (let i = 0; i < boxSelectors.length; i++) {
        let b = boxSelectors[i];
        let $dbox = $('#dragbox');
        let $box = $(document.createElement('div'));
        $box.attr('class', 'boxselector');
        $box.css('border-color', currentColor);
        $box.css({
            'bottom': $(window).height() - b.top + 'px',
            'top': b.bottom + 'px',
            'left': b.left + 'px',
            'right': $(window).width() - b.right + 'px'
        })
        let v1 = document.createElement('div');
        let v2 = document.createElement('div');
        let h1 = document.createElement('div');
        let h2 = document.createElement('div');
        v1.setAttribute('class', 'v1');
        v2.setAttribute('class', 'v2');
        h1.setAttribute('class', 'h1');
        h2.setAttribute('class', 'h2');
        $(v1).css({
            'top': $box.css('top'),
            'bottom': $box.css('bottom'),
            'left': $box.css('left')
        });
        $(v2).css({
            'top': $box.css('top'),
            'bottom': $box.css('bottom'),
            'left': parseInt($box.css('left')) + $dbox.width() + 'px'
        })
        $(h1).css({
            'top': $box.css('top'),
            'left': $box.css('left'),
            'right': $box.css('right')
        })
        $(h2).css({
            'top': parseInt($box.css('top')) + $dbox.height() + 'px',
            'left': $box.css('left'),
            'right': $box.css('right')
        })
        $box.append(v1, v2, h1, h2);
        $('#dragbox').hide();
        dragging = false;
        $('#main').append($box);
        let id = i;
        if (selectionchange) save();
        $(v1).mousedown(function (e) {
            if (selector == 3) {
                let s = boxSelectors[id];
                boxSelectors[id] = null;
                boxCollisionCheck(s.left, s.right, s.top, s.bottom, true);
                $box.remove();
            } else {
                boxSelectorId = id;
                currentBoxSelectorIndex = id;
                currentBoxSelector = $box;
                vBoxDrag = true;
                e.stopPropagation();
                $dragTarget = $box;
                $dragLine = $(v1);
            }
        });
        $(v2).mousedown(function (e) {
            if (selector == 3) {
                let s = boxSelectors[id];
                boxSelectors[id] = null;
                boxCollisionCheck(s.left, s.right, s.top, s.bottom, true);
                $box.remove();
            } else {
                boxSelectorId = id;
                currentBoxSelectorIndex = id;
                currentBoxSelector = $box;
                vBoxDrag = true;
                e.stopPropagation();
                $dragTarget = $box;
                $dragLine = $(v2);
            }
        });
        $(h1).mousedown(function (e) {
            if (selector == 3) {
                let s = boxSelectors[id];
                boxSelectors[id] = null;
                boxCollisionCheck(s.left, s.right, s.top, s.bottom, true);
                $box.remove();
            } else {
                boxSelectorId = id;
                currentBoxSelectorIndex = id;
                currentBoxSelector = $box;
                hBoxDrag = true;
                e.stopPropagation();
                $dragTarget = $box;
                $dragLine = $(h1);
            }
        });
        $(h2).mousedown(function (e) {
            if (selector == 3) {
                let s = boxSelectors[id];
                boxSelectors[id] = null;
                boxCollisionCheck(s.left, s.right, s.top, s.bottom, true);
                $box.remove();
            } else {
                boxSelectorId = id;
                currentBoxSelectorIndex = id;
                currentBoxSelector = $box;
                hBoxDrag = true;
                e.stopPropagation();
                $dragTarget = $box;
                $dragLine = $(h2);
            }
        });
    }
}

function addHistoryEntry(index) {
    svg = $('#worldmap').children().first()[0];
    var canvas = document.createElement('canvas');
    canvas.width = 902;
    canvas.height = 618;
    var ctx = canvas.getContext('2d');
    var data = (new XMLSerializer()).serializeToString(svg);
    var DOMURL = window.URL || window.webkitURL || window;

    var img = new Image();
    var svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    var url = DOMURL.createObjectURL(svgBlob);
    img.src = url;
    img.onload = function () {
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);

        var imgURI = canvas
            .toDataURL('image/png');
        history[index].img = imgURI;
        if (history[index].important == null) history[index].important = false;
        historyAddPanel(index);
    };
}

function empty() {
    boxSelectors = [];
    mouseEnabled = [];
    $('.boxselector').remove();
    boxCollisionCheck(0, 0, 0, 0, false);
}

function boxCollisionCheck(left_, right_, top_, bottom_, inverted) {
    let flags1 = [];
    let flags2 = [];
    let left = 0, right = 0, top = 0, bottom = 0;
    for (let i = 0; i < graphXPosLocal.length; i++) {
        for (let j = 0; j < graphXPosLocal[i].length; j++) {
            for (let k = 0; k < boxSelectors.length + 1; k++) {
                if (k == 0) {
                    left = left_;
                    right = right_;
                    top = top_;
                    bottom = bottom_;
                } else {
                    if (boxSelectors[k - 1] == null) continue;
                    if ((hBoxDrag || vBoxDrag) && (k - 1 == currentBoxSelectorIndex)) {
                        continue;
                    } else {
                        left = boxSelectors[k - 1].left;
                        right = boxSelectors[k - 1].right;
                        top = boxSelectors[k - 1].top;
                        bottom = boxSelectors[k - 1].bottom;
                    }

                }
                if ((left <= graphXPos[i] + graphXPosLocal[i][j]) && (right >= graphXPos[i] + graphXPosLocal[i][j]) && (bottom <= graphYPos[i] + graphYPosLocal[i][j]) && (top >= graphYPos[i] + graphYPosLocal[i][j])) {
                    // if (!enabled[j]) {
                    //     toggleCountry(j);
                    // }
                    if (inverted && k == 0) {
                        flags2[j] = true;
                    } else {
                        flags1[j] = true;
                        if (!enabled[j] && k > 0) {
                            flags1[j] = false;
                        }
                    }

                } else {
                    flags2[j] = true;


                }

            }

        }
    }
    for (let i = 0; i < enabled.length; i++) {
        if (flags1[i] && !enabled[i]) {
            toggleCountry(i);
        } else if (flags2[i] && enabled[i] && !flags1[i] && !mouseEnabled[i]) {
            toggleCountry(i);
        }
    }

}
function addToMouseEnabled(left_, right_, top_, bottom_) {

    let flags1 = [];
    let flags2 = [];
    let left = 0, right = 0, top = 0, bottom = 0;
    for (let i = 0; i < graphXPosLocal.length; i++) {
        for (let j = 0; j < graphXPosLocal[i].length; j++) {
            for (let k = 0; k < 1; k++) {
                if (k == 0) {
                    left = left_;
                    right = right_;
                    top = bottom_;
                    bottom = top_;
                } else {
                    if (boxSelectors[k - 1] == null) continue;
                    if ((hBoxDrag || vBoxDrag) && (k - 1 == currentBoxSelectorIndex)) {
                        continue;
                    } else {
                        left = boxSelectors[k - 1].left;
                        right = boxSelectors[k - 1].right;
                        top = boxSelectors[k - 1].top;
                        bottom = boxSelectors[k - 1].bottom;
                    }

                }
                if ((left <= graphXPos[i] + graphXPosLocal[i][j]) && (right >= graphXPos[i] + graphXPosLocal[i][j]) && (bottom <= graphYPos[i] + graphYPosLocal[i][j]) && (top >= graphYPos[i] + graphYPosLocal[i][j])) {
                    flags1[j] = true;
                }
            }

        }
    }
    for (let i = 0; i < enabled.length; i++) {
        if (flags1[i]) {
            mouseEnabled[i] = true;
        }
    }

}


function enableDragging() {
    d = document.createElement('div');
    d.setAttribute('id', 'dragbox');
    $('#main').append(d);
    $(window).mousedown(function (e) {
        e.stopPropagation();
        mousex = e.clientX;
        mousey = e.clientY;
        if (selector < 2) {
            predragging = true;
            selectionchange = false;
        }
    });

    $(window).mouseup(function (e) {
        predragging = false;
        if (vBoxDrag || hBoxDrag) {
            if (selectionchange) save();
        }
        vBoxDrag = false;
        hBoxDrag = false;

        if (dragging) {
            if (selector == 0) {
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
                let left = Math.min(e.clientX, mousex);
                let right = Math.max(e.clientX, mousex);
                let bottom = Math.min(e.clientY, mousey);
                let top = Math.max(e.clientY, mousey);
                addToMouseEnabled(left, right, bottom, top);
                $('#dragbox').hide();
                dragging = false;
                if (selectionchange) save();
            } else if (selector == 1) {
                let $dbox = $('#dragbox');
                let $box = $('#dragbox').clone();
                $box.removeAttr('id');
                $box.attr('class', 'boxselector');
                $box.css('border-color', currentColor);
                let v1 = document.createElement('div');
                let v2 = document.createElement('div');
                let h1 = document.createElement('div');
                let h2 = document.createElement('div');
                v1.setAttribute('class', 'v1');
                v2.setAttribute('class', 'v2');
                h1.setAttribute('class', 'h1');
                h2.setAttribute('class', 'h2');
                $(v1).css({
                    'top': $dbox.css('top'),
                    'bottom': $dbox.css('bottom'),
                    'left': $dbox.css('left')
                });
                $(v2).css({
                    'top': $dbox.css('top'),
                    'bottom': $dbox.css('bottom'),
                    'left': parseInt($dbox.css('left')) + $dbox.width() + 'px'
                })
                $(h1).css({
                    'top': $dbox.css('top'),
                    'left': $dbox.css('left'),
                    'right': $dbox.css('right')
                })
                $(h2).css({
                    'top': parseInt($dbox.css('top')) + $dbox.height() + 'px',
                    'left': $dbox.css('left'),
                    'right': $dbox.css('right')
                })
                $box.append(v1, v2, h1, h2);
                $('#dragbox').hide();
                dragging = false;
                $('#main').append($box);
                let id = boxSelectors.length;
                boxSelectors.push({
                    top: $(window).height() - parseInt($box.css('bottom')),
                    right: $(window).width() - parseInt($box.css('right')),
                    bottom: parseInt($box.css('top')),
                    left: parseInt($box.css('left'))
                });
                if (selectionchange) save();
                $(v1).mousedown(function (e) {
                    if (selector == 3) {
                        let s = boxSelectors[id];
                        boxSelectors[id] = null;
                        boxCollisionCheck(s.left, s.right, s.top, s.bottom, true);
                        $box.remove();
                    } else {
                        boxSelectorId = id;
                        currentBoxSelectorIndex = id;
                        currentBoxSelector = $box;
                        vBoxDrag = true;
                        e.stopPropagation();
                        $dragTarget = $box;
                        $dragLine = $(v1);
                    }
                });
                $(v2).mousedown(function (e) {
                    if (selector == 3) {
                        let s = boxSelectors[id];
                        boxSelectors[id] = null;
                        boxCollisionCheck(s.left, s.right, s.top, s.bottom, true);
                        $box.remove();
                    } else {
                        boxSelectorId = id;
                        currentBoxSelectorIndex = id;
                        currentBoxSelector = $box;
                        vBoxDrag = true;
                        e.stopPropagation();
                        $dragTarget = $box;
                        $dragLine = $(v2);
                    }
                });
                $(h1).mousedown(function (e) {
                    if (selector == 3) {
                        let s = boxSelectors[id];
                        boxSelectors[id] = null;
                        boxCollisionCheck(s.left, s.right, s.top, s.bottom, true);
                        $box.remove();
                    } else {
                        boxSelectorId = id;
                        currentBoxSelectorIndex = id;
                        currentBoxSelector = $box;
                        hBoxDrag = true;
                        e.stopPropagation();
                        $dragTarget = $box;
                        $dragLine = $(h1);
                    }
                });
                $(h2).mousedown(function (e) {
                    if (selector == 3) {
                        let s = boxSelectors[id];
                        boxSelectors[id] = null;
                        boxCollisionCheck(s.left, s.right, s.top, s.bottom, true);
                        $box.remove();
                    } else {
                        boxSelectorId = id;
                        currentBoxSelectorIndex = id;
                        currentBoxSelector = $box;
                        hBoxDrag = true;
                        e.stopPropagation();
                        $dragTarget = $box;
                        $dragLine = $(h2);
                    }
                });
            }
            oldEnabled = enabled;

        }
    });

    $(window).mousemove(function (e) {
        if (vBoxDrag || hBoxDrag) {
            let v1 = $dragTarget.find('.v1');
            let v2 = $dragTarget.find('.v2');
            let h1 = $dragTarget.find('.h1');
            let h2 = $dragTarget.find('.h2');
            if (vBoxDrag) {
                $dragLine.css('left', e.clientX);
                h1.css({
                    'left': v1.css('left'),
                    'right': $(window).width() - parseInt(v2.css('left'))
                });
                h2.css({
                    'left': v1.css('left'),
                    'right': $(window).width() - parseInt(v2.css('left'))
                });
            } else if (hBoxDrag) {
                $dragLine.css('top', e.clientY);
                v1.css({
                    'top': h1.css('top'),
                    'bottom': $(window).height() - parseInt(h2.css('top'))
                });
                v2.css({
                    'top': h1.css('top'),
                    'bottom': $(window).height() - parseInt(h2.css('top'))
                });
            }
            $dragTarget.css({
                'top': $dragTarget.find('.v1').css('top'),
                'right': $dragTarget.find('.h1').css('right'),
                'bottom': $dragTarget.find('.v1').css('bottom'),
                'left': $dragTarget.find('.h1').css('left')
            });
            let left = parseInt($dragTarget.css('left'));
            let right = $(window).width() - parseInt($dragTarget.css('right'));
            let top = $(window).height() - parseInt($dragTarget.css('bottom'));
            let bottom = parseInt($dragTarget.css('top'));
            boxCollisionCheck(left, right, top, bottom, false);

        }
        if (predragging) {
            if (Math.abs(e.clientX - mousex) + Math.abs(e.clientY - mousey) > 3) {

                $('#dragbox').css('top', mousey + 'px');
                $('#dragbox').css('bottom', $(window).height() - mousey + 'px');

                $('#dragbox').css('left', mousex + 'px');
                $('#dragbox').css('right', $(window).width() - mousex + 'px');
                $('#dragbox').show();
                predragging = false;
                dragging = true;

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
            let left = Math.min(e.clientX, mousex);
            let right = Math.max(e.clientX, mousex);
            let bottom = Math.min(e.clientY, mousey);
            let top = Math.max(e.clientY, mousey);
            boxCollisionCheck(left, right, top, bottom, false);

        }

    });
}

/**
 * history functions
 */

function initHistory() {
    
    loadOwnHistory().then(function () {
        historyCount = history.length;
        historyWidth = $(document).width() - historyOffsetX * 2 - 360;

        console.log('historywidth ' + historyWidth);
        historyDoms.push($('#history'));
        historyLoadPanels(historyDoms[0]);
        historyInitPanels(historyDoms[0]);
        historyPanelLoop(historyDoms[0]);
        // historyUpdateDOM();
        $('#history').bind('mousewheel', function (e) {
            if (e.originalEvent.wheelDelta > 0) {
                //right
                if (historyTargets[0] < historyCounts[0] - 1) {
                    historyTargets[0]++;
                    historyAnimations[0] = true;
                }
            }
            else {
                //left        
                if (historyTargets[0] > 0) {
                    historyTargets[0]--;
                    historyAnimations[0] = true;
                }
            }
        });
        loadAllHistories();
    })


}

function historyLoadPanels(dom) {
    for (let i = 0; i < 0; i++) {
        historyInitPanel(i,dom);
    }
}

function historyInitPanels(dom) {
    let ch = dom.children();
    // historyTarget = -1;
    // historyPosition = -1;
    console.log('history position:' + historyPosition)
    //console.log('changing:');
    for (let i = 0; i < historyCount; i++) {
        $(ch[i]).css('left', historyWidth * 0 + historyOffsetX + 'px');
    }
    historyUpdateDOM(dom);
}

function historyInitPanel(index,dom) {
    let panel = document.createElement('div');
    panel.setAttribute('class', 'history-element');
    dom.append(panel);
}

function historyAddPanel(index) {
    let hdata = history[index];
    let panel = document.createElement('div');
    let himage = document.createElement('img');
    let i = index;
    himage.setAttribute('src', hdata.img);
    himage.setAttribute('class', 'history-image');
    console.log('add panel');
    if (hdata.previous) {
        let $prev = $($('#history').children()[hdata.previous]).children().last().clone();
        $prev.attr('class', 'history-previous-image');
        $prev.css('left', '');
        $prev.css('top', '');
        $prev.click(function () {
            historyTarget = hdata.previous;
            historyAnimation = true;
        });
        $prev.hover(function () {
            $($('#history').children()[hdata.previous]).animate({ top: '-70px' }, 200);
        }, function () {
            $($('#history').children()[hdata.previous]).animate({ top: '30px' }, 200);
        })
        let $prevContainer = $(document.createElement('div'));
        $prevContainer.attr('class', 'history-previous');
        $prevContainer.append($prev);
        $prevContainer.append('<i class="fa fa-arrow-down"></i>')
        panel.appendChild($prevContainer[0]);

    }

    let note = document.createElement('div');
    note.setAttribute('class', 'history-note');

    let noteText = document.createElement('div');
    noteText.innerHTML = hdata.note || '';

    let noteEdit = document.createElement('button');
    noteEdit.setAttribute('class', 'top-right-edit-button');
    noteEdit.innerHTML = '<i class="fas fa-pencil-alt"></i>';
    $(noteEdit).click(function () {
        let textarea = $(this).prev('div').html();
        let edittext = $('<textarea spellcheck="false" />');
        edittext.val(textarea);
        $(this).prev('div').replaceWith(edittext);
        edittext.focus();
        edittext.blur(function () {
            let html = $(this).val();
            hdata.note = html;
            let viewtext = $("<div>");
            viewtext.html(html);
            $(this).replaceWith(viewtext);
            if (html != "") {
                $(himage).addClass('commented');
            } else {
                $(himage).removeClass('commented');
            }
            editHistoryEntry(hdata._links.self.href, hdata);
        })

        edittext.keypress(function (e) {
            if (e.which == 13) {
                let html = $(this).val();
                hdata.note = html;
                let viewtext = $("<div>");
                viewtext.html(html);
                $(this).replaceWith(viewtext);
            }
        });

    });

    note.appendChild(noteText);
    note.appendChild(noteEdit);
    panel.appendChild(note);

    panel.setAttribute('class', 'history-element');
    $(himage).click(function (event) {
        event.stopPropagation();
        load(history[i].enabled, history[i].mouseEnabled, history[i].boxSelectors);
        previousEntry = i;
        console.log('loaded no ' + previousEntry);
    });
    $(himage).hover(function () {
        if (!arrayEqual(enabled, hdata.enabled)) {
            showTimer = 1;
            showTemp(hdata);
        }
    }, function () {
        hideTemp();
    });
    if (hdata.important == true) {
        $(himage).addClass('enabled');
    }
    if (hdata.note != null) {
        $(himage).addClass('commented');
    }
    panel.appendChild(himage);

    let buttonbar = document.createElement('div');
    buttonbar.setAttribute('class', 'history-buttonbar');

    let importantButton = document.createElement('button');
    importantButton.setAttribute('class', 'history-important-button');
    importantButton.innerHTML = '<i class="fas fa-exclamation"></i>';
    $(importantButton).click(function () {
        $(himage).toggleClass('important');
        $(importantButton).toggleClass('enabled');
        hdata.important = !hdata.important;
        editHistoryEntry(hdata._links.self.href, hdata);
    });


    let commentButton = document.createElement('button');
    commentButton.setAttribute('class', 'history-comment-button');
    commentButton.innerHTML = '<i class="fas fa-comment"></i>'
    $(commentButton).click(function () {
        $(noteEdit).click();
    })

    buttonbar.appendChild(importantButton);
    buttonbar.appendChild(commentButton);

    panel.appendChild(buttonbar);

    $('#history').append(panel);
    historyCount++;
    historyTarget = historyCount - 1;
    historyAnimation = true;
}

function arrayEqual(a1, a2) {
    if (a1.length != a2.length) return false;
    for (let i = 0; i < a1.length; i++) {
        if (a1[i] != a2[i]) return false;
    }
    return true;
}

function showTemp(historyEntry) {
    if (showTimer == 0) {
        return;
    } else if (showTimer > 30) {
        for (let i = 0; i < historyEntry.enabled.length; i++) {
            if (historyEntry.enabled[i]) {
                if (countryIdMap[indexToName[i]] != null) {
                    $('#' + countryIdMap[indexToName[i]]).addClass('land-temp');
                }
                countryDOMElements[i].addClass('red-border');
            }
        }
    } else {
        showTimer++;
        requestAnimationFrame(function () {
            showTemp(historyEntry);
        });
    }

}

function hideTemp() {
    showTimer = 0;
    $('#worldmap').find('.land-temp').removeClass('land-temp');
    $('.red-border').removeClass('red-border');
}


function historyPanelLoop(dom) {
    if (historyAnimation && (historyDisplayMode == 0)) {
        historyUpdatePosition();
        historyUpdateDOM(dom);
    }
    requestAnimationFrame(function(){
        historyPanelLoop(dom);
    });
}

function historyUpdateDOM(dom) {
    let ch = dom.children();
    let hidden = [];
    let filtering = false;
    if (historyImpFilter || historyCommFilter) {
        let filtered = false;
        for (let i = 0; i < ch.length; i++) {
            filtered = false;
            if (historyCommFilter) {
                if ($(ch[i]).find('img.commented').length > 0) {
                    filtered = true;
                    filtering = true;
                }
            }
            if (historyImpFilter) {
                console.log(i + ' ' + $(ch[i]).find('img').hasClass('important'))
                if ($(ch[i]).find('img.important').length > 0) {
                    filtered = true;
                    filtering = true;
                }
            }
            hidden[i] = !filtered;
        }
    }
    let skipped = 0;
    if (filtering) {
        for (let i = 0; i < historyTarget; i++) {
            if (hidden[i]) {
                skipped++;
            }
        }
        if (historyModeInitial) {
            historyTarget = 0;
            historyModeInitial = false;
        }
    }

    for (let i = 0; i < historyCount; i++) {

        if (!hidden[i]) {
            $(ch[i]).show();
            let pos = ((i) - historyPosition + historyRadius) / (historyRadius * 2);
            let size = 1 - Math.abs(pos - 0.5);
            let outside = (pos < -(1 / historyRadius)) || (pos > 1 + 1 / historyRadius);
            if (i == 0) {
                // console.log(historyPosition);
                // console.log(historyRadius);
                // console.log(outside);

            }
            if (!outside) {
                if (pos < 0) {
                    pos = 0;
                    size = 0.5;
                }
                if (pos > 1) {
                    pos = 1;
                    size = 0.5;
                }
                $(ch[i]).css({
                    'left': historyWidth * historyPositionConverter(pos) + historyOffsetX + 'px',
                    'transform': 'scale(' + size + ')',
                    'z-index': Math.round(size * 10)
                });
                if ($(ch[i]).children().length > 1) {
                    let opacity = 1 - 2 * Math.abs(historyPositionConverter(pos) - 0.5);
                    $(ch[i]).find('.history-previous, .history-note').css('opacity', opacity);
                }

            }
        } else {
            $(ch[i]).hide();
            skipped++;
        }

    }

}

/**
 * converts from 0..1 to 0..1 using some mathematical function to create smooth movement from linear movement.
 */
function historyPositionConverter(pos) {
    if (pos == 0) return 0;
    if (pos == 1) return 1;
    if (pos >= 0.5) {
        return 1 - 0.5 * ((pos - 1) * 2) * ((pos - 1) * 2);
    }
    if (pos < 0.5) {
        return 0.5 * (pos * 2) * (pos * 2)
    }
}

function historyUpdatePosition() {
    historyMovement = (historyTarget - historyPosition) / 8;
    console.log(historyTarget-historyPosition);
    if (Math.abs(historyTarget - historyPosition) < 0.005) {
        historyPosition = historyTarget;
        historyAnimation = false;
    } else historyPosition += historyMovement;
}


function saveHistoryEntry(entry) {
    let boxS = [];
    for (let i = 0; i < entry.boxSelectors.length; i++) {
        boxS.push(JSON.stringify(entry.boxSelectors[i]));
    }
    $.ajax({
        url: serviceURL,
        type: 'POST',
        data: JSON.stringify({ lastName: currentUser, enabled: entry.enabled, previous: entry.previous, important: entry.important, note: entry.note, timestamp: entry.timestamp, boxSelectors: boxS, mouseEnabled: entry.mouseEnabled }),
        contentType: "application/json; charset=utf-8",
        dataType: 'json'
    }).done(function (data) {
        console.log('saved');
        console.log(entry);
        console.log(data);

        entry = data;

    });

    // $.post(serviceURL,{lastName:currentUser,enabled:entry.enabled,previous:entry.previous,important:entry.important,note:entry.note,timestamp:entry.timestamp},function(data){
    //     entry.id=data.content.id;
    // });
}

function deleteHistoryEntry(url) {
    $.ajax({
        url: url,
        type: 'DELETE'
    })
}

function editHistoryEntry(url, entry) {
    let boxS = [];
    for (let i = 0; i < entry.boxSelectors.length; i++) {
        boxS.push(JSON.stringify(entry.boxSelectors[i]));
    }
    console.log('--------------')
    console.log(entry.important);
    $.ajax({
        url: url,
        type: 'PUT',
        data: JSON.stringify({ lastName: currentUser, enabled: entry.enabled, previous: entry.previous, important: entry.important, note: entry.note, timestamp: entry.timestamp, boxSelectors: boxS, mouseEnabled: entry.mouseEnabled }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'
    })
}

function loadOwnHistory() {
    return $.get(serviceURL + '/search/findByLastName?name=' + currentUser, function (data) {
        console.log('data loaded');
        let h = data._embedded.history;
        let s = [];
        for (let i = 0; i < h.length; i++) {
            s = [];
            for (let j = 0; j < h[i].boxSelectors.length; j++) {
                s.push(JSON.parse(h[i].boxSelectors[j]));
                if (typeof s[j] == "string") {
                    s[j] = JSON.parse(s[j]);
                }
            }

            h[i].boxSelectors = s;
            history.push(h[i]);
            addHistoryEntry(i);
        }
    })
}

function loadAllHistories() {
    $.get(serviceURL + '/search/OrderByLastNameAsc', function (data) {
        console.log('data loadedddd');
        allHistoryData = data._embedded.history;
        console.log(allHistoryData);
    })
}

function createSelectorButtons() {
    let buttons = document.createElement('div');
    const selectorIcons = ['fas fa-square', 'fas fa-expand', 'fas fa-mouse-pointer', 'fas fa-times', 'fas fa-trash'];
    buttons.setAttribute('class', 'buttonmenu-bottom-left');
    for (let i = 0; i < selectors.length; i++) {
        let b = document.createElement('button');
        b.setAttribute('class', 'iconbutton color-selectors');
        if (i == 0) b.setAttribute('class', 'iconbutton color-selectors selected');
        if (selectorIcons[i].startsWith('fa')) {
            b.innerHTML = '<i class="' + selectorIcons[i] + '"></i>';
        } else {
            b.innerHTML = selectorIcons[i];
        }
        if (i == 4) {
            $(b).mousedown(function (e) {
                e.stopPropagation();
            });
            $(b).click(function () {
                empty();
            })
        } else {
            $(b).mousedown(function (e) {
                e.stopPropagation();
            });
            $(b).click(function () {
                if (!$(b).hasClass('selected')); {
                    let p = $(b).parent();
                    p.find('.selected').removeClass('selected');
                    $(b).addClass('selected');
                    changeSelectionMode(i);
                }

            })
        }

        buttons.appendChild(b);
    }

    $('#main').append(buttons);
}

function changeSelectionMode(index) {
    selector = index;
}