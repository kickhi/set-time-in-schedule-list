// 受信側 other tab -> contents(popup/option -> contents)
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message) {
    // popup.jsからもらったデータを解析して、time_a_day_listにマッピングする
    let time_a_day_list = new Map();
    if (JSON.parse(JSON.parse(message).time_a_day)) {
      JSON.parse(JSON.parse(message).time_a_day).forEach((time_a_day) => {
        time_a_day_list.set(time_a_day[0], time_a_day[1]);
      });
    }

    // ページのtrタグを解析して、マッチした日付行の開始時刻終了時刻欄に、日付をセットする
    for (let i = 0; i < document.getElementsByTagName("tr").length; i++) {
      // 毎ループ2回だけに制限
      let limit = 2;
      // date項目を取得
      const date_column = document
        .getElementsByTagName("tr")
        [i].querySelector("#" + JSON.parse(message).date_id);
      let date;
      if (date_column) {
        date = Number(
          date_column.textContent
            .replace("日", "")
            .replace("(", "")
            .replace(")", "")
            .replace("月", "")
            .replace("火", "")
            .replace("水", "")
            .replace("木", "")
            .replace("金", "")
            .replace("土", "")
        );
      } else {
        continue;
      }

      // 日付が取得できた行だけ処理する
      if (date) {
        // tr1行のinputの一覧取得
        const input_list = document
          .getElementsByTagName("tr")
          [i].querySelectorAll("input");

        if (input_list) {
          for (let j = 0; j < input_list.length; j++) {
            if (JSON.parse(message).nameCaptureList) {
              for (
                let k = 1;
                k < JSON.parse(message).nameCaptureList.length;
                k++
              ) {
                // inputにセット
                const time_a_day = time_a_day_list.get(date);
                if (
                  input_list[j].id.indexOf(
                    JSON.parse(message).nameCaptureList[k]
                  ) >= 0 &&
                  time_a_day
                ) {
                  // 名前付きキャプチャ名とtrタグのidが一致(部分一致)していて、入れる日付が取得できているときは、
                  // 日付を入れる
                  if (limit > 0) {
                    input_list[j].value =
                      time_a_day[JSON.parse(message).nameCaptureList[k]];
                    limit = limit - 1;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return true;
});
