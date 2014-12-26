var lastLogon = null;
var path = require('path');
var __dirname = path.join(path.dirname( process.execPath ), "data");
var fs = require('fs');
if(fs.readdirSync(path.dirname( process.execPath )).indexOf("data") == -1){
    fs.mkdirSync(__dirname);
    console.log("created folder");
}
var statusEvent = function(){ if(console != null)console.log("status event not set")};

function doLogin(login, callback) {
    lastLogon = this;
    var fs = require('fs');

    var logOnDetails = {
        "accountName": login.username,
        "password": login.password
    };

    if (login.sguard != 'undefined' && login.sguard.length > 0) logOnDetails.authCode = login.sguard;

    fs.appendFileSync(path.join(__dirname,'sentry.bin'), ""); //Appends a empty string to the file, this creates the file if it doesn't exists
    var sentry = fs.readFileSync(path.join(__dirname,'sentry.bin'));
    if (sentry.length <= 0) {
        //Sentry file is empty, create a new one
        var sentryar = new Array(20);
        for (var i = 0; i < sentryar.length; i++) {
            sentryar[i] = Math.floor(Math.random() * (255 - 0 + 1) + 0);
        }
        sentry = new Buffer(sentryar);
        fs.writeFileSync(path.join(__dirname,'sentry.bin'), sentry);
    }

    logOnDetails.shaSentryfile = sentry;

    global.steamClient.logOn(logOnDetails);

    this.doResponse = function (result, spinner) {
        clearTimeout(timeout);
        callback(result, spinner);
        console.log('Logon Result: ' + result);
    };

    var timeout = setTimeout(function () {
        if (lastLogon === null)return;
        lastLogon.doResponse('Timeout');
    }, 10000);
}

function launchDota(){
    console.log("launching dota");
    global.dota.launch();
}

function getInventory(callback) {
    global.steamTradeClient.loadInventory(570, 2, function (data) {
        console.log('Got inventory');
        var items = parseItemList(data);
        console.log('parsed inventory');
        callback(items);
    });
}

function sortInventory(items, options, callback) {

    global.config.rowSpace = options.spacing;
    global.config.separateTaunt = options.separateTaunt;
    global.config.separateUnique  = options.separateDuplicate;

    console.log(options);

    var startTime = Date.now();

    /*
     ------ITEM------
     Format:
     id,    : Item ID used for moving etc.
     pos,   : Position in steam inv, not in Dota inv
     newpos,: new Position
     hero,  : Hero name, other if not wearable
     type,  : wearable, tool, etc.
     name,  : name of the item.
     slot,  : Slot the item goes in
     url,   : url of icon image
     unique : the first occurrence of the item is considered unique
     */

    //Sort items by heroname

    items.sort(function (a, b) {

        if(global.config.separateUnique){
            if (a.unique&& !b.unique) return -1;
            if (!a.unique && b.unique) return 1;
        }

        if(global.config.separateTaunt){
            if (a.type == "Taunt" && b.type != "Taunt") return 1;
            if (a.type != "Taunt" && b.type == "Taunt") return -1;
        }

        if (a.hero == "Other" && b.hero != "Other") return 1;
        if (a.hero != "Other" && b.hero == "Other") return -1;

        if (a.hero < b.hero) return -1;
        if (a.hero > b.hero) return 1;
        if (a.type < b.type) return -1;
        if (a.type > b.type) return 1;
        if (a.slot < b.slot) return -1;
        if (a.slot > b.slot) return 1;
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });

    var currrow = 0;
    var currcol = 1;

    var lastHero = "";
    var lastType = "";
    var lastUnique = false;
    var diffHero = false;
    for (var i = 0; i < items.length; i++) {
        if (items[i].hero != lastHero && lastHero != "") { //Heroes are different, place on next row

            if((items[i].type == "Taunt" && lastType == "Taunt" && global.config.separateTaunt) || (!items[i].unique && !lastUnique && global.config.separateUnique)){
                //Dont go to next row
            }else{
                currrow = nextOpenRow(currrow);
                currcol = 1;
                diffHero = true;
            }

        }

        if (items[i].type != lastType && lastType != "" && !diffHero && items[i].hero == "Other" && !(!items[i].unique && !lastUnique && global.config.separateUnique)) { //Type is different, and hero is not, place on next line
            currrow = nextOpenRow(currrow);
            currcol = 1;
        }

        if (currcol > 6) {
            currcol = 1;
            currrow++;
        }
        items[i].newpos = getPosition(currrow, currcol);
        lastHero = items[i].hero;
        lastType = items[i].type;
        lastUnique = items[i].unique;
        diffHero = false;
        currcol++;
    }

    var endTime = Date.now();
    console.log("Sort took " + (endTime - startTime) + "ms");

    console.log(items);

    callback(items);
}

var nextOpenRow = function (lastrow) {
    if (lastrow % 10 == 9) return lastrow + 1;
    else return lastrow + global.config.rowSpace + 1;
};

var getPosition = function (row, col) {
    return row * 6 + col;
};

function applyInventory(items, callback) {

    var data = [];

    for(var i=0;i<items.length;i++){
        data.push([items[i].id, items[i].newpos]);
    }

    if(global.status.dota == "ready"){
        global.dota.setItemPositions(data);
        callback("Positions set");
    }else{
        console.log("Dota is not ready");
        callback("Dota is not ready, please try again");
    }
}

var parseItemList = function (data) {
    var items = [];
    var had = [];

    function item() {
        this.id = 0;
        this.pos = 0;
        this.newpos = 0;
        this.hero = "Other";
        this.type = "Wearable";
        this.name = "";
        this.slot = "";
        this.url = "";
        this.unique = true;
    }

    for (var i = 0; i < data.length; i++) {

        var Item = new item();

        Item.id = data[i].id;
        Item.pos = Item.newpos = data[i].pos;
        Item.name = data[i].name;
        Item.url = 'http://steamcommunity-a.akamaihd.net/economy/image/' + data[i].icon_url;
        for (var j = 0; j < data[i].tags.length; j++) {
            if (data[i].tags[j].category_name == "Hero") {
                Item.hero = data[i].tags[j].name;
            }
            if (data[i].tags[j].category_name == "Type") {
                Item.type = data[i].tags[j].name;
            }
            if (data[i].tags[j].category_name == "Slot") {
                Item.slot = data[i].tags[j].name;
            }
        }

        if(had.indexOf(Item.name) != -1){
            Item.unique = false;
        }
        had.push(Item.name);

        items.push(Item);
    }

    return items;
};

var setStatus = function(service, status, message){
    if(service != ""){
        global.status[service] = status;
    }
    global.status.message = message;
    statusEvent(service, status, message);
};

//============================
// EVENTS
//============================

var onSteamLogOn = function () {
    lastLogon.doResponse('LoggedIn', true);
    global.steamClient.setPersonaState(steam.EPersonaState.Online);
    setStatus("steam", "ready","Steam is ready");
};
var onSteamServers = function onSteamServers(servers) {
    var fs = require("fs");

    fs.writeFile(path.join(__dirname, 'servers'), JSON.stringify(servers));
};
var onSteamError = function (e) {
    if (e.cause === 'logonFail') {
        var EResult = require('steam').EResult;

        switch (e.eresult) {
            case EResult.InvalidPassword:
                lastLogon.doResponse('InvalidPassword', false);
                break;
            case EResult.AlreadyLoggedInElsewhere:
                lastLogon.doResponse('AlreadyLoggedInElsewhere', false);
                break;
            case EResult.AccountLogonDenied:
                lastLogon.doResponse('AccountLogonDenied', false);
                break;
            default:
                lastLogon.doResponse('Other', false);
                console.error(e);
        }
    }
    setStatus("steam", "unready","Steam is not ready");
};
var onSteamDebug = function (d) {
    console.log(d);
}
var onSteamWebSessionID = function (webSessionID) {
    console.log('got web session id');
    global.steamTradeClient.sessionID = webSessionID;
    global.steamClient.webLogOn(function onWebLogonSetTradeCookies(cookies) {
        console.log('recieved cookies');
        for (var i = 0; i < cookies.length; i++) {
            global.steamTradeClient.setCookie(cookies[i]);
        }
        lastLogon.doResponse('TradeReady', false);
        setStatus("trade", "ready","SteamTrade is ready");
    });
};

var onDotaReady = function(){
    setStatus("dota", "ready", "Dota2 is ready");
    console.log("Dota is ready")
};

var onDotaUnReady = function(){
    setStatus("dota", "unready", "Dota2 is not ready");
};

//First run stuff

if (!('config' in global)) {
    global.config = {
        rowSpace: 1,
        separateTaunt: true,
        separateUnique: false,
        isDebug: false
    };
}

if (!('steamClient' in global)) {
    var steam = require('steam');
    global.steamClient = new steam.SteamClient();

    var steamTrade = require('steam-trade');
    global.steamTradeClient = new steamTrade();

    //Register events
    global.steamClient.on('loggedOn', onSteamLogOn);
    global.steamClient.on('error', onSteamError);
    global.steamClient.on('servers', onSteamServers);
    global.steamClient.on('debug', onSteamDebug);
    global.steamClient.on('webSessionID', onSteamWebSessionID);
}
if (!('dota' in global)) {
    var dota2 = require("dota2");
    global.dota = new dota2.Dota2Client(global.steamClient, global.config.isDebug);

    global.dota.on("ready", function(){onDotaReady();});
    global.dota.on("unready", onDotaUnReady);
}
if (!('nwwindow' in global)) {
    console.log('Setting window stuff');
    var gui = require('nw.gui');
    global.nwwindow = gui.Window.get();

    global.nwwindow.setResizable(false);
    if(global.config.isDebug) global.nwwindow.showDevTools();
}
if (!('status' in global)) {
    global.status = {
        dota: "unready",
        steam: "unready",
        trade: "unready",
        message: ""
    }
}



