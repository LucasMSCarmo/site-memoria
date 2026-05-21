import { carrossel } from '../dados/carrossel.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById("carousel-container");
  const indicators = document.getElementById("carousel-indicators");

  if (container && indicators) {
    indicators.innerHTML = carrossel.map((item, index) => `
      <li
        data-target="#myCarousel"
        data-slide-to="${index}"
        class="${index === 0 ? 'active' : ''}"
        style="border: solid 1px var(--primary-color);"
      ></li>
    `).join('');

    container.innerHTML = carrossel.map((item, index) => `
      <div class="item ${index === 0 ? 'active' : ''}">
        <article class="card card-carousel">
          <div class="card-image-container imagem-carrosel">
            <img
              src="${item.imagem}"
              alt="${item.imagem_alt}"
              class="card-image"
              loading="lazy"
            >
          </div>
          <div class="card-content">
            <h3 class="card-title">${item.titulo}</h3>
            <p class="card-text">${item.descricao}</p>
            ${item.link ? `<a href="templates/${item.link}" class="saiba-mais">Saiba +</a>` : `<a href="#" class="saiba-mais" data-id="${item.id}">Saiba +</a>`}
          </div>
        </article>
      </div>
    `).join('');
  }
});