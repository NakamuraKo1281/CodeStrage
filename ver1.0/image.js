(window.onload = function () {
})();

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

function Fileupload(hand_up, canvas_id) {
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
    const img = document.getElementById(canvas_id);
    img.src = e.target.result;
    img.style.display = 'block';
    img.style.backgroundImage = `url("${e.target.result}")`;
  };
  reader.readAsDataURL(file);
}

side_up.addEventListener("change", () => {
  Fileupload(side_up, "side_img");
});

front_up.addEventListener("change", () => {
  Fileupload(front_up, "front_img");
});

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

// 設定生成用の関数を用意して参照を分離
function createChartConfig() {
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
            { x: 45, y: 110 },
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
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          min: -100,
          max: 100,
          ticks: { stepSize: 10 },
          title: { display: true, text: 'X 軸 (単位)' }
        },
        y: {
          min: 0,
          max: 200,
          title: { display: true, text: 'Y 軸 (単位)' },
          ticks: { stepSize: 10 }
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
            e.target.style.cursor = 'grabbing';
          },

          onDrag: function (e, datasetIndex, index, value) {
            if (!e || !e.chart) return;

            const chart = e.chart;
            const dx = value.x - dragStartX;
            const dy = value.y - dragStartY;

            // 1. 手首 (index === 0) ドラッグ時の連動処理
            if (index === datum && datasetIndex <= 4) {
              const wristIndices = [finger.fore, finger.middle, finger.third, finger.little, finger.thumb];
                            chart.update('none');
              // 操作中の datasetIndex 以外の「手首の点」に移動量の差分 (dx, dy) を足して追従させる
              wristIndices.forEach((fIdx) => {
                if (fIdx !== datasetIndex) {
                  const p = chart.data.datasets[fIdx].data[datum];
                  if (p) {
                    p.x += dx;
                    p.y += dy;
                                  chart.update('none');
                  }
                }
                              chart.update('none');
              });

              dragStartX = value.x;
              dragStartY = value.y;
              chart.update('none');
              return;
            }

            // 2. 指の付け根ドラッグ時の連動処理
            if (index === root) {
              if (datasetIndex === finger.fore) {
                const root_s = chart.data.datasets[roots].data[root_start];
                const first_webspace_e = chart.data.datasets[first_webspace].data[first_webspace_end];

                root_s.x += dx;
                root_s.y += dy;
                first_webspace_e.x += dx;
                first_webspace_e.y += dy;

              } else if (datasetIndex === finger.little) {
                const root_e = chart.data.datasets[roots].data[root_end];
                root_e.x += dx;
                root_e.y += dy;

              } else if (datasetIndex === finger.thumb) {
                const first_webspace_s = chart.data.datasets[first_webspace].data[first_webspace_start];
                first_webspace_s.x += dx;
                first_webspace_s.y += dy;
              }

              dragStartX = value.x;
              dragStartY = value.y;
              chart.update('none');
            }
          },

          onDragEnd: function (e, datasetIndex, index, value) {
            e.target.style.cursor = 'default';

            if (e && e.chart) {
              // 手首ドラッグ終了時、わずかなズレを防ぐため全手首の座標を完全一致させる
              if (index === datum && datasetIndex <= 4) {
                const targetX = value.x;
                const targetY = value.y;
                [finger.fore, finger.middle, finger.third, finger.little, finger.thumb].forEach((fIdx) => {
                  chart.data.datasets[fIdx].data[datum].x = targetX;
                  chart.data.datasets[fIdx].data[datum].y = targetY;
                });
                e.chart.update();
              }
              updateCoordList(e.chart);
            }
          },

          onHover: function (e) {
            e.target.style.cursor = 'grab';
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `(${context.raw.x}, ${context.raw.y})`;
            }
          }
        }
      }
    }
  };
}

// グラフインスタンス作成
const side_chart = new Chart(ctx1, createChartConfig());
const front_chart = new Chart(ctx2, createChartConfig());

const BUTTON_CLICK_EVENT = document.getElementById('feed_b');
if (BUTTON_CLICK_EVENT) {
  BUTTON_CLICK_EVENT.addEventListener('click', () => {
    alert("ボタンがクリックされました");
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
    { name: '人差し指', points: coord.fore },
    { name: '中指', points: coord.middle },
    { name: '薬指', points: coord.third },
    { name: '小指', points: coord.little },
    { name: '親指', points: coord.thumb }
  ];

  fingers.forEach(fingerItem => {
    fingerItem.points.forEach((point, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${fingerItem.name}</td>
        <td>P${index}</td>
        <td>${point.x}</td>
        <td>${point.y}</td>
      `;
      table_body.appendChild(row);
    });
  });
}
