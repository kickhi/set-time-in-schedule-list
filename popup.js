document.addEventListener('DOMContentLoaded', function () {
    // OKボタンにイベント登録
    document.querySelector('#ok').addEventListener('click', clickOkHandler);
});

document.addEventListener('DOMContentLoaded', function () {
    // オプションページを開くボタンにイベント登録
    document.querySelector('#option').addEventListener('click', clickOptionHandler);
});

document.addEventListener('DOMContentLoaded', function () {
    // オプションページを開くボタンにイベント登録
    document.querySelector('#sample').addEventListener('click', clickSampleHandler);
});

// OKのイベントハンドラー
function clickOkHandler(e) {

    chrome.storage.local.get('regex', function (text) {

        // 読み込みテキスト
        const input_text = document.getElementById("textarea").value;
        // 全行で再度正規表現マッチング
        const regex_multi = new RegExp(text.regex, "giu");

        // 名前付きキャプチャリストを取得
        const nameCaptureList = getNameCaptureList(text.regex);

        // 正規表現マッチング結果
        const result_array = input_text.match(regex_multi);

        // 日付データを格納する連想配列を作成
        let time_a_day = new Map();

        if (result_array) {
            // 各行で再度正規表現マッチング
            const regex_single = new RegExp(regex_multi, "iu");
            result_array.forEach(row => {
                const result_array_single = row.match(regex_single);

                if (result_array_single) {
                    // 日付の名前付きキャプチャ名を取得
                    const value_id = getDateNameCaptureList(nameCaptureList);

                    if (result_array_single.groups[value_id] && result_array_single.groups) {
                        // 日付を取得
                        let dateString = getDay(result_array_single.groups[value_id]);
                        if (true) {
                            let nextDay = false;
                            for (let match_value of result_array_single) {
                                let hour = 0
                                // 時刻に変換できるか？
                                time = match_value.match(new RegExp("(?<hour>[0-9]{1,2}):[0-9]{1,2}:[0-9]{1,2}", "iu"))
                                if (time) {
                                    hour = Number(time.groups.hour)
                                } else {
                                    time = match_value.match(new RegExp("(?<hour>[0-9]{1,2}):[0-9]{1,2}", "iu"))
                                    if (time) {
                                        hour = Number(time.groups.hour)
                                    }
                                }
                                if (hour >= 24) {
                                    nextDay = true
                                }
                            }
                            if (nextDay) {
                                // 1日戻す
                                const date = new Date(new Date(Date.parse(dateString)) - 1)
                                dateString = (date.getMonth() + 1) + "/" + date.getDate()
                            }
                        }
                        // 日付をキーに、日付開始時刻終了時刻が入ったオブジェクトを保存
                        time_a_day.set(dateString, result_array_single.groups);
                    }
                }

            });
        }

        // 現在のタブページに解析した結果を送る
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id,
                JSON.stringify({ nameCaptureList: nameCaptureList, time_a_day: JSON.stringify([...time_a_day]), date_id: getDateNameCaptureList(nameCaptureList) }),
                function (response) {
                });
        });

    });

}

// オプションページを開くのイベントハンドラー
function clickOptionHandler(e) {

    window.open('chrome-extension://' + chrome.runtime.id + '/options.html', '_blank'); // 新しいタブを開き、ページを表示

}

// オプションページを開くのイベントハンドラー
function clickSampleHandler(e) {

    window.open('chrome-extension://' + chrome.runtime.id + '/sample.html', '_blank'); // 新しいタブを開き、ページを表示
}

// 正規表現文字列の名前付きキャプチャ名のリストを取得する
// (?<gp_dd>[0-9]{1,2}/[0-9]{1,2})[^0-9]*(?<stime>[0-9:]*)〜(?<etime>[0-9:]*)
// → ["gp_dd", "stime", "etime"]
function getNameCaptureList(text) {

    let return_array = [];

    // 正規表現マッチング
    const regex_multi = new RegExp("<[^<]*>", "giu");
    const result_array = text.match(regex_multi);
    if (result_array) {
        result_array.forEach(name_item => {
            return_array.push(name_item.replace("<", "").replace(">", ""));
        });
    }

    return return_array;
}

// 日付の名前付きキャプチャ名を取得
function getDateNameCaptureList(list) {
    return list[0];
}

// 引数を解析して日付を取得
function getDay(date) {
    const slash_count = (date.match(/\//g) || []).length;
    if (slash_count == 0) {
        return Number(date);
    } else if (slash_count >= 1) {
        return Number(date.substring(date.lastIndexOf("/") + 1, date.length));
    }
    return -1;
}