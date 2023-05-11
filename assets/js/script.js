$(document).on('keyup', '#in', function(e) {
    exec();
});

$(document).on('keyup', '#provider', function(e) {
    exec();
});

$(document).on('keyup', '#cleanIp', function(e) {
    exec();
});

function exec() {
    let cdnip;
    let provider = getCleanIp();
    if ( provider === "" ) {
        cdnip = JSON.parse($("#cdnip").val());
    }
    else {
        cdnip = JSON.parse('["'+provider+'"]');
    }
    let sample_node = ($("#in").val()).replace(/[\r\n]/g, "").replace(/\ +/g, "");
    if ( sample_node === '' ) {
        return false;
    }
    let out = $("#out");
    let vmess_pre = "vmess://"
    let vless_pre = "vless://"
    let nodes =new Array();
    $("#result").addClass('hidden');
    $("#errorMsg").addClass('hidden');
    if (sample_node.indexOf(vmess_pre) === 0) {
        let node_data = atob(sample_node.slice(vmess_pre.length,sample_node.length))
        let re = /\"add\": ?\"(.*?)\"/;
        let node_host=node_data.match(re)[1];
        if ( ! ['443', '80'].includes( JSON.parse(node_data).port ) ) {
            $("#errorMsg").removeClass('hidden');
            return false;
        }
        node_data = node_data.replace(/(\"host\": ?\")(.*?)(\"\,)/,"$1"+node_host+"$3");
        for(var i = 0; i < (cdnip.length >= 30 ? 30 : cdnip.length); i++){
            node_data = node_data.replace(/(\"add\": ?\")(.*?)(\"\,)/,"$1"+cdnip[i]+"$3");
            nodes.push(vmess_pre+btoa(node_data)+"\n")
        }
        out.html(nodes);
        $("#result").removeClass('hidden');
    }
    else if ( sample_node.indexOf(vless_pre) === 0 ){
        let re=/@(.*?):/;
        if ( ! ['443', '80'].includes( getAddress(sample_node)[1] ) ) {
            $("#errorMsg").removeClass('hidden');
            return false;
        }
        let node_host=sample_node.match(re)[1];
        if (sample_node.indexOf("host=") !== -1) {
            sample_node = sample_node.replace(/(host=)(.*?)(&)/,"$1"+node_host+"$3");
        }
        else {
            sample_node = sample_node.replace(/(@)(.*?)(:)(.*?)(\?)/,"$1$2$3$4$5host="+node_host+"&");
        }
        for (let i = 0; i < (cdnip.length >= 30 ? 30 : cdnip.length); i++) {
            nodes.push(sample_node.replace(/(@)(.*?)(:)/,"$1"+cdnip[i]+"$3")+"\n");
        }
        out.html(nodes);
        $("#result").removeClass('hidden');
    }
    else {
        $("#errorMsg").removeClass('hidden');
    }
}

$(document).on('change', '#provider', function(e) {
    e.preventDefault();
    let option = $(this).val();
    if ( option === 'normal' ) {
        $('#cleanIp').removeClass('none');
    }
    else {
        $('#cleanIp').addClass('none');
    }
    $('#in').trigger('keyup');
});

function getCleanIp() {
    let value = $('#provider').val();
    if ( value === 'normal' ) {
        value = $('#cleanIp').val();
        if ( ! isValidIp(value) ) {
            value = "";
        }
    }
    if ( value === null ) {
        return "";
    }
    if ( value === "rand" ) {
        return "";
    }
    return value;
}

function isValidIp(string) {
    try {
        if (string === "" || string === undefined) {
            return false;
        }
        if (!/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){2}\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-4])$/.test(string)) {
            return false;
        }
        let ls = string.split('.')
        if (ls === null || ls.length !== 4 || ls[3] === "0" || parseInt(ls[3]) === 0) {
            return false
        }
        return true;
    }
    catch (e) { }
    return false;
}

function getProtocol(config) {
    let string = config.split("://");
    if ( typeof string[0] !== 'undefined' ) {
        return string[0];
    }
    return '';
}

function base64Decode(config) {
    try {
        config = config.replace("vmess://", "");
        return JSON.parse(atob(config));
    }
    catch {
        return {};
    }
}

function getAddress(config) {
    let protocol = getProtocol(config);
    if ( protocol === 'vmess' ) {
        config = base64Decode(config);
        return [
            config.add,
            String(config.port),
        ]
    }
    else {
        let string = config.split("@");
        if ( typeof string[1] !== 'undefined' ) {
            string = string[1].split("?");
            if ( typeof string[0] !== 'undefined' ) {
                string = string[0].split(":");
                if ( typeof string[0] !== 'undefined' && typeof string[1] !== 'undefined' ) {
                    return [
                        string[0],
                        string[1].split("#")[0],
                    ]
                }
            }
        }
    }
    return ['', ''];
}
