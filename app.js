// ============================================================
// CONECTADOS — app.js
// Lógica compartilhada entre sucesso.html e painel.html
// ============================================================

// ---- MISSÕES -----------------------------------------------
const MISSOES = {
  1: "Escolha seu hino predileto e cante com a igreja a primeira estrofe.",
  2: "Encontre uma pessoa na rua e dê de presente esse livro!",
  3: "Pinte o rosto da sua professora!",
  4: "Escolha alguém para ir com você orar com algum vizinho da igreja.",
  5: "Escolha um amigo e pinte o rosto dele!"
};

// ---- HELPERS -----------------------------------------------
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function getTimestamp() {
  const now = new Date();
  return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ---- PÁGINA SUCESSO ----------------------------------------
function initSucesso() {
  const missaoNum = parseInt(getParam('missao')) || 1;
  const texto = MISSOES[missaoNum] || MISSOES[1];

  // Injeta a missão
  const elMissao = document.getElementById('missao-texto');
  if (elMissao) elMissao.textContent = texto;

  const elNum = document.getElementById('missao-num');
  if (elNum) elNum.textContent = `MISSÃO #${missaoNum}`;

  // Botão transmitir
  const form = document.getElementById('form-transmitir');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const nome = document.getElementById('nome-input').value.trim();
      if (!nome) {
        alert('Identifique-se antes de transmitir!');
        return;
      }

      const btnTransmitir = document.getElementById('btn-transmitir');
      btnTransmitir.textContent = 'TRANSMITINDO...';
      btnTransmitir.disabled = true;

      const ref = db.ref('conexoes').push();
      ref.set({
        nome: nome,
        missao: missaoNum,
        textoMissao: texto,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      })
      .then(() => {
        document.getElementById('status-enviado').style.display = 'block';
        btnTransmitir.textContent = '✓ TRANSMITIDO';
        document.getElementById('nome-input').disabled = true;
      })
      .catch((err) => {
        btnTransmitir.textContent = 'ERRO — TENTE NOVAMENTE';
        btnTransmitir.disabled = false;
        console.error(err);
      });
    });
  }
}

// ---- PÁGINA PAINEL -----------------------------------------
function initPainel() {
  const log = document.getElementById('connection-log');
  const contador = document.getElementById('contador');
  const overlay = document.getElementById('notify-overlay');
  const notifyName = document.getElementById('notify-name');
  const notifyMission = document.getElementById('notify-mission');

  let total = 0;
  let primeiraVez = true; // ignora dados já existentes na 1ª carga

  // Escuta NOVOS registros no Firebase
  db.ref('conexoes').orderByChild('timestamp').on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Na primeira carga, apenas popula o log sem disparar notificação
    adicionarAoLog(data, primeiraVez ? false : true);
    total++;
    if (contador) contador.textContent = total;
  });

  // Marca que o carregamento inicial terminou
  db.ref('conexoes').once('value', () => {
    primeiraVez = false;
  });

  function adicionarAoLog(data, comNotificacao) {
    if (!log) return;

    const li = document.createElement('li');
    const hora = data.timestamp
      ? new Date(data.timestamp).toLocaleTimeString('pt-BR')
      : '--:--:--';

    li.innerHTML = `
      <span class="timestamp">${hora}</span>
      <span class="name">${escapeHtml(data.nome)}</span>
      <span class="mission-tag">MISSÃO #${data.missao}</span>
    `;
    log.prepend(li); // mais recente no topo

    if (comNotificacao) {
      mostrarNotificacao(data.nome, data.textoMissao, data.missao);
    }
  }

  function mostrarNotificacao(nome, textoMissao, numMissao) {
    if (!overlay) return;
    if (notifyName) notifyName.textContent = nome.toUpperCase();
    if (notifyMission) notifyMission.textContent = `MISSÃO #${numMissao} — ${textoMissao}`;

    overlay.classList.add('show');
    setTimeout(() => overlay.classList.remove('show'), 6000);
  }

  // Clique fora fecha notificação
  if (overlay) {
    overlay.addEventListener('click', () => overlay.classList.remove('show'));
  }

  // Botão limpar (para reiniciar o evento)
  const btnLimpar = document.getElementById('btn-limpar');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      if (confirm('Limpar TODOS os registros? Esta ação não pode ser desfeita.')) {
        db.ref('conexoes').remove().then(() => {
          if (log) log.innerHTML = '';
          total = 0;
          if (contador) contador.textContent = 0;
        });
      }
    });
  }
}

// ---- ESCAPE HTML -------------------------------------------
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
