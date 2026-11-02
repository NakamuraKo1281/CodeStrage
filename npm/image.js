import * as THREE from  "three";
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
window.bgImages = {};

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
let activeChart =null;

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

const bgLabels = {
  side_img: '側面',
  front_img: '正面'
};

const bgTextPlugin = {
  id: 'bgText',
  beforeDatasetsDraw(chart, args, opts) {
    if (!opts || !opts.text) return;
    const { ctx, chartArea: { left, right, top, bottom } } = chart;

    ctx.save();
    ctx.globalAlpha = opts.alpha ?? 0.15;
    ctx.fillStyle = opts.color ?? '#000';
    ctx.font = opts.font ?? 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opts.text, (left + right)/ 1.3, (top + bottom)/ 8);
    ctx.restore();
  }
};

// 設定生成用の関数（canvas_idを受け取る）
function createChartConfig(canvas_id) {
  const getThisChart = () => (canvas_id === "side_img" ? side_chart : front_chart);
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
          borderWidth: 2,
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
          borderWidth: 2,
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
          borderWidth: 2,
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
            { x: 45, y: 110 }
          ],
          backgroundColor: 'rgba(99, 255, 135, 0.7)',
          borderColor: 'rgb(69, 143, 85)',
          borderWidth: 2,
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
          borderWidth: 2,
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
          borderWidth: 2,
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
          borderWidth: 2,
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
    }, bgTextPlugin],
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
          grid: { color: "#aaaaaa" },
          title: { display: true, text: 'X 軸 (単位)' }
        },
        y: {
          min: 0,
          max: 200,
          ticks: { stepSize: 10, color: "#323232" },
          grid: { color: "#aaaaaa" },
          title: { display: true, text: 'Y 軸 (単位)' }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        bgText: {
          text: bgLabels[canvas_id],
          alpha: 0.15,
          color: '#000',
          font: 'bold 64px sans-serif'
        },
        dragData: {
          round: 1,
          dragX: true,
          dragY: true,
          showTooltip: true,

          onDragStart: function (e, datasetIndex, index, value) {
            dragStartX = value.x;
            dragStartY = value.y;
            activeChart = getThisChart();
            if (e.target) e.target.style.cursor = 'grabbing';
          },

          onDrag: function (e, datasetIndex, index, value) {
            const chart = activeChart;
            if (!chart) return;

            // チャートの外にカーソルが出ても値が暴走しないよう、軸の範囲内に制限する
            const xScale = chart.scales.x;
            const yScale = chart.scales.y;
            value.x = Math.max(xScale.min, Math.min(xScale.max, value.x));
            value.y = Math.max(yScale.min, Math.min(yScale.max, value.y));

            const expectedCanvasId = chart === side_chart ? "side_img" : "front_img";
            const currentCanvas = e.target || (e.native && e.native.target);
            if (currentCanvas && currentCanvas.id && currentCanvas.id !== expectedCanvasId) {
              return;
            }

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

            // 2. 指の付け根 (index === 1) ドラッグ時の連動
            if (index === 1 && datasetIndex <= 4) {
              if (datasetIndex === finger.fore) {
                const root_s = chart.data.datasets[roots].data[root_start];
                const first_webspace_e = chart.data.datasets[first_webspace].data[first_webspace_end];

                if (root_s) { root_s.x += dx; root_s.y += dy; }
                if (first_webspace_e) { first_webspace_e.x += dx; first_webspace_e.y += dy; }

              } else if (datasetIndex === finger.little) {
                const root_e = chart.data.datasets[roots].data[root_end];
                if (root_e) { root_e.x += dx; root_e.y += dy; }

              } else if (datasetIndex === finger.thumb) {
                const first_webspace_s = chart.data.datasets[first_webspace].data[first_webspace_start];
                if (first_webspace_s) { first_webspace_s.x += dx; first_webspace_s.y += dy; }
              }

              dragStartX = value.x;
              dragStartY = value.y;
              chart.update('none');
            }

            // 3. 付け根の線 (roots) ドラッグ時の連動
            if (datasetIndex === roots) {
              if (index === root_start) {
                const foreRoot = chart.data.datasets[finger.fore].data[1];
                const webEnd = chart.data.datasets[first_webspace].data[first_webspace_end];
                if (foreRoot) { foreRoot.x += dx; foreRoot.y += dy; }
                if (webEnd) { webEnd.x += dx; webEnd.y += dy; }
              } else if (index === root_end) {
                const littleRoot = chart.data.datasets[finger.little].data[1];
                if (littleRoot) { littleRoot.x += dx; littleRoot.y += dy; }
              }
              dragStartX = value.x;
              dragStartY = value.y;
              chart.update('none');
            }

            // 4. 第一指間腔の線 (first_webspace) ドラッグ時の連動
            if (datasetIndex === first_webspace) {
              if (index === first_webspace_start) {
                const thumbRoot = chart.data.datasets[finger.thumb].data[1];
                if (thumbRoot) { thumbRoot.x += dx; thumbRoot.y += dy; }
              } else if (index === first_webspace_end) {
                const foreRoot = chart.data.datasets[finger.fore].data[1];
                const rootStartP = chart.data.datasets[roots].data[root_start];
                if (foreRoot) { foreRoot.x += dx; foreRoot.y += dy; }
                if (rootStartP) { rootStartP.x += dx; rootStartP.y += dy; }
              }
              dragStartX = value.x;
              dragStartY = value.y;
              chart.update('none');
            }
          },

          onDragEnd: function (e, datasetIndex, index, value) {
            if (e.target) e.target.style.cursor = 'default';

            const chart = activeChart;
            if (!chart) return;

            const expectedCanvasId = chart === side_chart ? "side_img" : "front_img";
            const currentCanvas = e.target || (e.native && e.native.target);
            if (currentCanvas && currentCanvas.id && currentCanvas.id !== expectedCanvasId) {
              return;
            }
            
            // 1. 手首 ドラッグ終了時の座標合わせ
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

            // 2. 指の付け根 ドラッグ終了時の座標合わせ
            if (index === 1 && datasetIndex <= 4) {
              const targetX = value.x;
              const targetY = value.y;

              if (datasetIndex === finger.fore) {
                const root_s = chart.data.datasets[roots].data[root_start];
                const first_webspace_e = chart.data.datasets[first_webspace].data[first_webspace_end];

                if (root_s) { root_s.x = targetX; root_s.y = targetY; }
                if (first_webspace_e) { first_webspace_e.x = targetX; first_webspace_e.y = targetY; }

              } else if (datasetIndex === finger.little) {
                const root_e = chart.data.datasets[roots].data[root_end];
                if (root_e) { root_e.x = targetX; root_e.y = targetY; }

              } else if (datasetIndex === finger.thumb) {
                const first_webspace_s = chart.data.datasets[first_webspace].data[first_webspace_start];
                if (first_webspace_s) { first_webspace_s.x = targetX; first_webspace_s.y = targetY; }
              }

              chart.update('none');
            }

            // 3. 付け根の線 (roots) ドラッグ終了時の座標合わせ
            if (datasetIndex === roots) {
              const targetX = value.x;
              const targetY = value.y;

              if (index === root_start) {
                const foreRoot = chart.data.datasets[finger.fore].data[1];
                const webEnd = chart.data.datasets[first_webspace].data[first_webspace_end];
                if (foreRoot) { foreRoot.x = targetX; foreRoot.y = targetY; }
                if (webEnd) { webEnd.x = targetX; webEnd.y = targetY; }
              } else if (index === root_end) {
                const littleRoot = chart.data.datasets[finger.little].data[1];
                if (littleRoot) { littleRoot.x = targetX; littleRoot.y = targetY; }
              }
              chart.update('none');
            }

            // 4. 第一指間腔の線 (first_webspace) ドラッグ終了時の座標合わせ
            if (datasetIndex === first_webspace) {
              const targetX = value.x;
              const targetY = value.y;

              if (index === first_webspace_start) {
                const thumbRoot = chart.data.datasets[finger.thumb].data[1];
                if (thumbRoot) { thumbRoot.x = targetX; thumbRoot.y = targetY; }
              } else if (index === first_webspace_end) {
                const foreRoot = chart.data.datasets[finger.fore].data[1];
                const rootStartP = chart.data.datasets[roots].data[root_start];
                if (foreRoot) { foreRoot.x = targetX; foreRoot.y = targetY; }
                if (rootStartP) { rootStartP.x = targetX; rootStartP.y = targetY; }
              }
              chart.update('none');
            }

            updateCoordList(chart);
            activeChart = null;
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

// チャートの外（pointerleave）に出たときに安全にドラッグを終了させる
[ctx1.canvas, ctx2.canvas].forEach(canvas => {
  canvas.addEventListener('pointerdown', (e) => {
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (err) {}
  });

  canvas.addEventListener('pointerleave', (e) => {
    try {
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}
  });

  canvas.addEventListener('pointerup', (e) => {
    try {
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}
  });
});

// イベントリスナー登録
side_up.addEventListener("change", () => {
  Fileupload(side_up, "side_img", side_chart);
});

front_up.addEventListener("change", () => {
  Fileupload(front_up, "front_img", front_chart);
});

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
    fore: { t_s: 38, s_f: 38, f_t: 38 },
    middle: { t_s: 38, s_f: 38, f_t: 38 },
    third: { t_s: 38, s_f: 38, f_t: 38 },
    little: { t_s: 28, s_f: 28, f_t: 28 },
    thumb: { s_f: 43, f_t: 43 }
  },
  root: { f_l: 100, t_f: 80, d_m: 145, d_t: 92 }
};

function getDist(p1, p2,p3,p4) {
  if (!p1 || !p2||!p3||!4) return 0;
  return Math.hypot(p1.x - p2.x, p1.y - p2.y, p3.x - p4.x );
}

const button_click_event = document.getElementById('feed_b');

//フィードバックボタン感知
if (button_click_event) {
  button_click_event.addEventListener('click', () => {
    if (typeof side_chart === 'undefined' || !side_chart.data) {
      console.error("グラフのインスタンスが見つかりません。");
      return;
    }

    const front_datasets = front_chart.data.datasets;
    const side_datasets = side_chart.data.datasets;

    const front_fore = front_datasets[0].data;
    const front_middle = front_datasets[1].data;
    const front_third = front_datasets[2].data;
    const front_little = front_datasets[3].data;
    const front_thumb = front_datasets[4].data;
    const frotn_rootData = front_datasets[5].data;
    const front_webspace = front_datasets[6].data;

    const side_fore = side_datasets[0].data;
    const side_middle = side_datasets[1].data;
    const side_third = side_datasets[2].data;
    const side_little = side_datasets[3].data;
    const side_thumb = side_datasets[4].data;
    const side_rootData = side_datasets[5].data;
    const side_webspace = side_datasets[6].data;


    const length = {
      fore: {
        third_second: getDist(front_fore[1], front_fore[2],side_fore[1],side_fore[2]),
        second_first: getDist(front_fore[2], front_fore[3],side_fore[2],side_fore[3]),
        first_tip: getDist(front_fore[3], front_fore[4],side_fore[3],side_fore[4])
      },
      middle: {
        third_second: getDist(front_middle[1], front_middle[2],side_middle[1],side_middle[2]),
        second_first: getDist(front_middle[2], front_middle[3],side_middle[2],side_middle[3]),
        first_tip: getDist(front_middle[3], front_middle[4],side_middle[3],side_middle[4])
      },
      third: {
        third_second: getDist(front_third[1], front_third[2],side_third[1],side_third[2]),
        second_first: getDist(front_third[2], front_third[3],side_third[2],side_third[3]),
        first_tip: getDist(front_third[3], front_third[4],side_third[3],side_third[4])
      },
      little: {
        third_second: getDist(front_little[1], front_little[2],side_little[1],side_little[2]),
        second_first: getDist(front_little[2], front_little[3],side_little[2],side_little[3]),
        first_tip: getDist(front_little[3], front_little[4],side_little[3],side_little[4])
      },
      thumb: {
        second_first: getDist(front_thumb[1], front_thumb[2],side_thumb[1],side_thumb[2]),
        first_tip: getDist(front_thumb[2], front_thumb[3],side_thumb[2],side_thumb[3])
      },
      root: {
        fore_little: getDist(front_fore[1], front_little[1],side_fore[1],side_little[1]),
        thumb_fore: getDist(front_webspace[0], front_webspace[1],side_webspace[0],side_webspace[1]),
        datum_middle: getDist(front_middle[0], front_middle[1],side_webspace[0],side_webspace[1]),
        datum_thumb: getDist(front_thumb[0], front_thumb[1],side_thumb[0],side_thumb[1])
      }
    };
    
    let d_part = length.root.fore_little;

    function getColl(len){
      return Math.round((len / d_part)*1000) / 10;
    }

    function getDiff(len, std){
      return Math.round((getColl(len) - std) * 10) / 10;
    }

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
        datum_middle: '手首～中指付け根',
        datum_thumb: '手首～親指付け根',
        thumb_fore: '親指～人差し指付け根',
        fore_little: '人差し指～小指付け根',
      }
    };

    const j_keys_lc = [
      ['third_second', 't_s'],
      ['second_first', 's_f'],
      ['first_tip',    'f_t']
    ];

    const make_t_l = (finger) => `
      <tr>
        <td>${t_name_l.finger[finger]}</td>
        <td class="empty"></td>
        <td class="empty"></td>
      </tr>
      ${j_keys_lc.map(([long, short]) => `
      <tr>
        <td>${t_name_l.joint[long]}</td>
        <td>${getDiff(length[finger][long], collect_length.joint[finger][short])}</td>
        <td>${collect_length.joint[finger][short]}</td>
      </tr>`).join('')}`;

    const table_l = document.querySelector('.coord_table_l');
    if (table_l) {
      table_l.innerHTML = ['fore', 'middle'].map(make_t_l).join('');
    }

    const make_t_c = (finger) => `
      <tr>
        <td>${t_name_c.finger[finger]}</td>
        <td class="empty"></td>
        <td class="empty"></td>
      </tr>
      ${j_keys_lc.map(([long, short]) => `
      <tr>
        <td>${t_name_c.joint[long]}</td>
        <td>${getDiff(length[finger][long], collect_length.joint[finger][short])}</td>
        <td>${collect_length.joint[finger][short]}</td>
      </tr>`).join('')}`;

    const table_c = document.querySelector('.coord_table_c');
    if (table_c) {
      table_c.innerHTML = ['third', 'little'].map(make_t_c).join('');
    }

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
          <td>${getDiff(length.thumb.second_first, collect_length.joint.thumb.s_f)}</td>
          <td>${collect_length.joint.thumb.s_f}</td>
        </tr>
        <tr>
          <td>${t_name_r.joint.first_tip}</td>
          <td>${getDiff(length.thumb.first_tip, collect_length.joint.thumb.f_t)}</td>
          <td>${collect_length.joint.thumb.f_t}</td>
        </tr>
        <tr>
          <td>その他</td>
          <td class="empty"></td>
          <td class="empty"></td>
        </tr>
        <tr>
          <td>${t_name_r.root.datum_middle}</td>
          <td>${getDiff(length.root.datum_middle, collect_length.root.d_m)}</td>
          <td>${collect_length.root.d_m}</td>
        </tr>
        <tr>
          <td>${t_name_r.root.datum_thumb}</td>
          <td>${getDiff(length.root.datum_thumb, collect_length.root.d_t)}</td>
          <td>${collect_length.root.d_t}</td>
        </tr>
        <tr>
          <td>${t_name_r.root.thumb_fore}</td>
          <td>${getDiff(length.root.thumb_fore, collect_length.root.t_f)}</td>
          <td>${collect_length.root.t_f}</td>
        </tr>
        <tr>
          <td>${t_name_r.root.fore_little}</td>
          <td>${getDiff(length.root.fore_little, collect_length.root.f_l)}</td>
          <td>${collect_length.root.f_l}</td>
        </tr>
      `);
    }
  });
}

///////3D手の部分 (座標合成・メッシュ描画)/////////////////////////////////////

const handCanvas1 = document.getElementById('handCanvas1');
const handCanvas2 = document.getElementById('handCanvas2');

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

[scene1, scene2].forEach(scene => {
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(100, 100, 100);
  scene.add(dirLight);
});

const control1 = new OrbitControls(camera1, renderer1.domElement);
const control2 = new OrbitControls(camera2, renderer2.domElement);
control1.enableDamping = false;
control2.enableDamping = false;

control1.target.set(0, 80, 0);
control2.target.set(0, 80, 0);

const handGroup1 = new THREE.Group();
const handGroup2 = new THREE.Group();
scene1.add(handGroup1);
scene2.add(handGroup2);

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

const connections = [
  { f: 0, p1: 0, p2: 1 }, { f: 0, p1: 1, p2: 2 }, { f: 0, p1: 2, p2: 3 }, { f: 0, p1: 3, p2: 4 },
  { f: 1, p1: 0, p2: 1 }, { f: 1, p1: 1, p2: 2 }, { f: 1, p1: 2, p2: 3 }, { f: 1, p1: 3, p2: 4 },
  { f: 2, p1: 0, p2: 1 }, { f: 2, p1: 1, p2: 2 }, { f: 2, p1: 2, p2: 3 }, { f: 2, p1: 3, p2: 4 },
  { f: 3, p1: 0, p2: 1 }, { f: 3, p1: 1, p2: 2 }, { f: 3, p1: 2, p2: 3 }, { f: 3, p1: 3, p2: 4 },
  { f: 4, p1: 0, p2: 1 }, { f: 4, p1: 1, p2: 2 }, { f: 4, p1: 2, p2: 3 }
];

function update3DHand() {
  while (handGroup1.children.length > 0) handGroup1.remove(handGroup1.children[0]);
  while (handGroup2.children.length > 0) handGroup2.remove(handGroup2.children[0]);

  const sideDatasets = side_chart.data.datasets;
  const frontDatasets = front_chart.data.datasets;

  const sphereGeo = new THREE.SphereGeometry(2.5, 16, 16);
  const sphereMat = new THREE.MeshLambertMaterial({ color: 0xff0055, wireframe: true });

  const joints3D_1 = [[], [], [], [], []];
  const joints3D_2 = [[], [], [], [], []];

  for (let f = 0; f < 5; f++) {
    const sidePoints = sideDatasets[f].data;
    const frontPoints = frontDatasets[f].data;

    for (let i = 0; i < sidePoints.length; i++) {
      const sP = sidePoints[i];
      const fP = frontPoints[i] || { x: 0, y: sP.y };

      const pos1 = new THREE.Vector3(sP.x, sP.y, fP.x);
      joints3D_1[f][i] = pos1;

      const sphere1 = new THREE.Mesh(sphereGeo, sphereMat);
      sphere1.position.copy(pos1);
      handGroup1.add(sphere1);

      const pos2 = new THREE.Vector3(sP.x, fP.y, fP.x);
      joints3D_2[f][i] = pos2;

      const sphere2 = new THREE.Mesh(sphereGeo, sphereMat);
      sphere2.position.copy(pos2);
      handGroup2.add(sphere2);
    }
  }

  connections.forEach(conn => {
    const p1_1 = joints3D_1[conn.f][conn.p1];
    const p2_1 = joints3D_1[conn.f][conn.p2];
    if (p1_1 && p2_1) {
      handGroup1.add(createBone(p1_1, p2_1));
    }

    const p1_2 = joints3D_2[conn.f][conn.p1];
    const p2_2 = joints3D_2[conn.f][conn.p2];
    if (p1_2 && p2_2) {
      handGroup2.add(createBone(p1_2, p2_2));
    }
  });

  const palmConnections = [
    { f1: 0, p1: 1, f2: 1, p2: 1 },
    { f1: 1, p1: 1, f2: 2, p2: 1 },
    { f1: 2, p1: 1, f2: 3, p2: 1 }
  ];

  palmConnections.forEach(conn => {
    const p1_1 = joints3D_1[conn.f1][conn.p1];
    const p2_1 = joints3D_1[conn.f2][conn.p2];
    if (p1_1 && p2_1) {
      handGroup1.add(createBone(p1_1, p2_1));
    }

    const p1_2 = joints3D_2[conn.f1][conn.p1];
    const p2_2 = joints3D_2[conn.f2][conn.p2];
    if (p1_2 && p2_2) {
      handGroup2.add(createBone(p1_2, p2_2));
    }
  });
}

[side_chart, front_chart].forEach(chart => {
  const configOnDragEnd = chart.options.plugins.dragData.onDragEnd;
  chart.options.plugins.dragData.onDragEnd = function (e, datasetIndex, index, value) {
    if (configOnDragEnd) configOnDragEnd(e, datasetIndex, index, value);
    update3DHand();
  };
});

update3DHand();

function animate() {
  requestAnimationFrame(animate);
  control1.update();
  control2.update();

  renderer1.render(scene1, camera1);
  renderer2.render(scene2, camera2);
}

animate();

const Overlay = document.getElementById("select_model_c");
document.getElementById("select_b").addEventListener("click",() =>{
  Overlay.classList.remove("hidden");
});

document.getElementById("closebutton").addEventListener("click",()=>{
  Overlay.classList.add("hidden");
});

// ==========================================
// 左右反転ボタンの処理
// ==========================================
const sideRevBtn = document.getElementById("side_rev");
const frontRevBtn = document.getElementById("front_rev");

function reverseChartX(chart) {
  if (!chart || !chart.data) return;

  chart.data.datasets.forEach(dataset => {
    dataset.data.forEach(p => {
      p.x = -p.x;
    });
  });

  chart.update();
  update3DHand();
}

if (sideRevBtn) {
  sideRevBtn.addEventListener("click", () => {
    reverseChartX(side_chart);
  });
}

if (frontRevBtn) {
  frontRevBtn.addEventListener("click", () => {
    reverseChartX(front_chart);
  });
}
