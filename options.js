// ロードイベント登録
window.addEventListener('load', load, false);

// 保存ボタンイベント登録
document.addEventListener('DOMContentLoaded', setRegex);
// テストボタンイベント登録
document.addEventListener('DOMContentLoaded', runTest);

// ロードイベント
function load() {
    chrome.storage.local.get('regex', function (text) {
        // 正規表現をセット
        document.getElementById('regex').value = text.regex;
    });
}

// 保存
function setRegex() {
    // OKボタンにイベント登録
    document.querySelector('#ok').addEventListener('click', function () {

        var entity = {};
        entity = {
            regex: document.getElementById('regex').value
        };
        chrome.storage.local.set(entity, function () {
        });

    });
}

// テスト
function runTest() {
    // OKボタンにイベント登録
    document.querySelector('#test').addEventListener('click', function () {

        // 全行で再度正規表現マッチング
        const regex_multi = new RegExp(document.getElementById('regex').value, "giu");
        const result_array = document.getElementById('test_text').value.match(regex_multi);

        // 名前付きキャプチャ
        const name_capture_array = document.getElementById('regex').value.match(new RegExp("<[^<>]*>", "giu"));

        document.getElementById('result_text').value = "";
        if (result_array) {
            // 各行で再度正規表現マッチング
            const regex_single = new RegExp(document.getElementById('regex').value, "iu");
            result_array.forEach(item => {
                const result_array_single = item.match(regex_single);

                name_capture_array.forEach(item => {
                    // 名前付きキャプチャキー
                    const key = item.replace("<", "").replace(">", "");
                    // キーバリュー出力
                    document.getElementById('result_text').value = document.getElementById('result_text').value + key + ":" + result_array_single.groups[key] + " ";
                });
                // 改行
                document.getElementById('result_text').value = document.getElementById('result_text').value + "\r\n";

            })
        }

    });
}

