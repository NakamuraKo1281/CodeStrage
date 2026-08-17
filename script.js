/**
 * 画像選択時にプレビュー表示を行うイベント設定関数
 * @param {string} inputId - fileタイプのinput要素のID
 * @param {string} imgId - プレビュー表示用img要素のID
 */
function setupImagePreview(inputId, imgId) {
    const inputElement = document.getElementById(inputId);
    const imgElement = document.getElementById(imgId);

    if (!inputElement || !imgElement) return;

    inputElement.addEventListener('change', function(event) {
        const file = event.target.files[0];

        // ファイルが選択されていない場合
        if (!file) {
            imgElement.style.display = 'none';
            imgElement.src = '';
            return;
        }

        // 画像ファイルかどうかをチェック
        if (!file.type.startsWith('image/')) {
            alert('画像ファイルを選択してください。');
            event.target.value = ''; // 選択をリセット
            imgElement.style.display = 'none';
            imgElement.src = '';
            return;
        }

        // FileReaderで画像を読み込み
        const reader = new FileReader();
        reader.onload = function(e) {
            imgElement.src = e.target.result;
            imgElement.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}

// 側面（左）と正面（右）それぞれに対して適用
setupImagePreview('side_upload', 'side_img');
setupImagePreview('front_upload', 'front_img');