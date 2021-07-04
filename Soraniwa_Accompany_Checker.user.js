// ==UserScript==
// @name         Soraniwa_Accompany_Checker
// @namespace    https://twitter.com/mochihiyo_fox
// @version      1.2.0
// @updateURL    https://hiyori-mochiduki.github.io/Soraniwa_Accompany_Checker/Soraniwa_Accompany_Checker.user.js
// @downloadURL  https://hiyori-mochiduki.github.io/Soraniwa_Accompany_Checker/Soraniwa_Accompany_Checker.user.js
// @description  ソラニワ(リストロ)で同行者のステータス情報を上の方にまとめて表示するツール
// @author       望月ひより
// @include      http://st.x0.to/?mode=keizoku4*
// @include      https://st.x0.to/?mode=keizoku4*
// @include      http://st.x0.to/
// @include      https://st.x0.to/
// @grant        none
// ==/UserScript==

(function() {
    const accompany_CharaId = ["d1","d2","d3"];
    'use strict';

    //各種行動画面かどうか判定
    if(document.title == "各種行動 -Stroll Green-"){
        addButton();
    }

    function addButton() {
        var target = $("input[value='行動する']").parent();
        target.append('<input type="button" class="displaySts" value="花壇ステータス表示";"/><br />');
        target.append('<input type="button" class="buttleSts" value="連れ出しメンバー表示";"/><br />');
        target.append('<input type="button" class="stsAllDelete" value="表示消去";"/><br />');
        target.append('<br clear="all" id="checker_br">');

        $('.displaySts').click(function() {
            delGardeningStatus();
            addGardeningStatus(target);
        });

        $('.buttleSts').click(function() {
            delBattleDetails();
            addBattleDetails(target);
        });

        $('.stsAllDelete').click(function() {
            stsAllDelete();
        });

        function stsAllDelete() {
            delGardeningStatus();
            delBattleDetails();
        };
        function delGardeningStatus() {
            document.getElementById("gardeningStsTbl") && document.getElementById("gardeningStsTbl").remove();
            document.getElementById("gardeningStsTblBody") && document.getElementById("gardeningStsTblBody").remove();
            document.getElementById("gardeningStsTblWat") && document.getElementById("gardeningStsTblWat").remove();
            document.getElementById("gardeningStsTblComp") && document.getElementById("gardeningStsTblComp").remove();
            document.getElementById("gardeningStsTblCare") && document.getElementById("gardeningStsTblCare").remove();
            document.getElementById("gardeningSts_br") && document.getElementById("gardeningSts_br").remove();
            document.getElementById("gardeningSts_title") && document.getElementById("gardeningSts_title").remove();
            document.getElementById("gardeningSts_line") && document.getElementById("gardeningSts_line").remove();
            document.getElementById("accompany_line") && document.getElementById("accompany_line").remove();
        };
        function delBattleDetails() {
            //追加したコードをいちいち削除していく（もっといい方法はないものか。）
            accompany_CharaId.forEach(function(id) {
                let element = document.getElementById("accompany_" + id);
                element && element.remove();
            });
            document.getElementById("accompany_title") && document.getElementById("accompany_title").remove();
            document.getElementById("clonePc") && document.getElementById("clonePc").remove();
            document.getElementById("accompany_br") && document.getElementById("accompany_br").remove();
            document.getElementById("accompany_line") && document.getElementById("accompany_line").remove();
            document.getElementById("gardeningSts_line") && document.getElementById("gardeningSts_line").remove();
        };

        //この関数長すぎるから機能分けを上手くする。今後。
        function addGardeningStatus(target) {
            //対応するページにのみ表示させる
            target.append('<h2 class="subtitle" id="gardeningSts_title">花壇ステータス表示</h2>');

            var watering_sts_array = [];
            var compost_sts_array = [];
            var care_sts_array = [];

            //花壇ステータスをキャラから取得
            var elements = document.getElementsByClassName("charaframeself");
            var pcENo = elements[0].id;
            var pc = document.getElementById(pcENo);

            getStatus(watering_sts_array, pc, "data-str", "data-mag")
            getStatus(compost_sts_array, pc, "data-vit", "data-agi")
            getStatus(care_sts_array, pc, "data-dex", "data-mnt")

            //花壇ステータスを抽出
            var watering_sts_total = watering_sts_array.reduce((sum, element) => sum + element, 0);
            var watering_sts_min = watering_sts_array.slice(-2).reduce((sum, element) => sum + element, 0);
            var watering_sts_max = watering_sts_array.slice(0,2).reduce((sum, element) => sum + element, 0);
            var compost_sts_total = compost_sts_array.reduce((sum, element) => sum + element, 0);
            var compost_sts_min = compost_sts_array.slice(-2).reduce((sum, element) => sum + element, 0);
            var compost_sts_max = compost_sts_array.slice(0,2).reduce((sum, element) => sum + element, 0);
            var care_sts_total = care_sts_array.reduce((sum, element) => sum + element, 0);
            var care_sts_min = care_sts_array.slice(-2).reduce((sum, element) => sum + element, 0);
            var care_sts_max = care_sts_array.slice(0,2).reduce((sum, element) => sum + element, 0);

            //天候、体調補正をかける
            var condition_str = "null"
            var weather_str = "null"
            var element = document.getElementsByClassName("framearea");
            var b01 = document.getElementsByTagName("b");
            for (var i = 0; b01.length; i++) {
                if(b01[i].textContent.indexOf("自分行動時：PTステータス") > -1){
                    condition_str = b01[i].textContent;
                }
                if(b01[i].textContent.indexOf("現在の天気：") > -1){
                    weather_str = b01[i].textContent;
                    //framearea外の<b>タグを指定するとなんかエラーが出るので、
                    //天候が見つかり次第ループを止める(調子の下に天候があること前提)
                    break;
                }
            }

            //天候は、雨、快晴、そよ風、晴れ　の四つ
            //最後の一文字で判断できる
            //半角スペースがなけりゃなｧｧｱｱ!!!!
            var watering_sts_color = "";
            var compost_sts_color = "";
            var care_sts_color = "";
            switch (weather_str.trim().slice(-1)) {
                case "雨":
                    watering_sts_total *= 2
                    watering_sts_min *= 2
                    watering_sts_max *= 2
                    watering_sts_color = 'color: #1144EE '
                    break;
                case "晴":
                    compost_sts_total *= 2
                    compost_sts_min *= 2
                    compost_sts_max *= 2
                    compost_sts_color = 'color: #ee7736 '
                    break;
                case "風":
                    care_sts_total *= 2
                    care_sts_min *= 2
                    care_sts_max *= 2
                    care_sts_color = 'color: #008000 '
                    break;
                default:
                    break;
            }

            //体調補正の計算、ごり押し。
            //補正の切り捨て切り上げとそのタイミングがわからなかったのでここで成り行き。
            var condition_correction = 1;
            var bold = 'font-weight: bold; ';
            console.log(condition_str.trim().slice(-4));
            if (condition_str != "null") {
                switch (condition_str.trim().slice(-4)) {
                    case "00%)":
                        condition_correction = 2;
                        break;
                    case "75%)":
                        condition_correction = 1.75;
                        break;
                    case "50%)":
                        condition_correction = 1.5;
                        break;
                    case "30%)":
                        condition_correction = 1.3;
                        break;
                    case "20%)":
                        condition_correction = 1.2;
                        break;
                    case "10%)":
                        condition_correction = 1.1;
                        break;
                    default:
                        bold = "";
                        break;
                }
            }

            watering_sts_total *= condition_correction
            watering_sts_min *= condition_correction
            watering_sts_max *= condition_correction
            compost_sts_total *= condition_correction
            compost_sts_min *= condition_correction
            compost_sts_max *= condition_correction
            care_sts_total *= condition_correction
            care_sts_min *= condition_correction
            care_sts_max *= condition_correction

            //花壇ステータスデータテーブルを生成
            target.append('<table class="kadanlist" id="gardeningStsTbl" width="160">');
            target.append('<tbody id="gardeningStsTblBody"><tr><th width="80"><span class="markp marki1">作業内容</span></th><th width="80"><span class="markp marki1">合計作業能力値</span></th><th width="80"><span class="markp marki1">最低ケース</span></th><th width="80"><span class="markp marki1">最高ケース</span></th></tr>');
            target.append('<tr class="odd" id="gardeningStsTblWat" style="' + bold + watering_sts_color + '"><td align="center"><span class="markp marki0">水やり</span></td><td align="center">' + watering_sts_total + '</td><td align="center">' + watering_sts_min + '</td><td align="center">' + watering_sts_max + '</td>');
            target.append('<tr class="even" id="gardeningStsTblComp" style="' + bold + compost_sts_color +'"><td align="center"><span class="markp marki0">施肥</span></td><td align="center">' + compost_sts_total + '</td><td align="center">' + compost_sts_min + '</td><td align="center">' + compost_sts_max + '</td>');
            target.append('<tr class="odd" id="gardeningStsTblCare" style="' + bold + care_sts_color +'"><td align="center"><span class="markp marki0">手入れ</span></td><td align="center">' + care_sts_total + '</td><td align="center">' + care_sts_min + '</td><td align="center">' + care_sts_max + '</td></tbody></table>');
            target.append('<br clear="all" id="gardeningSts_br">');
            target.append('<h2 class="subtitle" id="gardeningSts_line"> </h2>');
        }

        function getStatus(array, pc, sts1, sts2) {
            //自キャラのデータ取得
            array.push(parseInt(pc.getAttribute(sts1)) + parseInt(pc.getAttribute(sts2)));

            //同行者のデータ取得
            accompany_CharaId.forEach(function(id) {
                let eno = document.getElementById(id).value;
                //ENo.0はいない
                if(eno) {
                    let ac = document.getElementById("eno" + eno);
                    array.push(parseInt(ac.getAttribute(sts1)) + parseInt(ac.getAttribute(sts2)));
                }
            });

            //最大値、最小値の算出のため配列内を小さい順にソートしてから返す
            array.sort(
                function(a,b){
                    return (a < b ? 1 : -1);
                }
            );
        }

        function addBattleDetails(target) {
            target.append('<h2 class="subtitle" id="accompany_title">連れ出しメンバー一覧</h2>');

            addPlayerCharactorDetail(target);
            addMemberDetails(target);

            target.append('<br clear="all" id="accompany_br">');
            target.append('<h2 class="subtitle" id="accompany_line"> </h2>');
        }

        function addPlayerCharactorDetail(target) {
            //自キャラのステータスを取得して上部に表示
            var elements = document.getElementsByClassName("charaframeself");
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