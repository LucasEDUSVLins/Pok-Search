# 🔍 PokéSearch

**PokéSearch** é um buscador de elite avançado para treinadores Pokémon. O projeto foca em identificar a variação mais poderosa (maior BST - Base Stat Total) de qualquer espécie pesquisada, comparando formas Megas, Gigantamax e regionais em tempo real.

## ✨ Funcionalidades

-   **🏆 Elite Finder:** Algoritmo que analisa todas as variantes de um Pokémon e exibe automaticamente a versão com as melhores estatísticas.
-   **⌨️ Smart Search:** Barra de pesquisa inteligente com sugestões automáticas (Autocomplete) e botão de limpeza rápida.
-   **🌓 Dark Mode:** Suporte nativo a tema escuro com persistência de preferência via LocalStorage.
-   **📊 Visualização Dinâmica:** Gráficos de barras coloridos dinamicamente com base no tipo principal do Pokémon.
-   **📱 Responsividade:** Interface adaptável para uma experiência perfeita em dispositivos móveis e desktop.

## 🛠️ Tecnologias Utilizadas

-   **HTML5 & CSS3:** Estrutura semântica e estilização moderna com variáveis CSS.
-   **JavaScript (ES6+):** Lógica assíncrona para consumo da [PokéAPI](https://pokeapi.co/).
-   **Google Fonts:** Fonte *Inter* para máxima legibilidade.

## 🚀 Como Executar o Projeto

1.  Clone este repositório:
    ```bash
    git clone [https://github.com/lucasedusvlins/Pok-Meta.git](https://github.com/lucasedusvlins/Pok-Meta.git)
    ```
2.  Acesse a pasta do projeto:
    ```bash
    cd Pok-Meta
    ```
3.  Abra o arquivo `index.html` no seu navegador.

## 📁 Estrutura de Arquivos

```text
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilização e temas (Light/Dark)
├── js/
│   └── app.js          # Lógica da API, Busca e UI
└── README.md           # Documentação do projeto
