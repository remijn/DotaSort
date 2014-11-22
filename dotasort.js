var steam = require("steam"),
    util = require("util"),
    fs = require("fs"),
    dota2 = require("dota2"),
    bot = new steam.SteamClient(),
    Dota2 = new dota2.Dota2Client(bot, true),
    SteamTrade = require("steam-trade"),
    steamTrade = new SteamTrade();

var args = process.argv;
var run = !( args.indexOf("--norun") >= 0 );

var tradeReady = false;
var dotaReady = !run;
var didSort = false;

var collwidth = 6;
var rowheight = 6;

global.config = require("./config");

/* Steam logic */
var onSteamLogOn = function onSteamLogOn(){
        bot.setPersonaState(steam.EPersonaState.Online); // to display your bot's status as "Online"
        if(config.steam_name) bot.setPersonaName(config.steam_name); // to change its nickname
        util.log("Logged on.");

        if(run) Dota2.launch();
        Dota2.on("ready", function() {
            console.log("Node-dota2 ready.");
            dotaReady = true;
            /* Note:  Should not declare new event listeners nested inside of
             'ready', else you could end up with duplicated handlers if 'ready'
             is fired multiple times.  Exception is made within this test file
             for the same of keeping relevant samples together. */

            /* INVENTORY */
            // Dota2.setItemPositions([[ITEM ID, POSITION]]);
            // Dota2.deleteItem(ITEM ID);

            getInventory();

        });

        Dota2.on("unready", function onUnready(){
            console.log("Node-dota2 unready.");
            dotaReady = false;
        });

        Dota2.on("chatMessage", function(channel, personaName, message) {
            // util.log([channel, personaName, message].join(", "));
        });

        Dota2.on("guildInvite", function(guildId, guildName, inviter) {
            // Dota2.setGuildAccountRole(guildId, 75028261, 3);
        });

        Dota2.on("unhandled", function(kMsg) {
            util.log("UNHANDLED MESSAGE " + kMsg);
        });
    },
    onSteamSentry = function onSteamSentry(sentry) {
        util.log("Received sentry.");
        require('fs').writeFileSync('sentry', sentry);
    },
    onSteamServers = function onSteamServers(servers) {
        util.log("Received servers.");
        fs.writeFile('servers', JSON.stringify(servers));
    },
    onWebSessionID = function onWebSessionID(webSessionID) {
        util.log("Received web session id.");
        steamTrade.sessionID = webSessionID;
        bot.webLogOn(function onWebLogonSetTradeCookies(cookies) {
            util.log("Received cookies.");
            for (var i = 0; i < cookies.length; i++) {
                steamTrade.setCookie(cookies[i]);
            }
            tradeReady = true;
            getInventory();
        });
    };

// Login, only passing authCode if it exists
var logOnDetails = {
    "accountName": config.steam_user,
    "password": config.steam_pass
};
if (config.steam_guard_code) logOnDetails.authCode = config.steam_guard_code;
fs.appendFileSync('sentry', ""); //Appends a empty string to the file, this creates the file if it doesnt exists
var sentry = fs.readFileSync('sentry');
if (sentry.length>0) logOnDetails.shaSentryfile = sentry;
bot.logOn(logOnDetails);
bot.on("loggedOn", onSteamLogOn)
    .on('sentry', onSteamSentry)
    .on('servers', onSteamServers)
    .on('webSessionID', onWebSessionID);

var getInventory = function(){
    if(tradeReady && dotaReady && !didSort){
        console.log("getInventory")
        didSort = true;
        steamTrade.loadInventory(570, 2, function(data){

            //fs.writeFile("data", JSON.stringify(data, null, 2));

            var items = getSortSolution(data);

            if(run) Dota2.setItemPositions(items);
        });
    }
}

var getSortSolution = function(data){

    var startTime = Date.now();

    /*

    ------ITEM------
    Format:
    id,    : Item ID used for moving etc.
    pos,   : Position in steam inv, not in Dota inv
    newpos,: new Position
    hero,  : Hero name, other if not wearable
    type,  : wearable, tool, etc.
    name,   : name of the item.
    slot,   : Slot the item goes in

    */
    var items = parseItemList(data);

    //Sort items by heroname

    items.sort(function(a, b){
        if(a.hero == "Other" && b.hero != "Other") return 1;
        if(a.hero != "Other" && b.hero == "Other") return -1;
        if(a.hero < b.hero) return -1;
        if(a.hero > b.hero) return 1;
        if(a.type < b.type) return -1;
        if(a.type > b.type) return 1;
        if(a.slot < b.slot) return -1;
        if(a.slot > b.slot) return 1;
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
    });

    var currrow = 0;
    var currcol = 1;

    var lastHero = "";
    var lastType = "";
    var diffHero = false;
    for(var i=0;i<items.length;i++){
        if (items[i].hero != lastHero && lastHero != "") {currrow = nextOpenRow(currrow); currcol = 1; diffHero = true;}; //Heroes are different, place on next row

        if (items[i].type != lastType && lastType != "" && !diffHero && items[i].hero == "Other" ) {currrow = nextOpenRow(currrow); currcol = 1;} //Type is different, and hero is not, place on next line

        if (currcol > collwidth) {currcol = 1; currrow++;}
        items[i].newpos = getPosition(currrow, currcol);
        lastHero = items[i].hero;
        lastType = items[i].type;
        diffHero = false;
        currcol++;
    }

    //Convert to tuple for sending

    var sort = []; //Format [[id, newpos], [id, newpos], [id, newpos]]

    for(var i=0;i<items.length;i++){
        sort.push([items[i].id, items[i].newpos]);
    }

    var endTime = Date.now();
    console.log("Sort took " + (endTime - startTime) + "ms");

    console.log(items);

    return sort;

}

var nextOpenRow = function(lastrow){
    if(lastrow % 10 == 9) return lastrow+1;
    else return lastrow + config.rowSpace+1;
}

var getPosition = function(row, col){
    return row*6 + col;
}

var parseItemList = function(data){
    var items = [];

    function item(){
        this.id = 0;
        this.pos = 0;
        this.newpos = 0;
        this.hero = "Other";
        this.type = "Wearable";
        this.name = "";
        this.slot = "";
    }

    for(var i=0;i<data.length;i++){

        var Item = new item();

        Item.id = data[i].id;
        Item.pos = Item.newpos = data[i].pos;
        Item.name = data[i].name;
        for(var j=0;j<data[i].tags.length;j++){
            if(data[i].tags[j].category_name == "Hero"){
                Item.hero = data[i].tags[j].name;
            }
            if(data[i].tags[j].category_name == "Type"){
                Item.type = data[i].tags[j].name;
            }
            if(data[i].tags[j].category_name == "Slot"){
                Item.slot = data[i].tags[j].name;
            }
        }

        items.push(Item);
    }

    return items;
}

steamTrade.on("error", function(error){
    console.error(error);
});
