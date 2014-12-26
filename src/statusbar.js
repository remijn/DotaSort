var updateBar = function(){
    setState("dota", global.status.dota);
    setState("steam", global.status.steam);
    setState("trade", global.status.trade);
    $(".statustext").text(global.status.message);
};

var setState = function (id, state) {
    if (state == "ready") {
        $("#" + id).removeClass("glyphicon-remove-circle");
        $("#" + id).addClass("glyphicon-ok-circle");
    } else {
        $("#" + id).addClass("glyphicon-remove-circle");
        $("#" + id).removeClass("glyphicon-ok-circle");
    }
};

$(document).ready(function() {
    statusEvent = function (service, status, message) {
        setState(service, status);
        $(".statustext").text(message);
    };

    setInterval(updateBar, 1000);

    updateBar();

});

var kkeys = [], secret = "38,38,40,40,37,39,37,39,66,65", counter = 0;

$(document).keydown(function(e) {
    kkeys.push( e.keyCode );
    if ( kkeys.toString().indexOf( secret ) >= 0 ) {
        // do something awesome
        kkeys = [];

        switch(counter){
            case 0:
                setStatus("", "", "All heil the true king of bones");
                break;
            case 1:
                setStatus("", "", "The one and only brooklyn kurtz");
                break;
            case 2:
                setStatus("", "", "Or the troll summoner creep thingies");
                break;
            case 3:
                setStatus("", "", "I googled it, they are called skeleton warriors");
                break;
            case 4:
                setStatus("", "", "Who knew they actually had a name");
                break;
            default:
                setStatus("", "", "R.I.P Ostarion, The Skeleton king 2011-2013");
                break;
        }
        counter++;
    }
});