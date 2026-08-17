const ctx = document.getElementById('myDraggableScatterChart').getContext('2d');

const config = {
  type: 'scatter',
  data: {
    datasets: [{
      label: '実験データ点',
      data: [
        { x: 10, y: 20 },
        { x: 15, y: 35 },
        { x: 20, y: 10 },
        { x: 25, y: 50 },
        { x: 30, y: 30 },
        { x: 35, y: 45 }
      ],
      backgroundColor: 'rgba(255, 99, 132, 0.7)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      pointRadius: 8,
      pointHoverRadius: 12,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        min: 0,
        max: 50,
        title: { display: true, text: 'X 軸 (単位)' }
      },
      y: {
        min: 0,
        max: 60,
        title: { display: true, text: 'Y 軸 (単位)' }
      }
    },
    plugins: {
      dragData: {
        round: 1,      // 移動後の値を小数点第1位に丸める
        dragX: true,   // 横方向（X軸）の移動を有効化
        dragY: true,   // 縦方向（Y軸）の移動を有効化
        showTooltip: true,

        onDragStart: function (e, datasetIndex, index, value) {
          e.target.style.cursor = 'grabbing';
        },
        onDrag: function (e, datasetIndex, index, value) {
          // ドラッグ中のリアルタイム処理が必要な場合はここに記述
        },
        onDragEnd: function (e, datasetIndex, index, value) {
          e.target.style.cursor = 'default';
          console.log('ドラッグ終了 - 新しい位置:', value);
        },
        onHover: function (e) {
          e.target.style.cursor = 'grab';
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `(${context.raw.x}, ${context.raw.y})`;
          }
        }
      }
    }
  }
};

const myChart = new Chart(ctx, config);