let ANCHO = 20;
let ALTO = 20;
let LADO = 30;

let marcas = 0;

let minas = ANCHO * ALTO * 0.1;
let enJuego = true;
let juegoIniciado = false;

let TABLERO = [];

function nuevoJuego(e){
    reiniciarVariables();
    crearTableroHTML();
    agregarEventos();
    crearTableroJS();
    refrescarTablero();
}

async function ajustes() {
    const {
      value: ajustes
    } = await swal.fire({
      title: "Ajustes",
      html: `
              Dificultad &nbsp; (minas/área)
              <br>
              <br>
              <input onchange="cambiarValor()" oninput="this.onchange()" id="dificultad" type="range" min="10" max="40" step="1" value="${100 * minas / (ALTO * ANCHO)}">
              <span id="valor-dificultad">${100 * minas / (ALTO * ANCHO)}%</span>
              <br>
              <br>
              Filas
              <br>
              <input class="swal2-input" type="number" value=${ALTO} placeholder="filas" id="filas" min="10" max="1000" step="1">
              <br>
              Columnas
              <br>
              <input class="swal2-input" type="number" value=${ANCHO} placeholder="columnas" id="columnas" min="10" max="1000" step="1">
              <br>
              `,
      confirmButtonText: "Establecer",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      preConfirm: () => {
        return {
          columnas: document.getElementById("columnas").value,
          filas: document.getElementById("filas").value,
          dificultad: document.getElementById("dificultad").value
        }
      }
    })
    if (!ajustes) {
      return
    }
    ALTO = Math.floor(ajustes.filas);
    ANCHO = Math.floor(ajustes.columnas);
    minas = Math.floor(ANCHO * ALTO * ajustes.dificultad / 100)
    nuevoJuego()
}

function cambiarValor() {
    dificultad = document.getElementById("dificultad");
    spanDificultad = document.getElementById("valor-dificultad");
    spanDificultad.innerHTML = dificultad.value + "%";
}

function reiniciarVariables() {
    marcas = 0;
    enJuego = true;
    juegoIniciado = false;
}

function crearTableroHTML() {
    let gameBoard = document.getElementById("gameBoard");
    let html = "";

    for (let fila = 0; fila < ALTO; fila++)
        html += crearFila(fila);

    gameBoard.innerHTML = html;
    gameBoard.style.width = ANCHO * LADO + "px";
    gameBoard.style.height = ALTO * LADO + "px";
    gameBoard.style.background = "slategray";
}

function crearFila(fila) {
    let html = `<tr id="${fila}">`;

    for (let columna = 0; columna < ANCHO; columna++) {
        html += `<td id="${columna}-${fila}" style="width:${LADO}px;height:${LADO}px;" class="sinDescubrir"></td>`;
    }

    html += "</tr>";
    return html;
}

function crearTableroJS() {
    limpiarTablero();
    rellenarTablero();
    contadoresMinas();
}

function limpiarTablero() {
    TABLERO = [];

    for (let columna = 0; columna < ANCHO; columna++) 
        TABLERO.push([]);
}

function rellenarTablero() {
    for (let i = 0; i < minas; i++) {
        let columna;
        let fila;

        do {
            columna = Math.floor(Math.random()*ANCHO);
            fila = Math.floor(Math.random()*ALTO);
        } while (TABLERO[columna][fila]);

        TABLERO[columna][fila] = {valor: -1};
    }
}

function contadoresMinas(){
    for (let fila = 0; fila < ALTO; fila++) {
        for (let columna = 0; columna < ANCHO; columna++) {
            if(!TABLERO[columna][fila]) {
                let contador = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {     
                        if (i == 0 && j == 0) {
                            continue;
                        }   
                        try {
                            if(TABLERO[columna+i][fila+j].valor == -1){
                                contador++;
                            }
                        }catch(e){}
                    }            
                }
                TABLERO[columna][fila] = {valor: contador};
            }
        }
    }
}

function refrescarTablero() {
    for (let fila = 0; fila < ALTO; fila++) {
        for (let columna = 0; columna < ANCHO; columna++) {
            let celda = document.getElementById(`${columna}-${fila}`);
            if (TABLERO[columna][fila].estado == "descubierto") {
                celda.className = "descubierto";
                switch (TABLERO[columna][fila].valor) {
                    case -1:
                        celda.innerHTML = '<i class="fa-solid fa-bomb"></i>';
                        celda.style.color="black";
                        celda.style.background="white";
                        break;
                    case 0:
                        break;
                    default:
                        celda.innerHTML = TABLERO[columna][fila].valor;
                        break;
                }
            }
            if (TABLERO[columna][fila].estado == "marcado") {
                celda.innerHTML = '<i class="fa-solid fa-flag"></i>';
                celda.style.background = "cadetblue";
            }

            if (TABLERO[columna][fila].estado == undefined) {
                celda.innerHTML = "";
                celda.style.background = "";
            }
        }
    }
    verificarGanador();
    verificarPerdedor();
    actualizarPanelDeMinas()
}

function actualizarPanelDeMinas() {
    let panel = document.getElementById("minas");
    panel.innerHTML = minas - marcas;
}

function agregarEventos(){
    for (let fila = 0; fila < ALTO; fila++) {
        for (let columna = 0; columna < ANCHO; columna++) {
            let celda = document.getElementById(`${columna}-${fila}`);
            celda.addEventListener("dblclick", me => {
                dobleClick(celda,columna,fila,me);
            });

            celda.addEventListener("mouseup", me => {
                clickSimple(celda,columna,fila,me);
            });
        }
    }
}

function dobleClick(celda,columna,fila,me){
    if(!enJuego) {
        return;
    }

    abrirArea(columna,fila);
    refrescarTablero();
}


function clickSimple(celda,columna,fila,me){
    if(!enJuego) {
        return;
    }
    
    if (TABLERO[columna][fila].estado == "descubierto")
    return;
    
    switch(me.button) {
        case 0:
            if (TABLERO[columna][fila].estado == "marcado") {
                return;
            }
            while (!juegoIniciado && TABLERO[columna][fila].valor == -1) {
                crearTableroJS();
            } 
            TABLERO[columna][fila].estado = "descubierto";
            juegoIniciado = true;

            if (TABLERO[columna][fila].valor == 0) {
                abrirArea(columna,fila);
            }
            break;
        case 1:
            break;
        case 2:
            if(TABLERO[columna][fila].estado == "marcado") {
                TABLERO[columna][fila].estado = undefined;
                marcas--;
            } else {
                TABLERO[columna][fila].estado = "marcado";
                marcas++;
            }
            break;
        default:
            break;
    }

    refrescarTablero();
}

function abrirArea(columna,fila) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i==0 && j ==0) {
                continue;
            }

            try {
                if (TABLERO[columna+i][fila+j].estado != "descubierto") {
                    if (TABLERO[columna+i][fila+j].estado != "marcado") {
                        TABLERO[columna+i][fila+j].estado = "descubierto";
                        if (TABLERO[columna+i][fila+j].valor == 0) {
                            abrirArea(columna+i,fila+j);
                        }
                    }
                }
            }catch(e){}
        }
    }
}

function verificarGanador() {
    for (let fila = 0; fila < ALTO; fila++) {
        for (let columna = 0; columna < ANCHO; columna++) {
            if (TABLERO[columna][fila].estado != "descubierto") {
                if (TABLERO[columna][fila].valor == -1) {
                    continue;
                } else {
                    return;
                }
            }
        }
    }

    let tableroHTML = document.getElementById("gameBoard");
    tableroHTML.style.background = "green";
    enJuego = false;    
}

function verificarPerdedor() {
    for (let fila = 0; fila < ALTO; fila++) {
        for (let columna = 0; columna < ANCHO; columna++) {
            if (TABLERO[columna][fila].valor == -1) {
                if (TABLERO[columna][fila].estado == "descubierto") {
                    let tableroHTML = document.getElementById("gameBoard");
                    tableroHTML.style.background = "red";
                    enJuego = false;
                }
            }
        }
    }

    if (enJuego)
        return;
    for (let fila = 0; fila < ALTO; fila++) {
        for (let columna = 0; columna < ANCHO; columna++) {
            if (TABLERO[columna][fila].valor == -1) {
                let celda = document.getElementById(`${columna}-${fila}`);
                celda.innerHTML = '<i class="fa-solid fa-bomb"></i>';
                celda.style.color = "black";
            }
        }
    } 
}

document.addEventListener("DOMContentLoaded",nuevoJuego);