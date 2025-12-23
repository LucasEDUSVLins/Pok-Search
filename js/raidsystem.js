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

// --- CONFIGURAÇÃO DAS LISTAS ---
function configurarListasSelect() {
  const levelSelect = document.getElementById("pogo-level");
  const timeSelect = document.getElementById("raid-time-select");
  const bossSelect = document.getElementById("boss-select-list");

  if (levelSelect && levelSelect.options.length === 0) {
    for (let i = 1; i <= 80; i++) {
      let val = i < 10 ? `0${i}` : i;
      let opt = new Option(val, val);
      levelSelect.add(opt);
    }
  }

  if (timeSelect && timeSelect.options.length === 0) {
    for (let i = 5; i <= 60; i += 5) {
      let opt = new Option(`${i} min`, i);
      timeSelect.add(opt);
    }
  }

  if (bossSelect && bossSelect.options.length === 0) {
    chefesAtuais.forEach((nome) => {
      let opt = new Option(nome.toUpperCase(), nome);
      bossSelect.add(opt);
    });
  }
}

configurarListasSelect();

window.togglePerfil = function () {
  const modal = document.getElementById("modal-perfil");
  modal.style.display = modal.style.display === "flex" ? "none" : "flex";
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

// --- CRIAÇÃO DE HOST ---
window.abrirModalHost = function () {
  if (!localStorage.getItem("pogo_perfil")) {
    alert("Configure seu Perfil primeiro!");
    window.togglePerfil();
    return;
  }
  document.getElementById("modal-host").style.display = "flex";
  configurarListasSelect();
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
  set(novaRaidRef, {
    id: novaRaidRef.key,
    pokemonName: boss,
    tempo: time,
    capacidade: capacity,
    nivelReq: "Qualquer",
    hostName: perfil.name,
    hostCode: perfil.code,
    jogadoresAtuais: 1,
    timestamp: Date.now(),
  }).then(() => {
    window.fecharModalHost();
    alert("RAID Publicada!");
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
      '<p class="text-center text-secondary">Nenhuma raid disponível.</p>';
    return;
  }

  raids.forEach((raid) => {
    const percentual = (raid.jogadoresAtuais / raid.capacidade) * 100;
    const html = `
        <div class="card bg-dark border-secondary raid-card mb-2">
            <div class="card-body d-flex align-items-center p-2">
                <div class="flex-grow-1">
                    <h6 class="m-0 text-white text-capitalize">${raid.pokemonName}</h6>
                    <p class="small text-secondary mb-0">Host: ${raid.hostName} • ${raid.tempo}min</p>
                    <div class="progress mt-1" style="height: 6px; background: #444;"><div class="progress-bar bg-warning" style="width: ${percentual}%"></div></div>
                    <small class="text-warning">${raid.jogadoresAtuais}/${raid.capacidade} Jogadores</small>
                </div>
                <button class="btn btn-primary btn-sm ms-2" onclick="window.entrarNaRaid('${raid.id}')">Entrar</button>
            </div>
        </div>`;
    container.insertAdjacentHTML("beforeend", html);
  });
}

window.entrarNaRaid = function (id) {
  const raidRef = ref(db, `raids/${id}`);
  get(raidRef).then((snapshot) => {
    if (snapshot.exists()) {
      const raid = snapshot.val();
      document.getElementById("host-code-display").innerText = raid.hostCode;
      document.getElementById("modal-sala-raid").style.display = "flex";

      const perfil = JSON.parse(localStorage.getItem("pogo_perfil"));
      const hostActions = document.getElementById("host-actions");
      if (perfil && perfil.name === raid.hostName) {
        hostActions.style.display = "block";
        hostActions.innerHTML = `<button class="theme-btn btn-danger-elite w-100" onclick="window.encerrarRaid('${id}')">ENCERRAR RAID</button>`;
      } else {
        hostActions.style.display = "none";
      }
    }
  });
};

window.sairDaSala = function () {
  document.getElementById("modal-sala-raid").style.display = "none";
};
