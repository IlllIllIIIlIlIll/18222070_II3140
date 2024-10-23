// Fungsi untuk mengizinkan drop
function allowDrop(event) {
    event.preventDefault();
}

// Fungsi untuk memulai drag
function drag(event) {
    event.dataTransfer.setData("text", event.target.parentNode.id); // Mengambil ID div parent
}

// Fungsi untuk menangani drop
function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    event.target.appendChild(draggedElement);
    
    // Menambahkan logika tambahan (misalnya validasi atau feedback)
    alert(draggedElement.textContent + " dipindahkan ke " + event.target.textContent);
}