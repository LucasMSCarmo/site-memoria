import { conteudo } from '../dados/conteudo.js';

document.addEventListener('DOMContentLoaded', () => {
  const secaoDetalhes = document.getElementById('informacoes-detalhadas');

  let pilhaHistorico = [];
  let idAtual = null;

  document.addEventListener('click', (event) => {
    const linkAlvo = event.target.classList.contains('saiba-mais') ? event.target : event.target.closest('.saiba-mais');

    if (linkAlvo) {
      const href = linkAlvo.getAttribute('href');

      if (href && href !== '#') {
        return;
      }

      event.preventDefault();
      const proximoId = linkAlvo.getAttribute('data-id');

      if (idAtual && idAtual !== proximoId) {
        pilhaHistorico.push(idAtual);
      }

      idAtual = proximoId;
      renderizarTela(proximoId);
    }

    if (event.target.id === 'voltar-info') {
      if (pilhaHistorico.length > 0) {
        const idAnterior = pilhaHistorico.pop();
        idAtual = idAnterior;
        renderizarTela(idAnterior);
      } else {
        fecharSecao();
      }
    }

    if (event.target.id === 'fechar-info') {
      fecharSecao();
    }
  });

  function renderizarTela(infoId) {
    const dados = conteudo[infoId];

    if (!dados || !secaoDetalhes) return;

    if (dados.tipo === 'grid') {
      const htmlDosCards = dados.cards.map(idDoCard => {
        const dadosDoSubCard = conteudo[idDoCard];

        if (!dadosDoSubCard) {
          console.warn(`Aviso: O ID '${idDoCard}' foi listado no grid, mas não existe no arquivo de dados.`);
          return '';
        }

        const urlVideo = dadosDoSubCard.videoCard ?? dadosDoSubCard.video ?? "";
        const urlImagem = dadosDoSubCard.imagemCard ?? dadosDoSubCard.imagemCapa ?? "";

        const temVideo = urlVideo !== "";
        const temImagem = urlImagem !== "";

        const htmlDoVideo = temVideo ? `
          <div class="video-container" style="margin-top: 20px; text-align: center;">
            <video src="${dadosDoSubCard.video}" controls style="max-width: 100%; max-height: 450px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);"></video>
          </div>
        ` : '';

        const htmlDaImagem = temImagem && !temVideo ? `
          <img src="${urlImagem}" alt="${dadosDoSubCard.tituloCard ?? 'Imagem'}" class="card-image" loading="lazy">
        ` : '';

        return `
          <article class="card">
            <div class="card-image-container">
              ${htmlDaImagem}
              ${htmlDoVideo}
            </div>
            <div class="card-content">
              <h3 class="card-title">${dadosDoSubCard.tituloCard ?? dadosDoSubCard.titulo}</h3>
              <p class="card-text">${dadosDoSubCard.descricao ?? ''}</p>
              <a href="#" class="saiba-mais" data-id="${idDoCard}">Saiba +</a>
            </div>
          </article>
        `;
      }).join('');

      secaoDetalhes.innerHTML = `
        <div class="info-container">
          <h2 class="info-title" style="margin-bottom: 25px;">${dados.titulo}</h2>
          <div class="card-container">
            ${htmlDosCards}
          </div>
          <div class="botoes-navegacao" style="margin-top: 30px; text-align: center;">
            <button id="voltar-info" class="botao-voltar">Voltar</button>
            <button id="fechar-info" class="botao-fechar">Fechar</button>
          </div>
        </div>
      `;
    }

    else if (dados.tipo === 'conteudo') {
      const urlVideo = dados.video ?? dados.videoCard ?? "";
      const urlImagem = dados.imagemCapa ?? dados.imagemCard ?? "";

      const temVideo = urlVideo !== "";
      const temImagem = urlImagem !== "";

      const htmlDosParagrafos = dados.paragrafos ? dados.paragrafos.map(texto => `<p>${texto}</p>`).join('') : '';

      const htmlDosLinks = dados.links ? dados.links.map(link => `<a href="${link.url}" target="_blank">${link.nome}</a>`).join('<br>') : '';

      const htmlDoVideo = temVideo ? `
        <div class="video-container" style="margin-top: 20px; text-align: center;">
          <video src="${urlVideo}" controls style="max-width: 100%; max-height: 450px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);"></video>
        </div>
      ` : '';

      let htmlDaImagem = temImagem ? `<img src="${urlImagem}" alt="${dados.imagemAlt ?? 'Imagem'}" class="info-image">` : '';

      if (infoId === 'linha-do-tempo-fatec-20-anos') {
        htmlDaImagem = temImagem ? `<img src="${urlImagem}" alt="${dados.imagemAlt ?? 'Imagem'}" class="info-image" style="max-width: 100%; height: auto;">` : '';
      }

      secaoDetalhes.innerHTML = `
        <div class="info-container">
          <h2 class="info-title">${dados.titulo}</h2>
          <div class="info-content">
            <div class="info-bio">
              ${htmlDaImagem}
              ${htmlDosParagrafos}
              ${htmlDoVideo}
              ${htmlDosLinks}
            </div>
            <div class="botoes-navegacao">
              <button id="voltar-info" class="botao-voltar">Voltar</button>
              <button id="fechar-info" class="botao-fechar">Fechar</button>
            </div>
          </div>
        </div>
      `;
    }

    secaoDetalhes.style.display = 'block';
    secaoDetalhes.setAttribute('style', 'display: block !important;');
    secaoDetalhes.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function fecharSecao() {
    if (secaoDetalhes) {
      const videoElement = secaoDetalhes.querySelector('video');
      if (videoElement) videoElement.pause();
      secaoDetalhes.style.display = 'none';
      secaoDetalhes.setAttribute('style', 'display: none !important;');
      secaoDetalhes.innerHTML = '';
      historicoId = null;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
});