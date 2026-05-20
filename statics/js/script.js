import { detalhesInfo } from './detalhesInfo.js'

// Espera o carregamento completo do DOM antes de executar
document.addEventListener('DOMContentLoaded', function () {

  const secaoInformacoes = document.getElementById('informacoes-detalhadas')
  const historicoInfo = []
  let idAtual = null

  if (secaoInformacoes) {
    console.log('Seção de informações detalhadas encontrada');

    // Função global para mostrar informações detalhadas 
    window.mostrarInformacoes = function (infoId, detalhesInfo, ehVoltar = false) {
      if (!detalhesInfo[infoId]) return
      else if (!ehVoltar && idAtual && idAtual !== infoId) {
        historicoInfo.push(idAtual)
      }
      // Atualiza o ID atual
      idAtual = infoId;
      // Dentro do seu mostrarInformacoes:
      const temPDF = detalhesInfo[infoId].pdf !== undefined && detalhesInfo[infoId].pdf !== null


      // Insere o conteúdo detalhado na seção HTML dinamicamente
      secaoInformacoes.innerHTML = `
            <div class="info-container">
              <h2 class="info-title">${detalhesInfo[infoId].titulo}</h2>
              <div class="info-content">
                <div class="info-bio">
                  ${detalhesInfo[infoId].conteudo}
                </div>
                <div class="botoes-navegacao">
                ${temPDF ? 
                  `<button id="abrir-info" class="botao-voltar">Abrir Entrevista</button>` : ``}
                  <button id="voltar-info" class="botao-voltar">Voltar</button>
                  <button id="fechar-info" class="botao-fechar">Fechar</button>
                </div>
              </div>
            </div>
          `

      secaoInformacoes.style.display = 'block'
      secaoInformacoes.scrollIntoView({ behavior: 'smooth' });

      const botaoAbrir = document.getElementById('abrir-info');
      if (botaoAbrir) {
        botaoAbrir.addEventListener('click', function () {
          const pdfUrl = `${window.location.origin}/site-memoria/${detalhesInfo[infoId].pdf}`;

          if (!pdfUrl) {
            alert('Este conteúdo ainda não possui um PDF disponível.');
            return;
          }

          let modal = document.getElementById('pdf-modal');
          if (!modal) {
            modal = document.createElement('div');
            modal.id = 'pdf-modal';
            modal.innerHTML = `
        <div id="pdf-container">
          <button id="fechar-pdf">✖ Fechar</button>
          <div id="pdf-html-container" style="width:100%; height:100%; overflow:auto;"></div>
        </div>
      `;
            document.body.appendChild(modal);

            document.getElementById('fechar-pdf').addEventListener('click', () => {
              modal.style.display = 'none';
              document.getElementById('pdf-viewer').src = '';
            });
          }

          const htmlContainer = document.getElementById('pdf-html-container');

          fetch(pdfUrl)
            .then(res => res.text())
            .then(html => {
              htmlContainer.innerHTML = html;
              const pageContainer = htmlContainer.querySelector('#page-container');
              if (pageContainer) {
                pageContainer.style.background = '#c8c8c8ff';
                pageContainer.style.backgroundImage = 'none';
              }
              modal.style.display = 'flex';
            })
            .catch(err => {
              alert('Não foi possível carregar o conteúdo.');
              console.error(err);
            });

        });
      }

      // Para cada link com 'saiba-mais' dentro da seção, adiciona evento de clique para mostrar mais detalhes
      const novosLinks = secaoInformacoes.querySelectorAll('.saiba-mais');
      novosLinks.forEach(link => {
        link.addEventListener('click', function (e) {
          e.preventDefault()
          const novoId = this.getAttribute('data-id')
          if (detalhesInfo[novoId]) {
            console.log('Detalhes encontrados para o ID:', detalhesInfo[novoId]);
            window.mostrarInformacoes(novoId, detalhesInfo);
          } else {
            console.warn('Nenhum detalhe encontrado para o ID:', novoId);
          }
        });
      });

      // Botão Fechar para esconder a seção
      const botaoFechar = document.getElementById('fechar-info');
      if (botaoFechar) {
        botaoFechar.addEventListener('click', function () {
          secaoInformacoes.style.display = 'none'
        });
      }

      // Botão Voltar para retornar à última informação mostrada no histórico
      const botaoVoltar = document.getElementById('voltar-info');
      if (botaoVoltar) {
        botaoVoltar.addEventListener('click', function () {
          const idAnterior = historicoInfo.pop()

          if (idAnterior && detalhesInfo[idAnterior]) {
            window.mostrarInformacoes(idAnterior, detalhesInfo, true);
          } else {
            secaoInformacoes.style.display = 'none'
            idAtual = null
          }
        });
      }
    };

    // Ativa os links "Saiba mais" iniciais da página para que disparem mostrarInformacoes ao clicá-los
    const saibaMaisLinks = document.querySelectorAll('.saiba-mais')
    saibaMaisLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const infoId = this.getAttribute('data-id')
        if (detalhesInfo[infoId]) {
          window.mostrarInformacoes(infoId, detalhesInfo)
        }
      });
    });
  }

  const saibaMaisLinks = document.querySelectorAll('.saiba-mais')

  saibaMaisLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      if (!this.getAttribute('target')) {
        e.preventDefault();

        let infoId = this.getAttribute('data-id')

        if (infoId === 'entrevistas') {
          window.location.href = 'templates individuais/entrevistas.html'
          return;
        }

        if (infoId === 'aeronaves') {
          window.location.href = 'templates individuais/aeronaves.html'
          return;
        }

        if (infoId === 'entrevistas-alunos') {
          window.location.href = 'templates individuais/entrevistas-alunos.html'
          return;
        }

        if (!infoId) {
          const cardElement = this.closest('.card')
          const cardTitle = cardElement.querySelector('.card-title').textContent.trim()

          if (cardTitle.includes('EMB- 120')) {
            infoId = 'emb-120'
          } else if (cardTitle.includes('Guri na Fatec')) {
            infoId = 'guri'
          } else if (cardTitle.includes('Catálogos dos Laboratórios')) {
            infoId = 'laboratorios'
          }
        }

        if (infoId && detalhesInfo[infoId]) {
          window.mostrarInformacoes(infoId, detalhesInfo);
        } else {
          console.log('Informações para o ID:', infoId, 'não encontradas')
          alert('Informações não disponíveis no momento. Em breve teremos mais conteúdo!')
        }
      }
    })
  })
})
