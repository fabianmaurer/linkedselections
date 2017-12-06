
let data = [];
let mousex = 0;
let mousey = 0;
let dragging = false;
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
    l.setAttribute('id', 'loadingtext');
    $('#main').append(l);
    setTimeout(loading1, 100);
    setTimeout(loading2, 700);
    setTimeout(loading3, 1300);
    setTimeout(dissolveLoading, 1900);

}

function loading1() {
    $('#loadingtext')[0].innerHTML += ".";
}
function loading2() {
    $('#loadingtext')[0].innerHTML += ".";
}
function loading3() {
    $('#loadingtext')[0].innerHTML += ".";
}

function dissolveLoading() {
    console.log('loading done');
    $('#loadingtext').hide();
    $('#dataoptionexpand').animate({
        "font-size": "100px",
        "opacity": "0"
    }, 200)
    graphView();
}

function graphView() {
    enabledDragging();
}

function enabledDragging() {
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