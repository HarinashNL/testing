var queryString = '?';
var domain = location.hostname;
// domain = 'iq.funplus.world';

const s3 = 'http://mobiscope.net.s3-website-ap-southeast-1.amazonaws.com/';
var pt_language = 'french'; // Set default to French
var a_uth = document.getElementsByClassName("auth");
var typingTimer;                //timer identifier
var doneTypingInterval = 350;   //time in ms, 5 second for example
var auth = false, modal = false;
// var defaultStr = window.location.search;
// var urlParams = new URLSearchParams(defaultStr);
// var token = urlParams.get('token'), detail = urlParams.get('detail');

var pathname = window.location.pathname;
pathname = window.location.href.split('/');
var lastTwo = pathname.slice(-2);
if (lastTwo[0] == 'detail') {
    localStorage.setItem("open_modal", lastTwo[1]);
}

document.addEventListener('DOMContentLoaded', function () {

    var def_lang = window.navigator.language;
    if (def_lang.includes("fr")) pt_language = 'french'
    if (def_lang.includes("bg")) pt_language = 'bulgarian'
    if (def_lang.includes("fi")) pt_language = 'finnish'
    if (def_lang.includes("el")) pt_language = 'greek'
    if (def_lang.includes("ar")) pt_language = 'arabic'
    if (def_lang.includes("id")) pt_language = 'indonesian'
    if (def_lang.includes("in")) pt_language = 'indonesian'
    if (def_lang.includes("no")) pt_language = 'norwegian'
    if (def_lang.includes("nb")) pt_language = 'norwegian'
    if (def_lang.includes("nn")) pt_language = 'norwegian'
    if (def_lang.includes("ro")) pt_language = 'romanian'
    if (def_lang.includes("cs")) pt_language = 'czech'
    if (def_lang.includes("ms")) pt_language = 'malay'
    if (def_lang.includes("sv")) pt_language = 'swedish'
    language(localStorage.getItem("pt_language") ?? pt_language)

    setHoroscopeBanner()
    document.getElementById('banner-horoscope').classList.add('active')

    auth = authentication();
    if (auth) {
        successLogin()
    } else {
        setPrefix()
    }
    // successLogin()
    lazyLoadInstance.update();
});
function setPrefix() {
    var country_code = window.location.host;
    country_code = country_code.split(".")[0];
    readTextFile("http://games4all.vip.s3-website-us-east-1.amazonaws.com/country_list.json", function (text) {
        var prefix = JSON.parse(text);
        if (prefix) {
            if (prefix.hasOwnProperty(country_code)) {
                prefix = prefix[country_code]['prefix'];
                document.getElementById('msisdn').value = prefix;
            } else {
                console.warn("Index in prefix.json does not exist");
            }
        }
    });
}
// sidebar detection
var newWidth = window.innerWidth;
if (newWidth <= 1200) {
    document.getElementById('wrapper').classList.remove('show-sidebar');
} else {
    document.getElementById('wrapper').classList.add('show-sidebar');
}
window.addEventListener('resize', function (event) {
    newWidth = window.innerWidth;
    if (newWidth <= 1200) {
        document.getElementById('wrapper').classList.remove('show-sidebar');
    } else {
        document.getElementById('wrapper').classList.add('show-sidebar');
    }
});

function clear_cache() {
    localStorage.removeItem('userTokenID_mobis');
    localStorage.removeItem('userMsisdn_mobis');
    localStorage.removeItem('userGateway_code_mobis');
    localStorage.removeItem('userCountry_code_mobis');
    window.location.href = 'http://' + domain;
}

function success_unsub() {
    readTextFile("http://games4all.vip.s3-website-us-east-1.amazonaws.com/json/" + pt_language + ".json", function (text) {
        var data_l = JSON.parse(text);
        document.getElementById('error-modal').classList.add('active');
        document.getElementById('backdrop').classList.add('active');
        document.getElementById('error-modal').innerHTML = '';
        document.getElementById('error-modal').innerHTML = '<h2 id="error_title">' + data_l['unsub_success'] + ' Mobiscope.</h2>';
        setTimeout(function () {
            clear_cache()
        }, 1000);
    });
}

function resetModal() {
    document.getElementById('error-modal').innerHTML = '';
    document.getElementById('error-modal').innerHTML =
        '    <h2 id="error_title">Undefined Errors</h2>\n' +
        '    <p id="error_msg"></p>\n' +
        '    <button onclick="errors()">Close</button>\n' +
        '</div>';
}

function unsubscribe() {
    load();
    var host = window.location.host;
    host = host.split(".");
    var gcid = host[1] ?? '269'
    var migrated = ["296", "279", "280", "301", "313", "362", "363", "349", "264"]
    // new
    // if (migrated.includes(gcid)){
    let token = localStorage.getItem('userTokenID_mobis');

    if (token.includes("_")) {
        token = token.split("_");
        token = token[1];
    }
    else if (token.includes("P")) {
        token = token.split("P");
        token = token[1];
    }

    data = {
        "token": token,
        "gid": gcid
    };

    data = JSON.stringify(data);
    unsub_url = "https://prod.api.puretechglobal.net/content/unsub"

    let jqxhr = $.ajax({
        type: "POST",
        url: unsub_url,
        data: data,
        contentType: "application/json",
    });

    jqxhr.done(function (data) {
        if (data.status == "success")
            success_unsub();
        else
            errors("Unsub failed");
    });

    jqxhr.fail(function () {
        errors("Unsub failed");
    });
    // }
    // else {
    //     var url = 'http://api.puretechglobal.net/gateway_request/'+localStorage.getItem('userCountry_code_mobis')+'/'+localStorage.getItem('userGateway_code_mobis')+'/unsub.php?code='+localStorage.getItem('userTokenID_mobis')+'&msisdn='+localStorage.getItem('userMsisdn_mobis')
    //     url = 'https://api.allorigins.win/get?url='+encodeURIComponent(url);
    //     var xhttp   = new XMLHttpRequest();
    //     xhttp.onload = function() {
    //         load();
    //         try {
    //             var myStringArray = JSON.parse(this.responseText);
    //             myStringArray = JSON.parse(myStringArray['contents'])
    //             if(myStringArray['status'] == 'success'){
    //                 success_unsub()
    //             }
    //             else{
    //                 errors('Unsub failed','')
    //             }
    //         }
    //         catch (e) {
    //             errors('Unsub failed','')
    //         }
    //     }
    //     xhttp.open("GET", url, true);
    //     xhttp.send();
    // }
}

function confirm_logout() {
    errors('', '');
    load();
    var host = window.location.host;
    var url = 'http://cook.grabmobi.com/api/domain?token=xB2I1pLjD39Gsa0opKnVnMxEwQyeyIoP6'
    var xhttp = new XMLHttpRequest();
    var no_data = true;
    xhttp.onload = function () {
        load();
        var myStringArray = JSON.parse(this.responseText);
        for (var i = 0; i < myStringArray['data'].length; i++) {
            if (host == myStringArray['data'][i]['domain']) {
                // if operator allow
                no_data = false;
                if (myStringArray['data'][i]['is_unsub'] == 1) {
                    unsubscribe();
                }
                else {
                    clear_cache()
                }
            }
        }

        if (no_data) {
            clear_cache()
        }
    }
    xhttp.open("GET", url, true);
    xhttp.send();
}

function logout() {
    readTextFile("http://games4all.vip.s3-website-us-east-1.amazonaws.com/json/" + pt_language + ".json", function (text) {
        var data_l = JSON.parse(text);
        document.getElementById('error-modal').classList.add('active');
        document.getElementById('backdrop').classList.add('active');
        document.getElementById('error-modal').innerHTML = '';
        document.getElementById('error-modal').innerHTML = '<h2 id="error_title">' + data_l['unsub_confirmation'] + '</h2>\n' +
            '    <div class="error-modal-btn"><button onclick="cancel_logout()" class="error-modal-cancel">' + data_l['no'] + '</button>\n' +
            '    <button onclick="confirm_logout()" class="error-modal-confirm">' + data_l['yes'] + '</button></div>';
    });
}

function cancel_logout() {
    document.getElementById('error-modal').classList.remove('active');
    document.getElementById('backdrop').classList.remove('active');
}

function login() {
    var host = window.location.host;
    host = host.split(".");
    var gcid = host[1] ?? '269'
    var val = document.querySelector('#msisdn').value;
    val = val.replace(/[^a-zA-Z0-9]/g, '');
    var migrated = ["296", "279", "280", "301", "313", "362", "363", "349", "264"]
    let token = localStorage.getItem('userTokenID_mobis');

    if (token !== null && token !== '') {
        if (token.includes("_")) {
            token = token.split("_");
            token = token[1];
        }
        else if (token.includes("P")) {
            token = token.split("P");
            token = token[1];
        }
    }
    // gcid        = 296;
    // if (migrated.includes(gcid)){

    var url = 'https://prod.api.puretechglobal.net/content/auth?msisdn=' + val + '&gcid=' + gcid + '&verbose=1' + '&token=' + token;

    // }else{
    //     var url     = 'http://gateway.puretechglobal.net/gateway_request/api/sub/?msisdn='+val+'&gcid='+gcid+'&verbose=1';

    // }
    // url         = 'https://api.allorigins.win/get?url='+encodeURIComponent(url)+'&callback=?';

    $.getJSON(url, function (data) {
        // myStringArray = JSON.parse(data.contents)
        myStringArray = data
        if (myStringArray['status'] == 'active') {
            auth = true;
            localStorage.setItem('userTokenID_mobis', myStringArray['token']);
            localStorage.setItem('userMsisdn_mobis', myStringArray['msisdn']);
            localStorage.setItem('userGateway_code_mobis', myStringArray['gateway_code']);
            localStorage.setItem('userCountry_code_mobis', myStringArray['country_code']);
            localStorage.setItem('userSubscription_date_mobis', myStringArray['subscription_date']);
            successLogin()
        }
        else {
            auth = false;
            document.getElementById('content-login').classList.add('active');
            document.getElementById('content-details').classList.remove('active');
            for (var i = 0; i < a_uth.length; i++) {
                if (a_uth.item(i).id !== "lang-privacy") { // Exclude privacy link
                    a_uth.item(i).classList.add('ds');
                }
            }
            readTextFile("http://games4all.vip.s3-website-us-east-1.amazonaws.com/json/" + pt_language + ".json", function (text) {
                var data_l = JSON.parse(text);
                invalid_title = data_l['invalid_title'];
                invalid_desc = data_l['invalid_msg']
                errors(invalid_title, invalid_desc);
            });
        }
        return auth;
    });


}

function authentication() {

    // var token = localStorage.getItem("userTokenID_mobis");
    // if(token == null){
    //     // token = urlParams.get('token');
    //     var pathname = window.location.pathname;
    //     pathname = window.location.href.split('?')[0]
    //     pathname = pathname.split('/');
    //     token = pathname.slice(-1)[0];
    //     token = token.replace(/_/g, "p");
    // }
    var pathname = window.location.pathname;
    pathname = window.location.href.split('?')[0]
    pathname = pathname.split('/');
    token = pathname.slice(-1)[0];
    token = token.replace(/_/g, "p");
    if (token == null || token == '') {
        var token = localStorage.getItem("userTokenID_mobis");
    }
    var host = window.location.host;
    host = host.split(".");
    var gcid = host[1] ?? '269'
    var migrated = ["296", "279", "280", "301", "313", "362", "363", "349", "264"]
    // if (migrated.includes(gcid)){
    var url = 'https://prod.api.puretechglobal.net/content/auth?code=' + token + '&verbose=1'
    // }else{
    //     var url = 'http://gateway.puretechglobal.net/gateway_request/api/sub/?code='+token+'&verbose=1'
    // }
    // url         = 'https://api.allorigins.win/get?url='+encodeURIComponent(url)+'&callback=?';

    $.getJSON(url, function (data) {
        // myStringArray = JSON.parse(data.contents)
        myStringArray = data
        if (myStringArray['status'] == 'active') {
            auth = true;
            localStorage.setItem('userTokenID_mobis', token);
            localStorage.setItem('userMsisdn_mobis', myStringArray['msisdn']);
            localStorage.setItem('userGateway_code_mobis', myStringArray['gateway_code']);
            localStorage.setItem('userCountry_code_mobis', myStringArray['country_code']);
            localStorage.setItem('userSubscription_date_mobis', myStringArray['subscription_date']);
            localStorage.setItem('userStatus_mobis', myStringArray['status']);


            successLogin()
        }
        else {
            auth = false;
            document.getElementById('content-login').classList.add('active');
            document.getElementById('content-details').classList.remove('active');
            for (var i = 0; i < a_uth.length; i++) {
                if (a_uth.item(i).id !== "lang-privacy") { // Exclude privacy link
                    a_uth.item(i).classList.add('ds');
                }
            }
        }
        return auth;
    });
    // var url = 'http://gateway.puretechglobal.net/gateway_request/api/sub/?code='+token+'&verbose=1'
    // url     = 'https://api.allorigins.win/get?url='+encodeURIComponent(url);

    // var xhttp   = new XMLHttpRequest();
    // xhttp.onload = function() {
    //     var myStringArray = JSON.parse(this.responseText);
    //     myStringArray = JSON.parse(myStringArray['contents']);
    //     if (myStringArray['status'] == 'active') {
    //         auth = true;
    //         localStorage.setItem('userTokenID_mobis', token);
    //         localStorage.setItem('userMsisdn_mobis', myStringArray['msisdn']);
    //         localStorage.setItem('userGateway_code_mobis', myStringArray['gateway_code']);
    //         localStorage.setItem('userCountry_code_mobis', myStringArray['country_code']);
    //         successLogin()
    //     } else {
    //         auth = false;
    //         document.getElementById('content-login').classList.add('active');
    //         document.getElementById('content-details').classList.remove('active');
    //         for (var i = 0; i < a_uth.length; i++) {
    //             a_uth.item(i).classList.add('ds');
    //         }
    //     }
    //     return auth;
    // }
    // xhttp.open("GET", url, true);
    // xhttp.send();
}

function successLogin() {
    if (localStorage.getItem("open_modal")) {
        openModal(localStorage.getItem("open_modal"))
    }
    sidebar()
    menu('horoscope')
    auth = true;
    document.getElementById('content-login').classList.remove('active');
    document.getElementById('content-details').classList.add('active');
    for (var i = 0; i < a_uth.length; i++) {
        a_uth.item(i).classList.remove('ds');
    }
}

function sidebar() {
    let userStatus = localStorage.getItem('userStatus_mobis');
    let btnUnsubscribe = document.getElementById('btnUnsubscribe');

    // Check if userStatus exists and capitalize the first letter
    if (userStatus) {
        userStatus = userStatus.charAt(0).toUpperCase() + userStatus.slice(1);
    }

    // Check if userStatus is "unactive" and make the button visible
    let styleDisplay = 'none';
    if (userStatus && userStatus.toLowerCase() === 'active') {
        styleDisplay = 'block'; // Show the button
    } else {
        styleDisplay = 'none';  // Hide the button
    }
    if (btnUnsubscribe) {
        btnUnsubscribe.style.display = styleDisplay;
    }

    var profile = [`Mobile Number:<br/>${localStorage.getItem('userMsisdn_mobis')}`, 'Service Name:<br/>Mobiscope', `Subscription Start Date:<br/>${localStorage.getItem('userSubscription_date_mobis')}`,
    `Status:<br/>${userStatus}`];
    var profile_element = "";
    for (let item of profile) {
        profile_element += `<div class="" style="margin-bottom: 10%;"><p class="">${item}</p></div>`
    }
    let profileBoxElement = document.getElementById('profile-box');
    if (profileBoxElement) {
        profileBoxElement.insertAdjacentHTML('afterbegin', profile_element);
    }
    lazyLoadInstance.update();

    // var xhttp = new XMLHttpRequest();
    // xhttp.onload = function () {
    //     // document.getElementById("sidebar-lang").innerHTML = '';
    //     // var myStringArray = JSON.parse(this.responseText);
    //     // console.log(myStringArray);
    //     // var arrayLength = myStringArray['data'].length;
    //     // for (var i = 0; i < arrayLength; i++) {
    //     //     var all_lang = JSON.parse(myStringArray['data'][i]['subcategory_translate']);
    //     //     var title = all_lang['english']['title']
    //     //     var title_lang = all_lang[localStorage.getItem("pt_language")]
    //     //     var cate = title.replace(/\s/g, '%20')
    //     //     var p_id = 'ttl-' + cate.toLowerCase();
    //     //     // document.getElementById("sidebar-lang").innerHTML += "  <div onclick=category('" + cate + "') class=\"sidebar-content-icon\">\n" +
    //     //     //     "                    <p id='" + p_id + "'>" + title_lang['title'] + "</p>\n" +
    //     //     //     "                </div>";
    //     //     // document.getElementById("sidebar-lang").insertAdjacentHTML("afterend",
    //     //     //     "  <div onclick=category('"+cate+"') class=\"sidebar-content-icon\">\n" +
    //     //     //     "                    <p>"+title_lang['title']+"</p>\n" +
    //     //     //     "                </div>");
    //     // }
    // }

    // xhttp.open("GET", "http://cook.grabmobi.com/api/newcontents?token=xB2I1pLjD39Gsa0opKnVnMxEwQyeyIoP6&id=&category=video&subcategory=3&limit=100&offset=0&domain=" + domain, true);
    // // xhttp.open("GET", "http://cook.grabmobi.com/api/newcontents?token=xB2I1pLjD39Gsa0opKnVnMxEwQyeyIoP6&category=&subcategory=&limit=100&offset=0&domain=" + domain + "&lang=" + pt_language, true);
    // xhttp.send();
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
        else if (rawFile.status != "200") {
            language('english')
        }
    }
    rawFile.send(null);
}

var dump = '', body = document.body, curr_lang;


function sub_translate() {
    readTextFile("http://games4all.vip.s3-website-us-east-1.amazonaws.com/json/" + pt_language + ".json", function (text) {
        var data = JSON.parse(text);
        var lang = document.getElementsByClassName("lr");
        for (var i = 0; i < lang.length; i++) {
            var str = lang.item(i).className
            if (str.search("=") > 0) {
                str = str.split('=').pop().split(':')[0]
                str = str.toLowerCase();
                if (data[str] != undefined) {
                    lang.item(i).innerHTML = data[str]
                }
            }
        }
    });
}

function language(val) {
    curr_lang = document.body.className;
    curr_lang = curr_lang.split('=').pop().split(':')[0]
    document.body.classList.remove('=' + curr_lang + ':');
    localStorage.setItem("pt_language", val);
    pt_language = val

    setHoroscopeBanner()

    if (modal) closeModal()

    if (auth) {
        successLogin()
    }

    // document.getElementById('titleLang').innerHTML = document.getElementById('llt-' + val).innerHTML
    var lang = document.getElementsByClassName("lr");
    // if current language is different
    if (curr_lang != val) {
        sidebar()
        document.body.classList.add('=' + val + ':');
        readTextFile("http://games4all.vip.s3-website-us-east-1.amazonaws.com/json/" + val + ".json", function (text) {
            var data = JSON.parse(text);
            for (var i = 0; i < lang.length; i++) {
                var str = lang.item(i).className
                if (str.search("=") > 0) {
                    str = str.split('=').pop().split(':')[0]
                    str = str.toLowerCase();
                    if (data[str] != undefined) {
                        lang.item(i).innerHTML = data[str]
                    }
                }
            }
        });

        if (val == 'arabic') {
            body.classList.add("ar_layout");
        } else {
            body.classList.remove("ar_layout");
        }
    }
    document.getElementById('lang-box').classList.remove('active');
}

function load() {
    if (document.getElementById("modal-load").classList.contains('active')) {
        document.getElementById("modal-load").classList.remove('active');
    } else {
        document.getElementById("modal-load").classList.add('active');
    }
}

function errors(title, desc) {
    resetModal()
    document.getElementById('error_title').innerHTML = title ?? 'Undefined Errors'
    document.getElementById('error_msg').innerHTML = desc ?? 'Oops! Something is wrong. Please try again later.'
    if (document.getElementById("error-modal").classList.contains('active')) {
        document.getElementById('error-modal').classList.remove('active');
        document.getElementById('backdrop').classList.remove('active');
    }
    else {
        document.getElementById('error-modal').classList.add('active');
        document.getElementById('backdrop').classList.add('active');
    }
}

window.addEventListener('touchend', function (e) {

    if (newWidth <= 1200) {
        if (e.target.id != 'tri-lang' && e.target.id != 'titleLang' && e.target.id != 'lang-box' && e.target.id != 'tri-profile' && e.target.id != 'sideBar-horoscope' && e.target.id != 'sideBar-tarot' && e.target.id != 'sideBar-chinese' && e.target.id != 'leftbar' && !e.target.classList.contains('=unsubscribe:') && !e.target.classList.contains('=privacy:') && !e.target.classList.contains('sidebar-bottom')) {
            if (e.target.classList.contains('trihamburger')) {
                if (document.getElementById("wrapper").classList.contains('show-sidebar')) {
                    document.getElementById("wrapper").classList.remove('show-sidebar')
                    document.getElementById('lang-box').classList.remove('active');
                }
                else {
                    document.getElementById("wrapper").classList.add('show-sidebar')
                }
            }
            else if (document.getElementById("wrapper").classList.contains('show-sidebar')) {
                document.getElementById("wrapper").classList.remove('show-sidebar')
                document.getElementById('lang-box').classList.remove('active');
            }
        }
    }

    if (e.target.classList.contains('triLang')) {
        if (document.getElementById('lang-box').classList.contains('active')) {
            document.getElementById('lang-box').classList.remove('active');
        }
        else {
            document.getElementById('lang-box').classList.add('active');
        }
    }
    else if (document.getElementById('tri-lang').classList.contains('active') && document.getElementById('tri-lang').contains(e.target) == false) {
        document.getElementById('lang-box').classList.remove('active');
    }


    if (e.target.id == 'tri-profile' || e.target.classList.contains('triprofile')) {
        if (document.getElementById('profile-box').classList.contains('triprofile-unsub')) {
            document.getElementById('profile-box').classList.remove('triprofile-unsub');
            document.getElementById('profile-box').classList.add('triprofile-unsub_active');
        }
        else {
            document.getElementById('profile-box').classList.remove('triprofile-unsub_active');
            document.getElementById('profile-box').classList.add('triprofile-unsub');
        }
    }

});

var scrollTarot = 50
function moveLeft() {
    var element = document.getElementById('sub_tarot')
    element.scrollLeft = scrollTarot;
    if (scrollTarot >= 50) scrollTarot = scrollTarot - 120
}

function moveRight() {
    var element = document.getElementById('sub_tarot')
    element.scrollLeft = scrollTarot;
    scrollTarot = scrollTarot + 120
}

var date = new Date();
date.toISOString().split('T')[0]
date = '2022-03-22'
const formattedDate = new Date().toLocaleDateString({},
    { timeZone: "UTC", month: "long", day: "2-digit", year: "numeric" }
)

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();
if (dd < 10) dd = '0' + dd;
if (mm < 10) mm = '0' + mm;
today = yyyy + '-' + mm + '-' + dd;
var today2 = yyyy + '-05-' + dd;

function setHoroscopeBanner() {

    var currentDate = new Date();
    var month = currentDate.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var day = currentDate.getDate();
    if (day < 10) day = "0" + day;
    currentDate = month + "-" + day;

    var horo = 'Pisces';
    if (currentDate >= "03-21" && currentDate <= "04-20") {
        horo = 'Aries'
    }
    else if (currentDate >= "04-21" && currentDate <= "05-20") {
        horo = 'Taurus'
    }
    else if (currentDate >= "05-21" && currentDate <= "06-21") {
        horo = 'Gemini'
    }
    else if (currentDate >= "06-22" && currentDate <= "07-22") {
        horo = 'Cancer'
    }
    else if (currentDate >= "07-23" && currentDate <= "08-22") {
        horo = 'Leo'
    }
    else if (currentDate >= "08-23" && currentDate <= "09-22") {
        horo = 'Virgo'
    }
    else if (currentDate >= "09-23" && currentDate <= "10-22") {
        horo = 'Libra'
    }
    else if (currentDate >= "10-23" && currentDate <= "11-22") {
        horo = 'Scorpio'
    }
    else if (currentDate >= "11-23" && currentDate <= "12-21") {
        horo = 'Sagittarius'
    }
    else if (currentDate >= "12-22" && currentDate <= "01-20") {
        horo = 'Capricorn'
    }
    else if (currentDate >= "01-21" && currentDate <= "02-18") {
        horo = 'Aquarius'
    }
    else {
        horo = 'Pisces'
    }

    // Translate horo to French if pt_language is 'french'
    let horoDisplay = horo;
    if (pt_language === "french") {
        const horoTranslations = {
            Aries: "Bélier",
            Taurus: "Taureau",
            Gemini: "Gémeaux",
            Cancer: "Cancer",
            Leo: "Lion",
            Virgo: "Vierge",
            Libra: "Balance",
            Scorpio: "Scorpion",
            Sagittarius: "Sagittaire",
            Capricorn: "Capricorne",
            Aquarius: "Verseau",
            Pisces: "Poissons",
        };
        horoDisplay = horoTranslations[horo] || horo;
    }

    document.getElementById('banner-horoscope').innerHTML = ' <div class="content-banner-text">\n' +
        '                    <h2 class="">' + horoDisplay + '</h2>\n' +
        '                    <p class="content-banner-text-p lr =zodiac_of_the_month:">Zodiac of The Month</p>\n' +
        '                    <p class="content-banner-text-p2" id="home-banner-text"></p>\n' +
        '                    <button class="lr =read_more ds lr =read_more:" onclick="details(\'horoscope\',\'' + horo + '\')">Read more</button>\n' +
        '                </div>\n' +
        '                <div class="content-banner-img lazy" data-bg="' + s3 + 'zodiac_image/' + horo + '.svg"></div>\n' +
        '                <div class="content-banner-backdrop"></div>'
    lazyLoadInstance.update();

    var xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        var myStringArray = JSON.parse(this.responseText);
        // document.getElementById('home-banner-text').innerText = myStringArray['data'][0]['horoscope_description']['today'][pt_language]
    }
    xhttp.open("GET", "http://cook.grabmobi.com/api/contents/mobiscope_content?token=xB2I1pLjD39Gsa0opKnVnMxEwQyeyIoP6&horoscope=" + horo + "&date=" + today, true);
    // xhttp.open("GET", "http://cook.grabmobi.com/api/newcontents?token=xB2I1pLjD39Gsa0opKnVnMxEwQyeyIoP6&id=null&category=&subcategory=&limit=100&offset=0&domain=" + domain + "&lang=" + pt_language, true);
    xhttp.send();
}

function menu(val) {

    update_banner(val)
    document.getElementById('menu-title').innerText = document.getElementById('sideBar-' + val).innerText;
    document.getElementById('content-details').classList.add('active');
    document.getElementById('content-bottom').classList.add('active');
    document.getElementById('content-html').classList.remove('active');
    console.log(s3 + val + ".json");
    readTextFile(s3 + val + ".json", function (text) {

        document.getElementById('row1').innerHTML = ''
        document.getElementById('sub_category').innerHTML = ''

        let json = JSON.parse(text);
        let loop = json['horoscope']

        for (let i = 0; i < loop.length; i++) {
            let data = loop[i]
            if (val == 'chinese') {
                var title = data['sign_english']
                var name = data['sign_' + pt_language]
                var c_date = '';
                var icon = title
                var action = data['sign_english']

                for (let j = 0; j < data['years'].length; j++) {

                    if (data['years'][j] == new Date().getFullYear()) {
                        document.getElementById('banner-chinese').innerHTML = '<div class="content-banner-text">\n' +
                            '                    <h2 class="">' + name + '</h2>\n' +
                            '                    <p class="content-banner-text-p lr =zodiac_of_the_year:">Zodiac of The Year</p>\n' +
                            '                    <p class="content-banner-text-p2">' + loop[i]['health'][pt_language] + '</p>\n' +
                            '                    <button class="lr =read_more:" onclick="details(\'' + val + '\',\'' + title + '\')">Read more</button>\n' +
                            '                </div>\n' +
                            '                <div class="content-banner-img lazy" data-bg="' + s3 + 'zodiac_icons/' + title + '.svg"></div>\n' +
                            '                <div class="content-banner-backdrop"></div>'
                    }

                    c_date += data['years'][j] + ', '
                }
                var newStr = c_date.slice(0, -1);

            }
            else {
                var title = data['icon']
                var name = data['name_fr']
                var newStr = data['date']
                var icon = title.replace(".svg", "");
                var action = title.replace(".svg", "");
            }

            document.getElementById('sub_category').innerHTML += ' <div onclick="details(\'' + val + '\',\'' + action + '\')" class="' + val + ' item item1">\n' +
                '                            <p>' + name + '</p>\n' +
                '                            <span class="lazy" data-bg="' + s3 + 'zodiac_icons/' + icon + '.svg"></span>\n' +
                '                        </div>'

            document.getElementById('row1').innerHTML += '<div class="' + val + ' content-box-game-app" onclick="details(\'' + val + '\',\'' + action + '\')">\n' +
                '                                <div class="game-icon">\n' +
                '                                    <div class="game-icon-img lazy ' + val + '" data-bg="' + s3 + 'zodiac_icons/' + icon + '.svg"></div>\n' +
                '                                </div>\n' +
                '                                <div class="game-info">\n' +
                '                                    <h3>' + name + '</h3>\n' +
                '                                    <p id="get_date-' + title + '">' + newStr + '</p>\n' +
                '                                </div>\n' +
                '                            </div>'
        }
        sub_translate()
        lazyLoadInstance.update();
    });
}

function details(type, val) {

    let content_div = document.getElementsByClassName("content_div");
    for (let i = 0; i < content_div.length; i++) {
        content_div.item(i).classList.remove('active');
    }
    document.getElementById('content-category').classList.add('active');

    document.getElementById('content-box-cate').innerHTML = ''

    if (type == 'chinese') var ddate = document.getElementById('get_date-' + val).innerText;
    else var ddate = formattedDate

    document.getElementById('content-box-cate').innerHTML += ' <div class="' + type + ' content-box-cate-banner" id="content-box-cate-banner">\n' +
        '                        <div class="content-box-cate-banner-img lazy" data-bg="' + s3 + 'banners/' + type + '.jpg"></div>\n' +
        '                        <div class="content-box-cate-banner-desc">\n' +
        '                            <h3>' + val + ' <span class="lr =daily_horo:">Daily Horoscope</span></h3>\n' +
        '                            <p>' + ddate + '</p>\n' +
        '                        </div>\n' +
        '                      <div class="content-box-cate-banner-icon lazy" data-bg="' + s3 + 'zodiac_image/' + val + '.svg"></div>\n' +
        '                    </div>'
    lazyLoadInstance.update();
    sub_translate()

    var element = document.getElementById("content-box-cate-banner");
    element.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

    if (type == 'horoscope') {
        var arr = ['yesterday', 'today', 'tomorrow', 'week', 'month', 'year']
        var xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
            var myStringArray = JSON.parse(this.responseText);
            for (let i = 0; i < arr.length; i++) {
                let desc = myStringArray['data'][0]['horoscope_description'][arr[i]][pt_language];
                document.getElementById('content-box-cate').innerHTML += '  <div class="content-box-cate-in" id="cate-' + arr[i] + '">\n' +
                    '                        <h3><span class="lr =' + arr[i] + ':">' + arr[i] + '</span></h3>\n' +
                    '                        <p>' + desc + '</p>\n' +
                    '                        <button onclick="showMore(\'' + arr[i] + '\')" class="lr =read_more:">Read more</button>\n' +
                    '                    </div>'
            }
            sub_translate()
        }
        // xhttp.open("GET", "http://cook.grabmobi.com/api/contents/mobiscope_content?token=xB2I1pLjD39Gsa0opKnVnMxEwQyeyIoP6&horoscope=" + val + "&date=" + date, true);
        xhttp.open("GET", "http://cook.grabmobi.com/api/contents/mobiscope_content?token=xB2I1pLjD39Gsa0opKnVnMxEwQyeyIoP6&horoscope=" + val + "&date=" + today2, true);
        xhttp.send();
    }
    else {
        console.log(s3 + type + ".json");
        readTextFile(s3 + type + ".json", function (text) {
            let json_chinese = JSON.parse(text);
            var loop = json_chinese['horoscope']

            for (let z = 0; z < loop.length; z++) {

                var data = loop[z]

                let title = data['sign_english']
                var c_date = ''

                if (data['sign_english'] == val) {

                    for (let j = 0; j < data['years'].length; j++) {
                        c_date += data['years'][j] + ', '
                    }

                    let name = data['sign_' + pt_language]
                    document.getElementById('content-box-cate').innerHTML = ''
                    document.getElementById('content-box-cate').innerHTML += ' <div class="' + type + ' content-box-cate-banner">\n' +
                        '                        <div class="content-box-cate-banner-img lazy" data-bg="' + s3 + 'banners/' + type + '.jpg"></div>\n' +
                        '                        <div class="content-box-cate-banner-desc ' + type + '">\n' +
                        '                            <h3>' + name + '</h3>\n' +
                        '                            <p>' + c_date + '</p>\n' +
                        '                        </div>\n' +
                        '                      <div class="content-box-cate-banner-icon lazy" data-bg="' + s3 + 'zodiac_image/' + val + '.svg"></div>\n' +
                        '                    </div>'
                    lazyLoadInstance.update();

                    var arr2 = ['personality', 'health', 'carrers']
                    for (let k = 0; k < arr2.length; k++) {
                        var desc = ''
                        if (arr2[k] == 'health') {
                            desc = data[arr2[k]][pt_language]
                        }
                        else {
                            desc = data[arr2[k]]['first_' + pt_language] + '<br><br>' + data[arr2[k]]['second_' + pt_language]
                        }
                        let g = k + 10

                        var t_lang = arr2[k]
                        if (arr2[k] == 'carrers') t_lang = 'careers';

                        document.getElementById('content-box-cate').innerHTML += '  <div class="' + type + ' content-box-cate-in" id="cate-' + g + '">\n' +
                            '                        <h3 class="lr =' + t_lang + ':">' + t_lang + '</h3>\n' +
                            '                        <p>' + desc + '</p>\n' +
                            '                        <button onclick="showMore(\'' + g + '\')" class="lr =read_more:">Read more</button>\n' +
                            '                    </div>'
                    }

                    arr2 = ['lucky', 'unlucky']
                    for (let k = 0; k < arr2.length; k++) {
                        let dd = data[arr2[k]];
                        let q = k + 20
                        document.getElementById('content-box-cate').innerHTML += '  <div class="chinese content-box-cate-in" id="cate-' + q + '">\n' +
                            '                        <h3><span class="lr =' + arr2[k] + ':">' + arr2[k] + '</span> </h3>\n' +
                            '                        <div class="lucky-box active">\n' +
                            '                            <h3 class="lr =numbers:">Numbers</h3>\n' +
                            '                            <div class="lucky-box-span" id="' + arr2[k] + '-numbers-box-span">\n' +
                            '                            </div>\n' +
                            '                        </div>\n' +
                            '\n' +
                            '                        <div class="lucky-box">\n' +
                            '                            <h3 class="lr =colors:">Colors</h3>\n' +
                            '                            <div class="lucky-box-span colour" id="' + arr2[k] + '-colors-box-span">\n' +
                            '                            </div>\n' +
                            '                        </div>\n' +
                            '\n' +
                            '                        <div class="lucky-box">\n' +
                            '                            <h3 class="lr =directions:">Directions</h3>\n' +
                            '                            <div class="lucky-box-span direction" id="' + arr2[k] + '-directions-box-span">\n' +
                            '                            </div>\n' +
                            '                        </div>\n' +
                            '                        <button onclick="showMore(\'' + q + '\')" class="lr =read_more:">Read more</button>\n' +
                            '                    </div>'
                        for (let z = 0; z < dd['numbers'].length; z++) {
                            document.getElementById(arr2[k] + '-numbers-box-span').innerHTML += '<span>' + dd['numbers'][z] + '</span>'
                        }

                        for (let z = 0; z < dd['colors_english'].length; z++) {
                            document.getElementById(arr2[k] + '-colors-box-span').innerHTML += '<span style="background: ' + dd['colors_english'][z] + '">' + dd['colors_' + pt_language][z] + '</span>'
                        }

                        for (let z = 0; z < dd['directions_english'].length; z++) {
                            document.getElementById(arr2[k] + '-directions-box-span').innerHTML += '<span>' + dd['directions_' + pt_language][z] + '</span>'
                        }
                    }

                    arr2 = ['best', 'worst']
                    for (let k = 0; k < arr2.length; k++) {
                        document.getElementById('content-box-cate').innerHTML += '<div class="chinese content-box-cate-in">\n' +
                            '                        <h3><span class="lr =' + arr2[k] + '_match:">' + arr2[k] + '</span> </h3>\n' +
                            '                        <div class="love" id="' + arr2[k] + '-icon">\n' +
                            '                        </div>\n' +
                            '                    </div>'


                        let dd = data['love'][arr2[k] + '_english'];
                        for (let w = 0; w < dd.length; w++) {
                            var nname = dd[w];
                            if (nname == 'Ox') nname = 'Cow'
                            document.getElementById(arr2[k] + '-icon').innerHTML += '<div onclick="details(\'chinese\',\'' + nname + '\')" class="love-icon">\n' +
                                '                                <span class="lazy"  data-bg="' + s3 + 'zodiac_icons/' + dd[w] + '.svg"></span>\n' +
                                '                            </div>'
                        }
                    }
                    lazyLoadInstance.update();
                    sub_translate()

                    return true
                }
            }

        });
    }
}

function update_banner(val) {

    let content_div = document.getElementsByClassName("content_div");
    for (let i = 0; i < content_div.length; i++) {
        content_div.item(i).classList.remove('active');
    }

    document.getElementById('leftbar').classList.remove('tarot');
    document.getElementById('leftbar').classList.remove('chinese');

    let content_div_c = document.getElementsByClassName("game-icon-img");
    for (let i = 0; i < content_div_c.length; i++) {
        content_div_c.item(i).classList.remove('chinese');
    }

    if (val == 'tarot') {
        document.getElementById('leftbar').classList.add('tarot');
    }
    else if (val == 'chinese') {
        document.getElementById('leftbar').classList.add('chinese');
    }

    var con_banner = document.getElementsByClassName("content-banner");
    for (let i = 0; i < con_banner.length; i++) {
        con_banner.item(i).classList.remove('active');
    }
    document.getElementById('banner-' + val).classList.add('active');
}

function openModal(id) {

    downloadLink = ''
    var cls = document.getElementsByClassName("m-action");
    for (var i = 0; i < cls.length; i++) {
        cls.item(i).classList.remove('active');
    }
    document.getElementById('modal-app').style.display = 'block';
    document.getElementById('m-title').innerText = 'Loading...'
    document.getElementById('m-desc').innerText = 'Loading...'
    // document.getElementById('m-icon').style.backgroundImage = "url('"+myStringArray['thumbnail_url']+"')"

    var xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        var myStringArray = JSON.parse(this.responseText);
        myStringArray = myStringArray['data'][0]
        try {
            downloadName = myStringArray['content_detail'];
            downloadType = myStringArray['content_type']
            subCate = myStringArray['subcategory']
        }
        catch (error) { downloadName = '' }

        var eTag = document.getElementsByClassName("e-tag");
        for (var i = 0; i < eTag.length; i++) {
            eTag.item(i).classList.add('ds')
        }

        modal = true;
        if (downloadType == "video/mp4") {
            video.pause()
            source.setAttribute('src', myStringArray['file_url']);
            video.load();
            video.play();
            document.getElementById('modal-apk').classList.add('video');
            var videoTag = document.getElementsByClassName("v-tag");
            for (let i = 0; i < videoTag.length; i++) {
                videoTag.item(i).classList.remove('ds')
            }
        }
        else {
            document.getElementById('modal-apk').classList.remove('video');
            var apkTag = document.getElementsByClassName("a-tag");
            for (let i = 0; i < apkTag.length; i++) {
                apkTag.item(i).classList.remove('ds')
            }
        }

        if (subCate == 'HTML5 Game') {
            cls = document.getElementsByClassName("m-action-play");
            for (let i = 0; i < cls.length; i++) {
                cls.item(i).classList.add('active');
            }
        }
        else {
            cls = document.getElementsByClassName("m-action-down");
            for (let i = 0; i < cls.length; i++) {
                cls.item(i).classList.add('active');
            }
        }

        downloadLink = myStringArray['raw_file_url']
        if (myStringArray['category'] == 'Wallpaper') {
            downloadLink = myStringArray['file_url']
        }


        // downloadLink = myStringArray['file_url']
        var all_lang = JSON.parse(myStringArray['category_translate'])
        document.getElementById('m-cate').innerText = all_lang[localStorage.getItem("pt_language")]['title']
        document.getElementById('m-rate').innerText = myStringArray['rating']
        document.getElementById('m-title').innerText = myStringArray['cont_name_english']
        document.getElementById('m-desc').innerText = myStringArray['desc_english']
        // document.getElementById('modal-app').style.backgroundImage = "url('"+myStringArray['cover_img']+"')"
        document.getElementById('m-icon').style.backgroundImage = "url('" + myStringArray['thumbnail_url'] + "')"
        lazyLoadInstance.update();
        queryString = '/detail/' + id
        window.history.pushState({}, "", queryString);
    }
    xhttp.open("GET", "http://cook.grabmobi.com/api/newcontents?token=xB2I1pLjD39Gsa0opKnVnMxEwQyeyIoP6&id=" + id + "&category=&subcategory=&limit=100&offset=0&domain=" + domain + "&lang=" + pt_language, true);
    xhttp.send();
}

function closeModal() {
    document.getElementById('modal-app').style.display = 'none';
    queryString = '/';
    localStorage.removeItem("open_modal");
    window.history.pushState({}, "", queryString);
    video.pause()
}

function showMore(val) {
    var cls = document.getElementsByClassName("content-box-cate-in");
    for (let i = 0; i < cls.length; i++) {
        cls.item(i).classList.remove('active')
    }
    document.getElementById('cate-' + val).classList.add('active');
    document.getElementById('cate-' + val).focus();
}

var tarotData, tarotArr = [];
function tarot() {

    console.log('TAROTTTT');

    update_banner('tarot')

    if (modal) closeModal()
    document.getElementById('content-details').classList.remove('active');
    document.getElementById('content-bottom').classList.remove('active');
    document.getElementById('content-category').classList.remove('active');
    document.getElementById('content-tarot').classList.add('active');
    document.getElementById('content-chinese').classList.remove('active');
    document.getElementById('content-html').classList.remove('active');
    if (document.getElementById("sub_tarot").classList.contains('completed')) {

    }
    else {
        var xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
            var myStringArray = JSON.parse(this.responseText);
            tarotData = myStringArray;
            document.getElementById('sub_tarot').innerHTML = ''
            document.getElementById('wands-tarot').innerHTML = ''
            for (let i = 0; i < myStringArray['cards'].length; i++) {
                let name = myStringArray['cards'][i]['name'];
                let type = myStringArray['cards'][i]['type'];

                if (type == 'major') {
                    document.getElementById('sub_tarot').innerHTML += ' <div onclick="viewTarot(\'' + name + '\')" class="item_t item1" id="sub_tarot_' + name + '">\n' +
                        '                            <span class="lazy side-a" data-bg="' + s3 + 'tarot_image/back-card.png"></span>\n' +
                        '                            <span class="lazy side-b" data-bg="' + s3 + 'tarot_image/' + name + '.jpg"></span>\n' +
                        '                        </div>'
                    tarotArr.push(name);
                }
                else {
                    let sub_type = myStringArray['cards'][i]['suit'];
                    document.getElementById(sub_type + '-tarot').innerHTML += '<div onclick="viewTarot(\'' + name + '\')" class="minor_tarot_box">\n' +
                        '                                <p>' + name + '</p>\n' +
                        '                            </div>'
                }
            }
            document.getElementById('sub_tarot').classList.add('completed');
            lazyLoadInstance.update();
        }
        xhttp.open("GET", "http://rws-cards-api.herokuapp.com/api/v1/cards", true);
        xhttp.send();

    }
}

var moving = 0;
function moveNext() {
    console.log(tarotArr.length);

    if (moving >= tarotArr.length) {
        var element = document.getElementById("sub_tarot_The Lovers");
        element.scrollIntoView();
    }
}


function translate(type, val) {
    var apiKey = 'AIzaSyCq1acQaQt46Yx2VK1BrlYm19SN7hqbf04';

    var target = 'fr'
    if (pt_language == 'bulgarian') target = 'bg'
    if (pt_language == 'finnish') target = 'fi'
    if (pt_language == 'greek') target = 'el'
    if (pt_language == 'arabic') target = 'ar'
    if (pt_language == 'indonesian') target = 'id' // in
    if (pt_language == 'norwegian') target = 'no'
    if (pt_language == 'romanian') target = 'ro'
    if (pt_language == 'czech') target = 'cs'
    if (pt_language == 'malay') target = 'ms'
    if (pt_language == 'swedish') target = 'sv'

    let link = 'https://www.googleapis.com/language/translate/v2?key=' + apiKey + '&q=' + encodeURI(val) + '&source=en&target=' + target;
    var xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        var myStringArray = JSON.parse(this.responseText);
        myStringArray = myStringArray['data']['translations'][0]['translatedText']
        document.getElementById('modal-' + type).innerText = myStringArray
        return myStringArray;
    }
    xhttp.open("GET", link, true);
    xhttp.send();
}

function viewTarot(val) {

    var tarot_card = document.getElementsByClassName("item_t");
    for (let i = 0; i < tarot_card.length; i++) {
        tarot_card.item(i).classList.remove('active');
    }

    var subTarID = !!document.getElementById('sub_tarot_' + val)
    if (subTarID) document.getElementById('sub_tarot_' + val).classList.add('active');

    document.getElementById('modal-tarotTitle').innerText = val
    document.getElementById('tarot-content-left').innerHTML = '<div class="lazy" data-bg="' + s3 + 'tarot_image/' + val + '.jpg"></div>'
    lazyLoadInstance.update();
    for (let i = 0; i < tarotData['cards'].length; i++) {
        let name = tarotData['cards'][i]['name'];
        let type = tarotData['cards'][i]['type'];

        if (name == val) {
            let desc = tarotData['cards'][i]['desc'];
            let mean = tarotData['cards'][i]['meaning_up'] + '' + tarotData['cards'][i]['meaning_rev'];
            if (pt_language != 'english') {
                translate('tarotDesc', desc)
                translate('tarotMean', mean)
            }
            else {
                document.getElementById('modal-tarotDesc').innerText = desc
                document.getElementById('modal-tarotMean').innerText = mean
            }

        }
    }
    document.getElementById('backdrop').classList.add('active');
    document.getElementById('tarot-modal').classList.add('active');
}

function closeTarotModal() {
    document.getElementById('backdrop').classList.remove('active');
    document.getElementById('tarot-modal').classList.remove('active');
}

const slider_t = document.querySelector('#sub_tarot');
let isDown = false;
let startX;
let scrollLeft;

if (!!slider_t) {

    slider_t.addEventListener('mousedown', (e) => {
        isDown = true;
        slider_t.classList.add('active');
        startX = e.pageX - slider_t.offsetLeft;
        scrollLeft = slider_t.scrollLeft;
    });
    slider_t.addEventListener('mouseleave', () => {
        isDown = false;
        slider_t.classList.remove('active');
    });
    slider_t.addEventListener('mouseup', () => {
        isDown = false;
        slider_t.classList.remove('active');
    });
    slider_t.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider_t.offsetLeft;
        const walk = (x - startX) * 3; //scroll-fast
        slider_t.scrollLeft = scrollLeft - walk;
    });
}

function html(file, id) {
    if (modal) closeModal()
    var rawH5 = new XMLHttpRequest();
    var ffile = file + '/' + pt_language + '.html';
    rawH5.open("GET", ffile, true);
    rawH5.onreadystatechange = function () {
        if (rawH5.readyState === 4 && rawH5.status == "200") {
            // get back the title
            document.getElementById('content-details').classList.remove('active');
            document.getElementById('content-category').classList.remove('active');
            document.getElementById('content-bottom').classList.remove('active');
            document.getElementById('content-tarot').classList.remove('active');

            document.getElementById('content-html').classList.add('active');

            document.getElementById('content-html-title').innerHTML = document.getElementById(id).innerHTML;
            document.getElementById('content-html-box').innerHTML = rawH5.responseText;
        }
    }
    rawH5.send(null);
}

const slider = document.querySelector('#sub_category');
if (!!slider) {
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active');
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active');
    });
    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active');
    });
    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 3; //scroll-fast
        slider.scrollLeft = scrollLeft - walk;

    });
}

const sliderChinese = document.querySelector('#sub_chinese');
if (!!sliderChinese) {
    sliderChinese.addEventListener('mousedown', (e) => {
        isDown = true;
        sliderChinese.classList.add('active');
        startX = e.pageX - sliderChinese.offsetLeft;
        scrollLeft = sliderChinese.scrollLeft;
    });
    sliderChinese.addEventListener('mouseleave', () => {
        isDown = false;
        sliderChinese.classList.remove('active');
    });
    sliderChinese.addEventListener('mouseup', () => {
        isDown = false;
        sliderChinese.classList.remove('active');
    });
    sliderChinese.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - sliderChinese.offsetLeft;
        const walk = (x - startX) * 3; //scroll-fast
        sliderChinese.scrollLeft = scrollLeft - walk;
    });
}

//added
document.addEventListener('DOMContentLoaded', function () {
    const contentCategory = document.getElementById("content-category");
    const footerLink = document.getElementById("footer-links");
    const wrapper = document.getElementById("wrapper");
    const footerLink2 = document.getElementById("footer-links-2");
    const contentLogin = document.getElementById("content-login");

    // Hide footer-links if content-category is active

    if (contentCategory && footerLink) {
        const observer = new MutationObserver(function (mutationsList) {
            for (let mutation of mutationsList) {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    if (contentCategory.classList.contains("active")) {
                        footerLink.style.display = "none";
                        console.log("has class");
                    } else {
                        footerLink.style.display = "none";
                        console.log("no class");
                        footerLink2.style.display = "flex";
                    }
                }
            }
        });
        observer.observe(contentCategory, { attributes: true });
    }

    // if (wrapper && footerLink2) {
    //     const observer2 = new MutationObserver(function (mutationsList) {
    //         for (let mutation of mutationsList) {
    //             if (mutation.type === "attributes" && mutation.attributeName === "class") {
    //                 // Hide footerLink2 if footerLink is flex
    //                 if (footerLink && window.getComputedStyle(footerLink).display === "flex") {
    //                     console.log("footerLink is flex");
    //                     footerLink2.style.display = "none";
    //                 } else if (!wrapper.classList.contains("show-sidebar")) {
    //                     // Mobile view: show footer-links-2
    //                     footerLink2.style.display = "block";
    //                 } else {
    //                     // Desktop view: hide footer-links-2
    //                     footerLink2.style.display = "none";
    //                 }
    //             }
    //         }
    //     });
    //     observer2.observe(wrapper, { attributes: true });
    // }
    if (wrapper && footerLink2) {
        const updateFooterLinks2 = () => {
            if (footerLink && window.getComputedStyle(footerLink).display === "flex") {
                footerLink2.style.display = "none";
                console.log("footerLink is flex");
            } else if (window.getComputedStyle(footerLink).display === "none" || !wrapper.classList.contains("show-sidebar")) {
                footerLink2.style.display = "flex";
            } else {
                console.log("footerLink is not flex");
            }
        };

        const observer2 = new MutationObserver(function (mutationsList) {
            for (let mutation of mutationsList) {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    updateFooterLinks2();
                }
            }
        });
        observer2.observe(wrapper, { attributes: true });

        // Set initial state on page load
        updateFooterLinks2();
    }
});
//added