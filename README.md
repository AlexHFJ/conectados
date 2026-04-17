# 🔗 CONECTADOS
### Sistema de sorteio interativo com QR Codes e telão em tempo real

---

## 📁 Estrutura de Arquivos

```
conectados/
├── gerador.html       ← Ferramenta privada (gera os QR Codes)
├── sucesso.html       ← Tela do ganhador (missão + transmissão)
├── falha.html         ← Tela de derrota
├── painel.html        ← Telão do evento (tempo real)
├── style.css          ← Identidade visual
├── app.js             ← Lógica principal
├── firebase-config.js ← ⚠ VOCÊ PRECISA PREENCHER ESTE ARQUIVO
└── README.md
```

---

## ⚙️ PASSO 1 — Configurar o Firebase

1. Acesse https://console.firebase.google.com/
2. Clique em **"Criar projeto"** → dê um nome → crie
3. No painel do projeto, clique em **"Realtime Database"** → **"Criar banco de dados"**
   - Escolha **"Modo de teste"** (permite leitura/escrita sem autenticação por 30 dias)
   - Selecione a localização (América do Sul se disponível)
4. Vá em **Configurações do projeto** (ícone de engrenagem) → **"Seus apps"** → **"Web"**
5. Registre o app e copie o objeto `firebaseConfig`
6. Abra o arquivo `firebase-config.js` e cole os valores:

```js
const firebaseConfig = {
  apiKey:            "SUA_API_KEY",
  authDomain:        "SEU_PROJETO.firebaseapp.com",
  databaseURL:       "https://SEU_PROJETO-default-rtdb.firebaseio.com",
  projectId:         "SEU_PROJETO",
  storageBucket:     "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId:             "SEU_APP_ID"
};
```

### Regras do banco (para o evento):
No Firebase Console → Realtime Database → **Regras**, cole:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
> ⚠️ Após o evento, altere para regras mais restritivas.

---

## 🚀 PASSO 2 — Publicar no GitHub Pages

1. Crie um repositório público no GitHub (ex: `conectados`)
2. Faça upload de **todos os arquivos** para a branch `main`
3. Vá em **Settings** → **Pages** → Source: **Deploy from branch** → `main` → `/ (root)`
4. Aguarde ~2 minutos. Seu site estará em:
   ```
   https://SEU_USUARIO.github.io/conectados
   ```

---

## 🖨️ PASSO 3 — Gerar os QR Codes

1. Abra `gerador.html` no navegador (pode ser localmente, não precisa do site publicado)
2. Na caixa **"URL BASE"**, cole a URL do seu GitHub Pages:
   ```
   https://SEU_USUARIO.github.io/conectados
   ```
3. **Bilhetes sem prêmio:** Defina a quantidade e clique em "GERAR CONEXÕES FALHAS"
4. **Bilhetes premiados:** Escolha a missão, defina a quantidade e clique em "GERAR QR DE MISSÃO"
5. Clique em **Imprimir** para imprimir os QR Codes

---

## 🎉 PASSO 4 — Durante o Evento

1. Abra `painel.html` no computador conectado ao projetor
2. Deixe em tela cheia (F11)
3. Distribua os bilhetes impressos com os QR Codes
4. Quando alguém escanear o QR premiado → o nome aparece no telão automaticamente!

---

## 📱 Fluxo do Participante

```
Escaneia QR Code
      │
      ├─ FALHA → falha.html (tela de erro, fim da jornada)
      │
      └─ PRÊMIO → sucesso.html?missao=X
                  └─ Lê a missão
                  └─ Digita o nome
                  └─ Clica "TRANSMITIR"
                  └─ Nome aparece no telão! 🎉
```

---

## ❓ Dúvidas Frequentes

**O telão não mostra os nomes?**
→ Verifique se o `firebase-config.js` está preenchido corretamente e se as regras do banco permitem leitura/escrita.

**O QR Code não abre a página?**
→ Verifique se a URL base está correta no gerador e se o GitHub Pages está ativo.

**Como reiniciar para um novo sorteio?**
→ No `painel.html`, clique no botão **"LIMPAR"** — isso apaga todos os registros do Firebase.
