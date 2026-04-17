// ============================================================
// CONECTADOS — app.js
// ============================================================

const MISSOES = {
  1: "Escolha seu hino predileto e cante com a igreja a primeira estrofe.",
  2: "Encontre uma pessoa na rua e dê de presente esse livro!",
  3: "Pinte o rosto da sua professora!",
  4: "Escolha alguém para ir com você orar com algum vizinho da igreja.",
  5: "Escolha um amigo e pinte o rosto dele!"
};

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---- PÁGINA SUCESSO ----------------------------------------
function initSucesso() {
  const missaoNum = parseInt(getParam('missao')) || 1;
  const texto = MISSOES[missaoNum] || MISSOES[1];

  const elMissao = document.getElementById('missao-texto');
  if (elMissao) elMissao.textContent = texto;

  const elNum = document.getElementById('missao-num');
  if (elNum) elNum.textContent = 'MISSÃO #' + missaoNum;

  const form = document.getElementById('form-transmitir');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome-input').value.trim();
    if (!nome) {
      alert('Identifique-se antes de transmitir!');
      return;
    }

    const btn = document.getElementById('btn-transmitir');
    btn.textContent = 'TRANSMITINDO...';
    btn.disabled = true;

    // Timeout de segurança: se demorar mais de 8s, mostra erro
    const timeout = setTimeout(() => {
      btn.textContent = '⚠ ERRO — Regras do Firebase bloqueando';
      btn.disabled = false;
      btn.style.borderColor = 'var(--red)';
      btn.style.color = 'var(--red)';
      console.error('Timeout: Firebase não respondeu. Verifique as regras do banco.');
    }, 8000);

    const novoRegistro = {
      nome: nome,
      missao: missaoNum,
      textoMissao: texto,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    db.ref('conexoes').push(novoRegistro)
      .then(() => {
        clearTimeout(timeout);
        // Sucesso!
        document.getElementById('status-enviado').style.display = 'block';
        btn.textContent = '✓ TRANSMITIDO';
        btn.style.borderColor = 'var(--green)';
        document.getElementById('nome-input').disabled = true;
      })
      .catch((err) => {
        clearTimeout(timeout);
        console.error('Erro Firebase:', err);
        btn.textContent = '⚠ ERRO — Tente novamente';
        btn.disabled = false;
        btn.style.borderColor = 'var(--red)';
        btn.style.color = 'var(--red)';

        // Mostra mensagem de erro útil
        let msg = 'Erro ao transmitir.';
        if (err.code === 'PERMISSION_DENIED') {
          msg = 'Permissão negada. As regras do Firebase precisam ser abertas.';
        }
        alert('⚠ ' + msg + '\n\nCódigo: ' + err.code);
      });
  });
}

// ---- PÁGINA PAINEL -----------------------------------------
function initPainel() {
  const log       = document.getElementById('connection-log');
  const contador  = document.getElementById('contador');
  const missoesC  = document.getElementById('missoes-count');
  const overlay   = document.getElementById('notify-overlay');
  const notifyName    = document.getElementById('notify-name');
  const notifyMission = document.getElementById('notify-mission');
  const statusDot  = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  let total = 0;
  let carregamentoInicial = true;

  // Testa conexão com o Firebase
  db.ref('.info/connected').on('value', (snap) => {
    const conectado = snap.val();
    if (statusDot)  statusDot.className  = 'status-dot' + (conectado ? '' : ' red');
    if (statusText) statusText.textContent = conectado
      ? 'Conectado ao Firebase ✓'
      : '⚠ Sem conexão com Firebase';
  });

  // Carrega histórico e escuta novos registros
  db.ref('conexoes').orderByChild('timestamp').on('child_added', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // Remove o estado vazio
    const emptyMsg = document.getElementById('empty-msg');
    if (emptyMsg) emptyMsg.remove();

    total++;
    if (contador) contador.textContent = total;
    if (missoesC) missoesC.textContent = total;

    adicionarAoLog(data, !carregamentoInicial);
  });

  // Marca fim do carregamento inicial
  db.ref('conexoes').once('value', () => {
    carregamentoInicial = false;
    adicionarAoSysLog('escuta ativa — aguardando transmissões...');
  });

  function adicionarAoLog(data, comNotificacao) {
    if (!log) return;

    const li = document.createElement('li');
    const hora = data.timestamp
      ? new Date(data.timestamp).toLocaleTimeString('pt-BR')
      : '--:--:--';

    li.innerHTML =
      '<span class="timestamp">' + hora + '</span>' +
      '<span class="name">' + escapeHtml(data.nome) + '</span>' +
      '<span class="mission-tag">MISSÃO #' + data.missao + '</span>';

    log.prepend(li);

    if (comNotificacao) {
      mostrarNotificacao(data.nome, data.textoMissao, data.missao);
      adicionarAoSysLog('nova conexão: ' + data.nome);
    }
  }

  function mostrarNotificacao(nome, textoMissao, numMissao) {
    if (!overlay) return;
    if (notifyName)    notifyName.textContent    = nome.toUpperCase();
    if (notifyMission) notifyMission.textContent =
      'MISSÃO #' + numMissao + ' — ' + textoMissao;

    overlay.classList.add('show');
    setTimeout(() => overlay.classList.remove('show'), 6000);
  }

  if (overlay) {
    overlay.addEventListener('click', () => overlay.classList.remove('show'));
  }

  // Botão limpar
  const btnLimpar = document.getElementById('btn-limpar');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      if (confirm('Limpar TODOS os registros? Esta ação não pode ser desfeita.')) {
        db.ref('conexoes').remove().then(() => {
          if (log) {
            log.innerHTML =
              '<li id="empty-msg"><span></span>' +
              '<div class="empty-state"><div class="icon">📡</div>' +
              '<p>AGUARDANDO PRIMEIRA CONEXÃO...</p></div><span></span></li>';
          }
          total = 0;
          if (contador) contador.textContent = 0;
          if (missoesC) missoesC.textContent = 0;
        });
      }
    });
  }
}

function adicionarAoSysLog(msg) {
  const sysLog = document.getElementById('sys-log');
  if (!sysLog) return;
  const div = document.createElement('div');
  div.className = 'terminal-line';
  div.innerHTML = '<span class="prompt">&gt; </span><span>' + escapeHtml(msg) + '</span>';
  sysLog.appendChild(div);
  sysLog.scrollTop = sysLog.scrollHeight;
}
