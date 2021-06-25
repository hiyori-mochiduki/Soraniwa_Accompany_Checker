// ==UserScript==
// @name         Soraniwa_Accompany_Checker
// @namespace    https://twitter.com/mochihiyo_fox
// @version      1.0.1
// @updateURL    https://hiyori-mochiduki.github.io/Soraniwa_Accompany_Checker/Soraniwa_Accompany_Checker.user.js
// @downloadURL  https://hiyori-mochiduki.github.io/Soraniwa_Accompany_Checker/Soraniwa_Accompany_Checker.user.js
// @description  ソラニワ(リストロ)で同行者のステータス情報を上の方にまとめて表示するツール
// @author       望月ひより
// @match        *st.x0.to/?mode=keizoku4
// @grant        none
// ==/UserScript==

(function() {

    const accompany_CharaId = ["d1","d2","d3"];

    'use strict';
    addButton();


    function addButton() {
        var target = $("input[value='行動する']").parent();
        target.append('<input type="button" class="displaySts" value="花壇ステータス表示";"/><br />');
        target.append('<input type="button" <a class="buttleSts" value="連れ出しメンバー表示";"/><br />');

        $('.displaySts').click(function() {
            delMember();
            addGardeningStatus(target);
        });

        $('.buttleSts').click(function() {
            delMember();
            addBattleDetails(target);
        });

        function delMember() {
            //追加したコードをいちいち削除していく（もっといい方法はないものか。）
            accompany_CharaId.forEach(function(id) {
                let element = document.getElementById("accompany_" + id);
                element && element.remove();
            });
            document.getElementById("clonePc") && document.getElementById("clonePc").remove();
            document.getElementById("gardeningStsTbl") && document.getElementById("gardeningStsTbl").remove();
            document.getElementById("gardeningStsTblBody") && document.getElementById("gardeningStsTblBody").remove();
            document.getElementById("gardeningStsTblWat") && document.getElementById("gardeningStsTblWat").remove();
            document.getElementById("gardeningStsTblComp") && document.getElementById("gardeningStsTblComp").remove();
            document.getElementById("gardeningStsTblCare") && document.getElementById("gardeningStsTblCare").remove();
            //区切り線も削除
            document.getElementById("accompany_br") && document.getElementById("accompany_br").remove();
            document.getElementById("accompany_line") && document.getElementById("accompany_line").remove();
        };

        function addGardeningStatus(target) {
            //自キャラのデータ取得
            var elements = document.getElementsByClassName("charaframeself");
            var pcENo = elements[0].id;
            var pc = document.getElementById(pcENo);
            var watering_sts = parseInt(pc.getAttribute("data-str")) + parseInt(pc.getAttribute("data-mag"));
            var compost_sts = parseInt(pc.getAttribute("data-vit")) + parseInt(pc.getAttribute("data-agi"));
            var care_sts = parseInt(pc.getAttribute("data-dex")) + parseInt(pc.getAttribute("data-mnt"));

            //同行キャラデータの取得
            accompany_CharaId.forEach(function(id) {
                let eno = document.getElementById(id).value;
                //ENo.0はいない
                if(eno) {
                    let ac = document.getElementById("eno" + eno);
                    watering_sts += parseInt(ac.getAttribute("data-str")) + parseInt(ac.getAttribute("data-mag"))
                    compost_sts += parseInt(ac.getAttribute("data-vit")) + parseInt(ac.getAttribute("data-agi"))
                    care_sts += parseInt(ac.getAttribute("data-dex")) + parseInt(ac.getAttribute("data-mnt"))
                }
            });
            //花壇ステータスデータテーブルを生成
            target.append('<table class="kadanlist" id="gardeningStsTbl" width="160">');
            target.append('<tbody id="gardeningStsTblBody"><tr><th width="80"><span class="markp marki1">作業内容</span></th><th width="80"><span class="markp marki1">合計作業能力値</span></th></tr>');
            target.append('<tr class="odd" id="gardeningStsTblWat"><td align="center"><span class="markp marki0">水やり</span></td><td align="center">' + watering_sts + '</td>');
            target.append('<tr class="even" id="gardeningStsTblComp"><td align="center"><span class="markp marki0">施肥</span></td><td align="center">' + compost_sts + '</td>');
            target.append('<tr class="odd" id="gardeningStsTblCare"><td align="center"><span class="markp marki0">手入れ</span></td><td align="center">' + care_sts + '</td></tbody></table>');

            //区切り線の表示、後で消すためにユニークなIDをつけておく。
            target.append('<br clear="all" id="accompany_br">');
            target.append('<h2 class="subtitle" id="accompany_line"> </h2>');
        }

        function addBattleDetails(target) {
            addPlayerCharactorDetail(target);
            addMemberDetails(target);

            //区切り線の表示、後で消すためにユニークなIDをつけておく。
            target.append('<br clear="all" id="accompany_br">');
            target.append('<h2 class="subtitle" id="accompany_line"> </h2>');
        }

        function addPlayerCharactorDetail(target) {
            //自キャラのステータスを取得して上部に表示
            var elements = document.getElementsByClassName("charaframeself");
            console.log(elements)
            var pcENo = elements[0].id;
            var pc = document.getElementById(pcENo);
            var clone_pc = pc.cloneNode(true);
            clone_pc.id = "clonePc";
            clone_pc.style = "width: 720px"
            target.append(clone_pc);
        }

        function addMemberDetails() {
            //同行キャラのステータスを取得して上部に表示
            var accompany_CharaENo = [];

            accompany_CharaId.forEach(function(id) {
                document.getElementById(id).value && accompany_CharaENo.push(document.getElementById(id).value);
            });

            accompany_CharaENo.forEach(function(eno, index) {
                var ac_content = document.getElementById("eno" + eno);
                var clone_ac = ac_content.cloneNode(true);
                clone_ac.id = "accompany_" + accompany_CharaId[index];
                clone_ac.style = "width: 720px";

                target.append(clone_ac);
            });
        }
    }
})();