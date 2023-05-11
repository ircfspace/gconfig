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
        node_data = node_data.replace(/(\"host\": ?\")(.*?)(\"\,)/,"$1"+node_host+"$3");
        for(var i = 0; i < cdnip.length; i++){
            node_data = node_data.replace(/(\"add\": ?\")(.*?)(\"\,)/,"$1"+cdnip[i]+"$3");
            nodes.push(vmess_pre+btoa(node_data)+"\n")
        }
        out.html(nodes);
        $("#result").removeClass('hidden');
    }
    else if ( sample_node.indexOf(vless_pre) === 0 ){
        let re=/@(.*?):/;
        let node_host=sample_node.match(re)[1];
        if (sample_node.indexOf("host=") !== -1) {
            sample_node = sample_node.replace(/(host=)(.*?)(&)/,"$1"+node_host+"$3");
        }
        else {
            sample_node = sample_node.replace(/(@)(.*?)(:)(.*?)(\?)/,"$1$2$3$4$5host="+node_host+"&");
        }
        for (let i = 0; i < cdnip.length; i++) {
            nodes.push(sample_node.replace(/(@)(.*?)(:)/,"$1"+cdnip[i]+"$3")+"\n");
        }
        out.html(nodes);
        $("#result").removeClass('hidden');
    }
    else {
        $("#errorMsg p").html("کانفیگ شما باید از نوع VMESS یا VLESS با پورت ۴۴۳ یا ۸۰ باشد.");
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
