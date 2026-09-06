// 基準値データ
const collect_length = {
  joint: {
    fore: { t_s: 20.5, s_f: 20.5, f_t: 20.5 },
    middle: { t_s: 25, s_f: 25, f_t: 25 },
    third: { t_s: 25, s_f: 25, f_t: 25 },
    little: { t_s: 15.5, s_f: 15.5, f_t: 15.5 },
    thumb: { s_f: 20.5, f_t: 20.5 }
  },
  root: { f_l: 55.5, t_f: 35, d_m: 80, d_t: 70.5 }
};

// 2点間の距離を求める関数
function getDist(p1, p2) {
  if (!p1 || !p2) return 0;
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

// フィードバック開始ボタン（HTMLの id="feed_b"）の取得
const button_click_event = document.getElementById('feed_b');

if (button_click_event) {
  button_click_event.addEventListener('click', () => {
    // グラフ（side_chart）が存在しない場合は処理を中断
    if (typeof side_chart === 'undefined' || !side_chart.data) {
      console.error("グラフのインスタンスが見つかりません。");
      return;
    }

    // グラフから各部位の座標配列を取得
    const datasets = side_chart.data.datasets;
    const fore = datasets[0].data;
    const middle = datasets[1].data;
    const third = datasets[2].data;
    const little = datasets[3].data;
    const thumb = datasets[4].data;
    const rootData = datasets[5].data;
    const webspace = datasets[6].data;

    // 現在の座標から各パーツの長さを計算
    const length = {
      fore: {
        third_second: getDist(fore[1], fore[2]),
        second_first: getDist(fore[2], fore[3]),
        first_tip: getDist(fore[3], fore[4])
      },
      middle: {
        third_second: getDist(middle[1], middle[2]),
        second_first: getDist(middle[2], middle[3]),
        first_tip: getDist(middle[3], middle[4])
      },
      third: {
        third_second: getDist(third[1], third[2]),
        second_first: getDist(third[2], third[3]),
        first_tip: getDist(third[3], third[4])
      },
      little: {
        third_second: getDist(little[1], little[2]),
        second_first: getDist(little[2], little[3]),
        first_tip: getDist(little[3], little[4])
      },
      thumb: {
        second_first: getDist(thumb[1], thumb[2]),
        first_tip: getDist(thumb[2], thumb[3])
      },
      root: {
        fore_little: getDist(fore[1], little[1]),
        thumb_fore: getDist(webspace[0], webspace[1]),
        datum_middle: getDist(middle[0], middle[1]),
        datum_thumb: getDist(thumb[0], thumb[1])
      }
    };

    // 表表示用テキストオブジェクト定義
    const t_name_l = {
      finger: { fore: '人差し指', middle: '中指' },
      joint: {
        third_second: '第三～第二関節',
        second_first: '第二～第一関節',
        first_tip: '第一関節～先端'
      }
    };

    const t_name_c = {
      finger: { third: '薬指', little: '小指' },
      joint: {
        third_second: '第三～第二関節',
        second_first: '第二～第一関節',
        first_tip: '第一関節～先端'
      }
    };

    const t_name_r = {
      part: { thumb: '親指' },
      joint: {
        second_first: '第二～第一関節',
        first_tip: '第一関節～先端'
      },
      root: {
        fore_little: '人差し指付け根～小指',
        thumb_fore: '第一指間腔',
        datum_middle: '手首～中指付け根',
        datum_thumb: '手首～親指付け根'
      }
    };

    // ===== 1. 左側の表 (人差し指・中指) =====
    const table_l = document.querySelector('.coord_table_l');
    if (table_l) {
      table_l.innerHTML = '';
      table_l.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${t_name_l.finger.fore}</td>
          <td class="empty"></td>
          <td class="empty"></td>
        </tr>
        <tr>
          <td>${t_name_l.joint.third_second}</td>
          <td>${Math.round((length.fore.third_second) * 10) / 10}</td>
          <td>${collect_length.joint.fore.t_s}</td>
        </tr>
        <tr>
          <td>${t_name_l.joint.second_first}</td>
          <td>${Math.round((length.fore.second_first) * 10) / 10}</td>
          <td>${collect_length.joint.fore.s_f}</td>
        </tr>
        <tr>
          <td>${t_name_l.joint.first_tip}</td>
          <td>${Math.round((length.fore.first_tip) * 10) / 10}</td>
          <td>${collect_length.joint.fore.f_t}</td>
        </tr>

        <tr>
          <td>${t_name_l.finger.middle}</td>
          <td class="empty"></td>
          <td class="empty"></td>
        </tr>
        <tr>
          <td>${t_name_l.joint.third_second}</td>
          <td>${Math.round((length.middle.third_second) * 10) / 10}</td>
          <td>${collect_length.joint.middle.t_s}</td>
        </tr>
        <tr>
          <td>${t_name_l.joint.second_first}</td>
          <td>${Math.round((length.middle.second_first) * 10) / 10}</td>
          <td>${collect_length.joint.middle.s_f}</td>
        </tr>
        <tr>
          <td>${t_name_l.joint.first_tip}</td>
          <td>${Math.round((length.middle.first_tip) * 10) / 10}</td>
          <td>${collect_length.joint.middle.f_t}</td>
        </tr>
      `);
    }

    // ===== 2. 中央の表 (薬指・小指) =====
    const table_c = document.querySelector('.coord_table_c');
    if (table_c) {
      table_c.innerHTML = '';
      table_c.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${t_name_c.finger.third}</td>
          <td class="empty"></td>
          <td class="empty"></td>
        </tr>
        <tr>
          <td>${t_name_c.joint.third_second}</td>
          <td>${Math.round((length.third.third_second) * 10) / 10}</td>
          <td>${collect_length.joint.third.t_s}</td>
        </tr>
        <tr>
          <td>${t_name_c.joint.second_first}</td>
          <td>${Math.round((length.third.second_first) * 10) / 10}</td>
          <td>${collect_length.joint.third.s_f}</td>
        </tr>
        <tr>
          <td>${t_name_c.joint.first_tip}</td>
          <td>${Math.round((length.third.first_tip) * 10) / 10}</td>
          <td>${collect_length.joint.third.f_t}</td>
        </tr>

        <tr>
          <td>${t_name_c.finger.little}</td>
          <td class="empty"></td>
          <td class="empty"></td>
        </tr>
        <tr>
          <td>${t_name_c.joint.third_second}</td>
          <td>${Math.round((length.little.third_second) * 10) / 10}</td>
          <td>${collect_length.joint.little.t_s}</td>
        </tr>
        <tr>
          <td>${t_name_c.joint.second_first}</td>
          <td>${Math.round((length.little.second_first) * 10) / 10}</td>
          <td>${collect_length.joint.little.s_f}</td>
        </tr>
        <tr>
          <td>${t_name_c.joint.first_tip}</td>
          <td>${Math.round((length.little.first_tip) * 10) / 10}</td>
          <td>${collect_length.joint.little.f_t}</td>
        </tr>
      `);
    }

    // ===== 3. 右側の表 (親指・その他) =====
    const table_r = document.querySelector('.coord_table_r');
    if (table_r) {
      table_r.innerHTML = '';
      table_r.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${t_name_r.part.thumb}</td>
          <td class="empty"></td>
          <td class="empty"></td>
        </tr>
        <tr>
          <td>${t_name_r.joint.second_first}</td>
          <td>${Math.round((length.thumb.second_first) * 10) / 10}</td>
          <td>${collect_length.joint.thumb.s_f}</td>
        </tr>
        <tr>
          <td>${t_name_r.joint.first_tip}</td>
          <td>${Math.round((length.thumb.first_tip) * 10) / 10}</td>
          <td>${collect_length.joint.thumb.f_t}</td>
        </tr>

        <tr>
          <td>その他</td>
          <td class="empty"></td>
          <td class="empty"></td>
        </tr>
        <tr>
          <td>${t_name_r.root.fore_little}</td>
          <td>${Math.round((length.root.fore_little) * 10) / 10}</td>
          <td>${collect_length.root.f_l}</td>
        </tr>
        <tr>
          <td>${t_name_r.root.thumb_fore}</td>
          <td>${Math.round((length.root.thumb_fore) * 10) / 10}</td>
          <td>${collect_length.root.t_f}</td>
        </tr>
        <tr>
          <td>${t_name_r.root.datum_middle}</td>
          <td>${Math.round((length.root.datum_middle) * 10) / 10}</td>
          <td>${collect_length.root.d_m}</td>
        </tr>
        <tr>
          <td>${t_name_r.root.datum_thumb}</td>
          <td>${Math.round((length.root.datum_thumb) * 10) / 10}</td>
          <td>${collect_length.root.d_t}</td>
        </tr>
      `);
    }
  });
}
