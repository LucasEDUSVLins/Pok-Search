import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  remove,
  get,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFUwZiWB4uf2l4bkahGze2nvSgPwFxCn0",
  authDomain: "pokesearch-raids.firebaseapp.com",
  databaseURL: "https://pokesearch-raids-default-rtdb.firebaseio.com",
  projectId: "pokesearch-raids",
  storageBucket: "pokesearch-raids.firebasestorage.app",
  messagingSenderId: "360355197732",
  appId: "1:360355197732:web:1c925a825274972b7679b1",
  measurementId: "G-ZVBT5YD8TJ",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const chefesAtuais = [
  "charizard",
  "blastoise",
  "venusaur",
  "lugia",
  "groudon",
  "kyogre",
];

function configurarListasSelect() {
  const levelSelect = document.getElementById("pogo-level");
  const timeSelect = document.getElementById("raid-time-select");
  const bossSelect = document.getElementById("boss-select-list");
  const capacitySelect = document.getElementById("raid-capacity");

  if (levelSelect && levelSelect.options.length === 0) {
    for (let i = 1; i <= 80; i++) {
      let val = i < 10 ? `0${i}` : i;
      levelSelect.add(new Option(val, val));
    }
  }

  if (capacitySelect && capacitySelect.options.length === 0) {
    for (let i = 1; i <= 20; i++) {
      let val = i < 10 ? `0${i}` : i;
      capacitySelect.add(new Option(`${val} Vagas`, i));
    }
    capacitySelect.value = "5";
  }

  if (timeSelect && timeSelect.options.length === 0) {
    for (let i = 5; i <= 60; i += 5) {
      timeSelect.add(new Option(`${i} min`, i));
    }
  }

  if (bossSelect && bossSelect.options.length === 0) {
    chefesAtuais.forEach((nome) =>
      bossSelect.add(new Option(nome.toUpperCase(), nome))
    );
  }
}

configurarListasSelect();

window.togglePerfil = function () {
  const modal = document.getElementById("modal-perfil");
  modal.style.display =
    modal.style.display === "none" || modal.style.display === ""
      ? "flex"
      : "none";
};

window.salvarPerfil = function () {
  const perfil = {
    name: document.getElementById("pogo-name").value,
    level: document.getElementById("pogo-level").value,
    code: document.getElementById("pogo-friend-code").value,
  };
  if (!perfil.name || !perfil.code) return alert("Preencha nome e código!");
  localStorage.setItem("pogo_perfil", JSON.stringify(perfil));
  alert("Perfil salvo com sucesso!");
  window.togglePerfil();
};

window.abrirModalHost = function () {
  if (!localStorage.getItem("pogo_perfil")) {
    alert("Configure seu Perfil primeiro!");
    window.togglePerfil();
    return;
  }
  configurarListasSelect();
  document.getElementById("modal-host").style.display = "flex";
};

window.fecharModalHost = function () {
  document.getElementById("modal-host").style.display = "none";
};

window.publicarHost = function () {
  const perfil = JSON.parse(localStorage.getItem("pogo_perfil"));
  const boss = document.getElementById("boss-select-list").value;
  const time = document.getElementById("raid-time-select").value;
  const capacity = parseInt(document.getElementById("raid-capacity").value);

  if (!boss || !time) return alert("Preencha todos os campos!");

  const novaRaidRef = push(ref(db, "raids"));
  const raidId = novaRaidRef.key;

  const dadosRaid = {
    id: raidId,
    pokemonName: boss,
    tempo: time,
    capacidade: capacity,
    nivelReq: "Qualquer",
    hostName: perfil.name,
    hostCode: perfil.code,
    jogadoresAtuais: 1,
    listaJogadores: [perfil.name],
    timestamp: Date.now(),
  };

  set(novaRaidRef, dadosRaid).then(() => {
    window.fecharModalHost();
    window.abrirSalaLobby(raidId);
  });
};

window.encerrarRaid = function (raidId) {
  if (confirm("Deseja encerrar esta RAID?")) {
    remove(ref(db, `raids/${raidId}`));
    window.sairDaSala();
  }
};

onValue(ref(db, "raids"), (snapshot) => {
  const data = snapshot.val();
  const lista = data ? Object.values(data) : [];
  lista.sort((a, b) => b.timestamp - a.timestamp);
  renderizarListaHosts(lista);
});

function renderizarListaHosts(raids) {
  const container = document.getElementById("container-hosts");
  if (!container) return;
  container.innerHTML = "";

  if (raids.length === 0) {
    container.innerHTML =
      '<p class="text-center text-secondary py-4">Nenhuma raid disponível no momento.</p>';
    return;
  }

  raids.forEach((raid) => {
    const percentual = (raid.jogadoresAtuais / raid.capacidade) * 100;
    const html = `
        <div class="raid-card">
            <div class="raid-info">
                <h6>${raid.pokemonName}</h6>
                <div class="raid-details">
                    <span>Host: <strong>${raid.hostName}</strong></span><br>
                    <span>Termina em: ${raid.tempo} min</span>
                </div>
            </div>
            
            <div class="raid-status-bar">
                <div class="progress-mini">
                    <div class="progress-fill" style="width: ${percentual}%"></div>
                </div>
                <small>${raid.jogadoresAtuais}/${raid.capacidade}</small>
            </div>

            <button class="btn-entrar" onclick="window.entrarNaRaid('${raid.id}')">
                ENTRAR
            </button>
        </div>`;
    container.insertAdjacentHTML("beforeend", html);
  });
}

window.entrarNaRaid = function (id) {
  const perfil = JSON.parse(localStorage.getItem("pogo_perfil"));
  if (!perfil) return window.togglePerfil();

  const raidRef = ref(db, `raids/${id}`);

  get(raidRef).then((snapshot) => {
    if (snapshot.exists()) {
      const raid = snapshot.val();
      const jaEstaNaLista =
        raid.listaJogadores &&
        Object.values(raid.listaJogadores).includes(perfil.name);

      if (!jaEstaNaLista && raid.jogadoresAtuais >= raid.capacidade) {
        return alert("Esta RAID já está lotada!");
      }

      if (!jaEstaNaLista) {
        const novaLista = raid.listaJogadores
          ? [...Object.values(raid.listaJogadores), perfil.name]
          : [raid.hostName, perfil.name];
        set(ref(db, `raids/${id}/listaJogadores`), novaLista);
        set(ref(db, `raids/${id}/jogadoresAtuais`), novaLista.length);
      }
      window.abrirSalaLobby(id);
    }
  });
};

window.abrirSalaLobby = function (id) {
  const raidRef = ref(db, `raids/${id}`);
  onValue(raidRef, (snapshot) => {
    if (!snapshot.exists()) {
      window.sairDaSala();
      return;
    }
    const raid = snapshot.val();
    const perfil = JSON.parse(localStorage.getItem("pogo_perfil"));

    document.getElementById("host-code-display").innerText = raid.hostCode;
    document.getElementById("count-sala").innerText = raid.jogadoresAtuais;
    document.getElementById("max-sala").innerText = raid.capacidade;

    const playerListDiv = document.getElementById("player-list-lobby");
    const lista = raid.listaJogadores ? Object.values(raid.listaJogadores) : [];
    const prontos = raid.prontos || {};

    playerListDiv.innerHTML = lista
      .map((nome) => {
        const estaPronto = prontos[nome] ? "player-ready" : "";
        const icone = prontos[nome]
          ? '<i class="bi bi-check-circle-fill"></i>'
          : '<i class="bi bi-person-fill"></i>';
        return `
                <div class="player-slot ${estaPronto}">
                    <span>${icone} ${nome}</span>
                    ${
                      nome === raid.hostName
                        ? '<span class="badge-host">HOST</span>'
                        : ""
                    }
                </div>`;
      })
      .join("");

    const lobbyActions = document.getElementById("lobby-actions");
    if (perfil && perfil.name === raid.hostName) {
      lobbyActions.innerHTML = `<button class="theme-btn btn-danger-elite w-100" onclick="window.encerrarRaid('${id}')">ENCERRAR RAID</button>`;
    } else {
      const textoBotao = prontos[perfil.name]
        ? "ESTOU PRONTO!"
        : "MARCAR COMO PRONTO";
      const classeBotao = prontos[perfil.name]
        ? "btn-success-elite"
        : "btn-outline-success";
      lobbyActions.innerHTML = `<button class="theme-btn ${classeBotao} w-100" onclick="window.togglePronto('${id}')">${textoBotao}</button>`;
    }

    document.getElementById("modal-sala-raid").style.display = "flex";
  });
};

window.sairDaSala = function () {
  document.getElementById("modal-sala-raid").style.display = "none";
};

window.copiarCodigo = function () {
  const codigo = document.getElementById("host-code-display").innerText;
  navigator.clipboard.writeText(codigo.replace(/\s/g, "")).then(() => {
    alert("Código copiado! Adicione no Pokémon GO.");
  });
};

window.togglePronto = function (raidId) {
  const perfil = JSON.parse(localStorage.getItem("pogo_perfil"));
  const raidRef = ref(db, `raids/${raidId}`);

  get(raidRef).then((snapshot) => {
    if (snapshot.exists()) {
      const raid = snapshot.val();
      const prontos = raid.prontos || {};

      prontos[perfil.name] = !prontos[perfil.name];

      set(ref(db, `raids/${raidId}/prontos`), prontos);
    }
  });
};
