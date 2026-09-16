import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';



const ctx1 = document.getElementById("side_img").getContext("2d");
const ctx2 = document.getElementById("front_img").getContext("2d");

const side_up = document.getElementById("side_up");
const side_b = document.getElementById("side_b");
const front_up = document.getElementById("front_up");
const front_b = document.getElementById("front_b");

side_b.addEventListener("click", () => {
  side_up.click();
});

front_b.addEventListener("click", () => {
  front_up.click();
});

// 背景画像保持用オブジェクト
const bgImages = {};

function Fileupload(hand_up, canvas_id, chartInstance) {
  const file = hand_up.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith('image/')) {
    alert('画像ファイルを選択してください。');
    hand_up.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      bgImages[canvas_id] = img;
      chartInstance.update();
    };
  };
  reader.readAsDataURL(file);
}

// ドラッグ移動量計算用の変数
let dragStartX = 0;
let dragStartY = 0;

const finger = {
  fore: 0,   // 人差し指
  middle: 1, // 中指
  third: 2,  // 薬指
  little: 3, // 小指
  thumb: 4   // 親指
};

const datum = 0; // 基準（手首）

const root = 1; // 指の付け根
const root_start = 0;
const root_end = 1;
const roots = 5; // 付け根全体

const first_webspace = 6; // 親指と人差し指の間
const first_webspace_start = 0;
const first_webspace_end = 1;

// 指ごとの関節名マッピング（index 0 は共通で手首）
const jointNamesMap = {
  fore: ['手首', '付け根', '第二関節', '第一関節', '指先'],
  middle: ['手首', '付け根', '第二関節', '第一関節', '指先'],
  third: ['手首', '付け根', '第二関節', '第一関節', '指先'],
  little: ['手首', '付け根', '第二関節', '第一関節', '指先'],
  thumb: ['手首', '付け根', 'IP関節', '指先']
};

// 操作中のイベントから対象の Chart オブジェクト (side_chart または front_chart) を特定する関数
function getCurrentChart(e) {
  const targetCanvas = e.target || (e.native && e.native.target);
  if (targetCanvas) {
    if (targetCanvas.id === "side_img") return side_chart;
    if (targetCanvas.id === "front_img") return front_chart;
  }
  return null;
}

// 設定生成用の関数（canvas_idを受け取る）
function createChartConfig(canvas_id) {
  return {
    type: 'line',
    data: {
      datasets: [
        {
          label: '人差し指',
          data: [
            { x: 0, y: 0 },
            { x: -25, y: 75 },
            { x: -30, y: 95 },
            { x: -35, y: 115 },
            { x: -40, y: 135 },
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgb(143, 69, 85)',
          borderWidth: 1,
          pointRadius: 8,
          pointHoverRadius: 12,
        },
        {
          label: '中指',
          data: [
            { x: 0, y: 0 },
            { x: -5, y: 80 },
            { x: -7, y: 105 },
            { x: -9, y: 130 },
            { x: -11, y: 155 },
          ],
          backgroundColor: 'rgba(255, 224, 99, 0.7)',
          borderColor: 'rgb(143, 117, 69)',
          borderWidth: 1,
          pointRadius: 8,
          pointHoverRadius: 12,
        },
        {
          label: '薬指',
          data: [
            { x: 0, y: 0 },
            { x: 15, y: 75 },
            { x: 17, y: 100 },
            { x: 19, y: 125 },
            { x: 21, y: 150 },
          ],
          backgroundColor: 'rgba(99, 133, 255, 0.7)',
          borderColor: 'rgb(69, 84, 143)',
          borderWidth: 1,
          pointRadius: 8,
          pointHoverRadius: 12,
        },
        {
          label: '小指',
          data: [
            { x: 0, y: 0 },
            { x: 30, y: 65 },
            { x: 35, y: 80 },
            { x: 40, y: 95 },
          ],
          backgroundColor: 'rgba(99, 255, 135, 0.7)',
          borderColor: 'rgb(69, 143, 85)',
          borderWidth: 1,
          pointRadius: 8,
          pointHoverRadius: 12,
        },
        {
          label: '親指',
          data: [
            { x: 0, y: 0 },
            { x: -50, y: 50 },
            { x: -55, y: 70 },
            { x: -60, y: 90 },
          ],
          backgroundColor: 'rgba(232, 99, 255, 0.7)',
          borderColor: 'rgb(143, 69, 138)',
          borderWidth: 1,
          pointRadius: 8,
          pointHoverRadius: 12,
        },
        {
          label: '付け根',
          data: [
            { x: -25, y: 75 },
            { x: 30, y: 65 },
          ],
          backgroundColor: 'rgba(99, 213, 255, 0.7)',
          borderColor: 'rgb(69, 131, 143)',
          borderWidth: 1,
          pointRadius: 8,
          pointHoverRadius: 12,
        },
        {
          label: '第一指間腔',
          data: [
            { x: -50, y: 50 },
            { x: -25, y: 75 },
          ],
          backgroundColor: 'rgba(99, 230, 255, 0.7)',
          borderColor: 'rgb(69, 151, 143)',
          borderWidth: 1,
          pointRadius: 8,
          pointHoverRadius: 12,
        }
      ]
    },
    plugins: [{
      id: 'customCanvasBackgroundImage',
      beforeDraw: (chart) => {
        const img = bgImages[canvas_id];
        if (img && img.complete) {
          const { ctx, chartArea } = chart;
          ctx.save();

          ctx.beginPath();
          ctx.rect(
            chartArea.left,
            chartArea.top,
            chartArea.right - chartArea.left,
            chartArea.bottom - chartArea.top
          );
          ctx.clip();

          const areaWidth = chartArea.right - chartArea.left;
          const areaHeight = chartArea.bottom - chartArea.top;
          const imgAspect = img.width / img.height;
          const areaAspect = areaWidth / areaHeight;

          let renderWidth, renderHeight;

          if (imgAspect > areaAspect) {
            renderHeight = areaHeight;
            renderWidth = areaHeight * imgAspect;
          } else {
            renderWidth = areaWidth;
            renderHeight = areaWidth / imgAspect;
          }

          const renderX = chartArea.left + (areaWidth - renderWidth) / 2;
          const renderY = chartArea.top + (areaHeight - renderHeight) / 2;

          ctx.drawImage(img, renderX, renderY, renderWidth, renderHeight);
          ctx.restore();
        }
      }
    }],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          min: -100,
          max: 100,
          ticks: { stepSize: 10, color: "#323232" },
          grid: { color: "#646464" },
          title: { display: true, text: 'X 軸 (単位)' }
        },
        y: {
          min: 0,
          max: 200,
          ticks: { stepSize: 10, color: "#323232" },
          grid: { color: "#646464" },
          title: { display: true, text: 'Y 軸 (単位)' }
        }
      },
      plugins: {
        dragData: {
          round: 1,
          dragX: true,
          dragY: true,
          showTooltip: true,

          onDragStart: function (e, datasetIndex, index, value) {
            dragStartX = value.x;
            dragStartY = value.y;
            if (e.target) e.target.style.cursor = 'grabbing';
          },

          onDrag: function (e, datasetIndex, index, value) {
            const chart = getCurrentChart(e);
            if (!chart) return;

            const dx = value.x - dragStartX;
            const dy = value.y - dragStartY;

            // 1. 手首 (index === datum) ドラッグ時の連動処理
            if (index === datum && datasetIndex <= 4) {
              const fingerIndices = [finger.fore, finger.middle, finger.third, finger.little, finger.thumb];

              fingerIndices.forEach((fIdx) => {
                const p = chart.data.datasets[fIdx].data[datum];
                if (p) {
                  p.x += dx;
                  p.y += dy;
                }
              });

              dragStartX = value.x;
              dragStartY = value.y;

              chart.update('none');
            }

            // 2. 付け根連動 (index === root)
            if (index === root) {
              if (datasetIndex === finger.fore) {
                const root_s = chart.data.datasets[roots].data[root_start];
                const first_webspace_e = chart.data.datasets[first_webspace].data[first_webspace_end];

                if (root_s) { root_s.x += dx; root_s.y += dy; }
                if (first_webspace_e) { first_webspace_e.x += dx; first_webspace_e.y += dy; }

                dragStartX = value.x;
                dragStartY = value.y;

                chart.update('none');

              } else if (datasetIndex === finger.little) {
                const root_e = chart.data.datasets[roots].data[root_end];

                if (root_e) { root_e.x += dx; root_e.y += dy; }

                dragStartX = value.x;
                dragStartY = value.y;

                chart.update('none');

              } else if (datasetIndex === finger.thumb) {
                const first_webspace_s = chart.data.datasets[first_webspace].data[first_webspace_start];

                if (first_webspace_s) { first_webspace_s.x += dx; first_webspace_s.y += dy; }

                dragStartX = value.x;
                dragStartY = value.y;

                chart.update('none');
              }
            }
          },

          onDragEnd: function (e, datasetIndex, index, value) {
            if (e.target) e.target.style.cursor = 'default';

            const chart = getCurrentChart(e);
            if (!chart) return;

            if (index === datum && datasetIndex <= 4) {
              const targetX = value.x;
              const targetY = value.y;
              const fingerIndices = [finger.fore, finger.middle, finger.third, finger.little, finger.thumb];

              fingerIndices.forEach((fIdx) => {
                const p = chart.data.datasets[fIdx].data[datum];
                if (p) {
                  p.x = targetX;
                  p.y = targetY;
                }
              });

              chart.update('none');
            }

            updateCoordList(chart);
          },

          onHover: function (e) {
            if (e.target) e.target.style.cursor = 'grab';
          }
        },
        tooltip: {
          callbacks: {
            title: function (context) {
              const datasetLabel = context[0].dataset.label;
              const datasetIndex = context[0].datasetIndex;
              const dataIndex = context[0].dataIndex;

              const fingerKeys = ['fore', 'middle', 'third', 'little', 'thumb'];
              const key = fingerKeys[datasetIndex];

              if (key && jointNamesMap[key]) {
                const jointName = jointNamesMap[key][dataIndex] || `点${dataIndex}`;
                
                // 手首（index: 0）の場合は指名を付けずに「手首」のみ表示
                if (dataIndex === datum) {
                  return '手首';
                }
                
                return `${datasetLabel} (${jointName})`;
              }

              return datasetLabel;
            },
            label: function (context) {
              return `位置: (${context.raw.x}, ${context.raw.y})`;
            }
          }
        }
      }
    }
  };
}

// グラフインスタンス作成
const side_chart = new Chart(ctx1, createChartConfig("side_img"));
const front_chart = new Chart(ctx2, createChartConfig("front_img"));

// イベントリスナー登録
side_up.addEventListener("change", () => {
  Fileupload(side_up, "side_img", side_chart);
});

front_up.addEventListener("change", () => {
  Fileupload(front_up, "front_img", front_chart);
});

const BUTTON_CLICK_EVENT = document.getElementById('feed_b');
if (BUTTON_CLICK_EVENT) {
  BUTTON_CLICK_EVENT.addEventListener('click', () => {
  });
}

function getFingerCoord(targetChart) {
  const chartInstance = targetChart || side_chart;
  const datasets = chartInstance.data.datasets;

  return {
    fore: datasets[finger.fore].data,
    middle: datasets[finger.middle].data,
    third: datasets[finger.third].data,
    little: datasets[finger.little].data,
    thumb: datasets[finger.thumb].data,
  };
}

function updateCoordList(targetChart) {
  const table_body = document.getElementById('coord_table_body');
  if (!table_body) return;

  const coord = getFingerCoord(targetChart);
  table_body.innerHTML = '';

  const fingers = [
    { key: 'fore', name: '人差し指', points: coord.fore },
    { key: 'middle', name: '中指', points: coord.middle },
    { key: 'third', name: '薬指', points: coord.third },
    { key: 'little', name: '小指', points: coord.little },
    { key: 'thumb', name: '親指', points: coord.thumb }
  ];

  fingers.forEach(fingerItem => {
    const names = jointNamesMap[fingerItem.key];
    fingerItem.points.forEach((point, index) => {
      const row = document.createElement('tr');
      const pointLabel = (names && names[index]) ? names[index] : `P${index}`;
      
      // 手首（index: 0）の場合は指名を空文字にして「手首」と表示
      const displayName = (index === datum) ? '-' : fingerItem.name;
      
      row.innerHTML = `
        <td>${displayName}</td>
        <td>${pointLabel}</td>
        <td>${point.x}</td>
        <td>${point.y}</td>
      `;
      table_body.appendChild(row);
    });
  });
}

//////表の部分/////////////////////////////////////

const collect_length = {
  joint: {
    fore: { t_s: 20.5, s_f: 20.5, f_t: 20.5 },     //f_tは第一関節から指先（first to tip）
    middle: { t_s: 25, s_f: 25, f_t: 25 },
    third: { t_s: 25, s_f: 25, f_t: 25 },
    little: { t_s: 15.5, s_f: 15.5, f_t: 15.5 },
    thumb: { s_f: 20.5, f_t: 20.5 }
  },
  root: { f_l: 55.5, t_f: 35, d_m: 80, d_t: 70.5 }　　//f-lは人差し指付け根から小指付け根まで、t_fは第一指間腔、d_mは手首から中指付け根まで、d_tは手首から親指付け根まで
};


// 2点間の距離を求める関数(2次元座標)
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


///////3D手の部分 (座標合成・メッシュ描画)/////////////////////////////////////

const handCanvas1 = document.getElementById('handCanvas1');
const handCanvas2 = document.getElementById('handCanvas2');

// シーン・カメラ・レンダラーの準備
const scene1 = new THREE.Scene();
const camera1 = new THREE.PerspectiveCamera(45, handCanvas1.clientWidth / handCanvas1.clientHeight, 0.1, 1000);
camera1.position.set(0, 50, 250);


const renderer1 = new THREE.WebGLRenderer({ canvas: handCanvas1, alpha: true, antialias: true });
renderer1.setSize(handCanvas1.clientWidth, handCanvas1.clientHeight, false);
renderer1.setPixelRatio(window.devicePixelRatio);

const scene2 = new THREE.Scene();
const camera2 = new THREE.PerspectiveCamera(45, handCanvas2.clientWidth / handCanvas2.clientHeight, 0.1, 1000);
camera2.position.set(0, 50, 250);

const renderer2 = new THREE.WebGLRenderer({ canvas: handCanvas2, alpha: true, antialias: true });
renderer2.setSize(handCanvas2.clientWidth, handCanvas2.clientHeight, false);
renderer2.setPixelRatio(window.devicePixelRatio);

// ライトの設置
[scene1, scene2].forEach(scene => {
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(100, 100, 100);
  scene.add(dirLight);
});

// コントロール
const control1 = new OrbitControls(camera1, renderer1.domElement);
const control2 = new OrbitControls(camera2, renderer2.domElement);
control1.enableDamping = true;
control2.enableDamping = true;

control1.target.set(0, 80, 0);
control2.target.set(0, 80, 0);

// 3D手オブジェクト格納用グループ
const handGroup1 = new THREE.Group();
const handGroup2 = new THREE.Group();
scene1.add(handGroup1);
scene2.add(handGroup2);

// 骨（円柱）を作成する補助関数 (3D_hand.html参照)
function createBone(p1, p2) {
  const distance = p1.distanceTo(p2);
  if (distance === 0) return new THREE.Group();

  const cylinderGeo = new THREE.CylinderGeometry(1.5, 1.5, distance, 8);
  const cylinderMat = new THREE.MeshLambertMaterial({ color: 0x00ffcc, wireframe: true });
  const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);

  const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  cylinder.position.copy(midPoint);

  const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  return cylinder;
}

// 接続する関節の定義 (データセットインデックスおよび点番号に対応)
// 指インデックス: 0:人差し指, 1:中指, 2:薬指, 3:小指, 4:親指
const connections = [
  // 各指の関節を順番に接続 (点0 -> 1 -> 2 -> 3 -> 4)
  { f: 0, p1: 0, p2: 1 }, { f: 0, p1: 1, p2: 2 }, { f: 0, p1: 2, p2: 3 }, { f: 0, p1: 3, p2: 4 },
  { f: 1, p1: 0, p2: 1 }, { f: 1, p1: 1, p2: 2 }, { f: 1, p1: 2, p2: 3 }, { f: 1, p1: 3, p2: 4 },
  { f: 2, p1: 0, p2: 1 }, { f: 2, p1: 1, p2: 2 }, { f: 2, p1: 2, p2: 3 }, { f: 2, p1: 3, p2: 4 },
  { f: 3, p1: 0, p2: 1 }, { f: 3, p1: 1, p2: 2 }, { f: 3, p1: 2, p2: 3 },
  { f: 4, p1: 0, p2: 1 }, { f: 4, p1: 1, p2: 2 }, { f: 4, p1: 2, p2: 3 }
];

// 2Dグラフの座標から3D座標群を構築してモデルを描画する関数
function update3DHand() {
  // グループ内を一度クリア
  while (handGroup1.children.length > 0) handGroup1.remove(handGroup1.children[0]);
  while (handGroup2.children.length > 0) handGroup2.remove(handGroup2.children[0]);

  // side_chart (X: 横, Y: 縦) と front_chart (X: 奥行き, Y: 縦) の座標を取得
  const sideDatasets = side_chart.data.datasets;
  const frontDatasets = front_chart.data.datasets;

  const sphereGeo = new THREE.SphereGeometry(2.5, 16, 16);
  const sphereMat = new THREE.MeshLambertMaterial({ color: 0xff0055, wireframe: true });

  // 3D 座標を保持する構造 [fingerIndex][pointIndex] = THREE.Vector3
  const joints3D = [[], [], [], [], []];

  // 1. 各関節の 3D 座標を設定し球体オブジェクトを生成
  for (let f = 0; f < 5; f++) {
    const sidePoints = sideDatasets[f].data;
    const frontPoints = frontDatasets[f].data;

    for (let i = 0; i < sidePoints.length; i++) {
      const sP = sidePoints[i];
      const fP = frontPoints[i] || { x: 0, y: sP.y };

      // sideのXをX軸、sideのYをY軸、frontのXをZ軸(奥行き)として合成
      const pos = new THREE.Vector3(sP.x, sP.y, fP.x);
      joints3D[f][i] = pos;

      // 関節（球体）作成
      const sphere1 = new THREE.Mesh(sphereGeo, sphereMat);
      sphere1.position.copy(pos);
      handGroup1.add(sphere1);

      const sphere2 = sphere1.clone();
      handGroup2.add(sphere2);
    }
  }

  // 2. 関節間を繋ぐ骨（円柱）を作成
  connections.forEach(conn => {
    const p1 = joints3D[conn.f][conn.p1];
    const p2 = joints3D[conn.f][conn.p2];

    if (p1 && p2) {
      const bone1 = createBone(p1, p2);
      handGroup1.add(bone1);

      const bone2 = createBone(p1, p2);
      handGroup2.add(bone2);
    }
  });

  // 付け根同士の接続 (手のひら構造)
  const palmConnections = [
    { f1: 0, p1: 1, f2: 1, p2: 1 }, // 人差し指付け根 - 中指付け根
    { f1: 1, p1: 1, f2: 2, p2: 1 }, // 中指付け根 - 薬指付け根
    { f1: 2, p1: 1, f2: 3, p2: 1 }  // 薬指付け根 - 小指付け根
  ];

  palmConnections.forEach(conn => {
    const p1 = joints3D[conn.f1][conn.p1];
    const p2 = joints3D[conn.f2][conn.p2];
    if (p1 && p2) {
      handGroup1.add(createBone(p1, p2));
      handGroup2.add(createBone(p1, p2));
    }
  });
}

// DragData のドラッグ終了時(onDragEnd)および初期化時に 3D モデルを更新
const originalOnDragEnd = side_chart.options.plugins.dragData.onDragEnd;

// チャートの設定に3D更新イベントを割り当て
[side_chart, front_chart].forEach(chart => {
  const configOnDragEnd = chart.options.plugins.dragData.onDragEnd;
  chart.options.plugins.dragData.onDragEnd = function (e, datasetIndex, index, value) {
    if (configOnDragEnd) configOnDragEnd(e, datasetIndex, index, value);
    update3DHand();
  };
});

// 初期描画
update3DHand();

// アニメーションループ
function animate() {
  requestAnimationFrame(animate);
  control1.update();
  control2.update();


  renderer1.render(scene1, camera1);
  renderer2.render(scene2, camera2);
}

animate();
