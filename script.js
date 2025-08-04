const bar = document.getElementById('bar');
const close = document.getElementById('close');
const nav = document.getElementById('navbar');

if (bar) {
    bar.addEventListener('click', () => {
        nav.classList.add('active');
    })   
}

if (close) {
    close.addEventListener('click', () => {
        nav.classList.remove('active');
    })   
}

function searchProduct() {
  const input = document.getElementById("searchInput").value.trim();
  if (input !== "") {
    // Redirect to product page with search query
    window.location.href = `product.html?search=${encodeURIComponent(input)}`;
  }
}
