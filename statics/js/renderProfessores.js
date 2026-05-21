// statics/js/componentes/renderProfessores.js

import { professores } from '../dados/professores.js';
import { detalhesProfessores } from '../dados/detalhesProfessores.js';

document.addEventListener('DOMContentLoaded', () => {
  const containerCards = document.querySelector('.entrevistas-container');
  const secaoDetalhes = document.getElementById('informacoes-detalhadas');

  if (containerCards) {
    containerCards.innerHTML = professores.map(prof => `
      <div class="card">
        <div class="card-image-container">
          <img src="${prof.imagem}" alt="Professor ${prof.nome}" class="card-image" loading="lazy">
        </div>
        <div class="card-content">
          <h3 class="card-title">${prof.nome}</h3>
          <p class="card-text">${prof.descricao}</p>
          <button class="saiba-mais btn-detalhes" data-id="${prof.id}">Saiba +</button>
        </div>
      </div>
    `).join('');
  }

  document.addEventListener('click', (event) => {
    
    if (event.target.classList.contains('btn-detalhes')) {
      event.preventDefault();

      const professorId = event.target.getAttribute('data-id');
      const dadosEntrevista = detalhesProfessores[professorId];

      if (dadosEntrevista && secaoDetalhes) {
        const temPDF = dadosEntrevista.pdf !== undefined && dadosEntrevista.pdf !== null && dadosEntrevista.pdf !== "";

        const htmlDosParagrafos = dadosEntrevista.paragrafos.map(texto => `
          <p>${texto}</p>
        `).join('');

        secaoDetalhes.innerHTML = `
            <div class="info-container">
              <h2 class="info-title">${dadosEntrevista.titulo}</h2>
              <div class="info-content">
                <div class="info-bio">
                  <img src="${dadosEntrevista.imagemCapa}" alt="${dadosEntrevista.imagemAlt ?? 'Foto do Professor'}" class="info-image">
                  ${htmlDosParagrafos}
                </div>
                <div class="botoes-navegacao">
                  ${temPDF ? `<button id="abrir-info" class="botao-voltar" data-pdf="${dadosEntrevista.pdf}">Abrir Entrevista</button>` : ``}
                  <button id="fechar-info" class="botao-fechar">Fechar</button>
                </div>
              </div>
            </div>
          `;

        secaoDetalhes.style.display = 'block';
        secaoDetalhes.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    if (event.target.id === 'abrir-info') {
      const pdfPath = event.target.getAttribute('data-pdf');

      if (!pdfPath) {
        alert('Este conteúdo ainda não possui um documento disponível.');
        return;
      }

      let modal = document.getElementById('pdf-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pdf-modal';
        
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        modal.style.zIndex = '999999';
        modal.style.display = 'none';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        modal.innerHTML = `
          <div id="pdf-container" style="width: 85%; height: 90%; background: #ffffff; border-radius: 8px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
            
            <!-- Barra superior fixa para controle -->
            <div style="width: 100%; height: 50px; background-color: #f8f9fa; border-bottom: 1px solid #e9ecef; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; box-sizing: border-box;">
              <span style="font-weight: bold; color: #333333; font-family: sans-serif; font-size: 14px;">Visualizador de Documento</span>
              <button id="fechar-pdf" style="background-color: #dc3545; color: white; border: none; padding: 6px 14px; font-size: 14px; font-weight: bold; border-radius: 4px; cursor: pointer; transition: background 0.2s;">
                ✖ Fechar
              </button>
            </div>

            <!-- Área exclusiva para a renderização das páginas via Canvas -->
            <div id="pdf-html-container" style="width: 100%; flex: 1; background: #666666; overflow: auto;"></div>
            
          </div>
        `;
        document.body.appendChild(modal);

        const btnFechar = document.getElementById('fechar-pdf');
        btnFechar.onmouseover = () => btnFechar.style.backgroundColor = '#bd2130';
        btnFechar.onmouseout = () => btnFechar.style.backgroundColor = '#dc3545';

        btnFechar.addEventListener('click', () => {
          modal.style.display = 'none';
          document.getElementById('pdf-html-container').innerHTML = '';
        });
      }

      const htmlContainer = document.getElementById('pdf-html-container');
      
      htmlContainer.innerHTML = '<div style="color: white; text-align: center; padding: 40px; font-family: sans-serif; font-size: 16px;">Carregando e processando documento de forma segura...</div>';
      modal.style.display = 'flex';

      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

      pdfjsLib.getDocument(pdfPath).promise.then(pdf => {
        htmlContainer.innerHTML = `
          <div id="pdf-canvas-wrapper" style="width:100%; height:100%; overflow-y:auto; padding:20px; box-sizing:border-box; background:#666; -webkit-user-select:none; user-select:none;"></div>
        `;
        const wrapper = document.getElementById('pdf-canvas-wrapper');

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          pdf.getPage(pageNum).then(page => {
            const canvas = document.createElement('canvas');
            canvas.style.display = 'block';
            canvas.style.margin = '0 auto 20px auto';
            canvas.style.maxWidth = '100%';
            canvas.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            canvas.style.borderRadius = '4px';
            
            canvas.style.pointerEvents = 'none'; 
            
            canvas.addEventListener('contextmenu', e => e.preventDefault());

            wrapper.appendChild(canvas);

            const context = canvas.getContext('2d');
            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            page.render({ canvasContext: context, viewport: viewport });
          });
        }
      }).catch(err => {
        htmlContainer.innerHTML = '<div style="color: #ff8888; text-align: center; padding: 40px; font-family: sans-serif;">Não foi possível carregar este documento. Certifique-se de que o arquivo existe na pasta indicada.</div>';
        console.error('Erro no processamento do PDF.js:', err);
      });
    }

    if (event.target.id === 'fechar-info' || event.target.id === 'voltar-info') {
      if (secaoDetalhes) {
        secaoDetalhes.style.display = 'none';
        if (containerCards) {
          containerCards.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  });
});