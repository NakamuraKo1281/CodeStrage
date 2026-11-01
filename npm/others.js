// タブの切り替え処理（適当なサイトからコピペしてきた）
$(function() {
    $('#tab_bs .btn:first-of-type a').addClass("is-active"); //最初のbtnのaにis-activeクラスを追加
    $('#tab_cont .tab_item:first-of-type').addClass("is-active"); //最初の.tab-contents-itemにis-activeクラスを追加
    $('#tab_bs a').click(function(){// #tab-btn内のaをクリックした時、
        $('#tab_bs a').removeClass("is-active");//もともとついているis-activeクラスを取り除き
        $(this).addClass("is-active");//表示させたいエリアのタブリンク名をクリックしたら、押したボタンにis-activeクラスを追加 
        $('#tab_cont .tab_item').removeClass("is-active");//もともとついているis-activeクラスを取り除き、
        $($(this).attr('data-tab')).addClass("is-active")// クリックされたaのdate属性にあたるdivを表示し、
        return false;// これらの動作を繰り返さずに、終了させる。
    });
});





// モーダルウィンドウ表示・非表示の処理
const selectModal = document.getElementById("select_model_c");
const selectBtn = document.getElementById("select_b");
const closeBtn = document.getElementById("closebutton");

// モデル選択画面を開く
if (selectBtn && selectModal) {
  selectBtn.addEventListener("click", () => {
    selectModal.showModal(); // ★ showModal() を使用
  });
}

// 閉じるボタンで閉じる
if (closeBtn && selectModal) {
  closeBtn.addEventListener("click", () => {
    selectModal.close(); // ★ close() を使用
  });
}

// （オプション）背景（ダイアログの外側の余白部分）をクリックしたときに閉じる
if (selectModal) {
  selectModal.addEventListener("click", (event) => {
    const rect = selectModal.getBoundingClientRect();
    const isInDialog = 
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;
    
    if (!isInDialog) {
      selectModal.close();
    }
  });
}


// ==========================================
// モデル選択画面のインタラクション処理
// ==========================================
const modelPairs = document.querySelectorAll(".model-pair");
const applySelectBtn = document.getElementById("apply_select_b");
const currentSelectedPairDiv = document.getElementById("current_selected_pair");

let selectedPairElement = null; // 現在選択されているペアを保持

// 1. ペアをクリックしたときの処理（選択状態の切り替え & 背景を青色に）
modelPairs.item ? modelPairs.forEach(pair => { // 念のためNodeListのループ
  pair.addEventListener("click", () => {
    // 既存の選択をすべて解除
    modelPairs.forEach(p => p.classList.remove("selected"));
    
    // クリックされたペアに選択クラス（青色）を付与
    pair.classList.add("selected");
    selectedPairElement = pair;
  });
}) : null;

// 2. 「選択」ボタンを押したときの処理
if (applySelectBtn) {
  applySelectBtn.addEventListener("click", () => {
    if (!selectedPairElement) {
      alert("モデルのペアが選択されていません。");
      return;
    }

    // 選択されたペアの中にある2つの画像を取得
    const imgs = selectedPairElement.querySelectorAll(".model-item");
    if (imgs.length < 2) return;

    const sideSrc = imgs[0].src;
    const frontSrc = imgs[1].src;

    // A. チャートの上部（#current_selected_pair）に選択したペアを表示する
    currentSelectedPairDiv.innerHTML = `
      <img src="${sideSrc}" alt="側面モデル">
      <img src="${frontSrc}" alt="正面モデル">
    `;

    // B. チャートの背景画像（bgImages）に反映して再描画する
    const sideImgObj = new Image();
    sideImgObj.src = sideSrc;
    sideImgObj.onload = () => {
      bgImages["side_img"] = sideImgObj;
      if (typeof side_chart !== "undefined") side_chart.update();
    };

    const frontImgObj = new Image();
    frontImgObj.src = frontSrc;
    frontImgObj.onload = () => {
      bgImages["front_img"] = frontImgObj;
      if (typeof front_chart !== "undefined") front_chart.update();
    };

    // C. 3D手表示なども連動させる場合
    if (typeof update3DHand === "function") {
      update3DHand();
    }

    // D. モーダルを閉じる
    if (selectModal) {
      selectModal.close();
    }
  });
}