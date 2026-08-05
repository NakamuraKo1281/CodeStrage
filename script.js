document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];

    // ファイルが選択されていない場合
    if (!file) {
        document.getElementById('previewImage').style.display = 'none';
        return;
    }

    // 画像ファイルかどうかをチェック
    if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください。');
        event.target.value = ''; // 選択をリセット
        document.getElementById('previewImage').style.display = 'none';
        return;
    }

    // FileReaderで画像を読み込み
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById('previewImage');
        img.src = e.target.result;
        img.style.display = 'block';
    };
    reader.readAsDataURL(file);
});
