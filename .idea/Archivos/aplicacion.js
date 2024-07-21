const tablero = document.querySelector("#tableroJuego");
const jugadorMostrar = document.querySelector("#jugador");
const despleInfo = document.querySelector("#desplegarInfo");

// Control de turnos
let jugadorEmpieza = 'negro';
    // textContent para asignar valor
jugadorMostrar.textContent ='negro';

// Tablero de ajedrez es de 8 X 8
const ancho = 8;

const comienzoPiezas = [
    torre, caballo, alfil, reina, rey, alfil, caballo, torre,
    peon, peon, peon, peon, peon, peon, peon, peon,
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '',
    peon, peon, peon, peon, peon, peon, peon, peon,
    torre, caballo, alfil, reina, rey, alfil, caballo, torre
];

// Función para crear el tablero y desplegar las piezas, esto crea 64 cuadrados (divs)

function crearTablero(){
// En el bucle también aparte de crear un cuadrado, también con (i) le daremos un atributo con valor
    comienzoPiezas.forEach((comienzoPieza,i) => {

       const cuadrado =  document.createElement('div');

       cuadrado.classList.add('cuadrado');

       cuadrado.innerHTML = comienzoPieza;
       // Si el cuadro tiene un elemento hijo(Se refiere al div con el svg de la pieza)

       // Se puede hacer así o como lo hago abajo  cuadrado.firstChild?.setAttribute('draggable',true); // Arrastrable a verdadero
      // cuadrado.firstChild && cuadrado.firstChild.setAttribute('draggable',true);
      cuadrado.firstChild?.setAttribute('draggable', true);


       // Al cuadrado le añadimos un atributo unico,que sea el valor de i en cada iteración
       cuadrado.setAttribute('cuadrado-id',i);
       // cuadrado.classList.add('beix') Por el momento se comenta  ya que se deberá de determinar el color del cuadrado

        const fila = Math.floor((63 - i) / 8) + 1; // Esto definirá en que fila estamos situados

        if(fila % 2 === 0){
              /* Verificamos en que cuadrado de la fila estamos para darle el color que DEBE de tener
              cada cuadrado, es decir, una beix y la otra marron, así sucesivamente.
                                                   True             False                          */
            cuadrado.classList.add(i % 2 === 0 ? "colorBeix" : "colorMarron");
        }else{
            cuadrado.classList.add(i % 2 === 0 ? "colorMarron" : "colorBeix");
        }
        // Cambiando color a las fichas, a los primeros 16,es decir, las 2 primeras filas en negro
        if(i <= 15){
            cuadrado.firstChild?.firstChild.classList.add('colorNegro');
        }
        // Y las últimas 2 filas de blanco
        if(i >= 48){
            cuadrado.firstChild?.firstChild.classList.add('colorBlanco');
        }
       tablero.append(cuadrado);
    })
}

crearTablero();


// Ahora necesitamos seleccionar todos los CUADRADOS (64 en total)

const todosCuadrados = document.querySelectorAll("#tableroJuego .cuadrado");
// console.log(todosCuadrados) Se comprueba por consola que tengamos todos los cuadrados

todosCuadrados.forEach(cuadrado =>{
    // Evento de tipo "dragstart" para cada uno de los cuadrados, que disparará la función empezarArrastrar
    cuadrado.addEventListener('dragstart',empezarArrastrar);
    // Añadimos también otro evento, el de arrastrar por encima
    cuadrado.addEventListener('dragover',arrastrarEncima);
    // Y también el de dejar la pieza
    cuadrado.addEventListener('drop',arrastrarDejar);
})

let posicionInicialID;
let elementoArrastrado;

function empezarArrastrar(e){
// Se quiere guardar el id del cuadrado en el momento que se quiera arrastrar una determinada pieza -- console.log(e);
    posicionInicialID = e.target.parentNode.getAttribute('cuadrado-id');
    elementoArrastrado = e.target;
}

function arrastrarEncima(e){
    // Prevenimos la acción por defecto
    e.preventDefault();
   //  console.log(e.target)
}



/* Este método se encarga de que podamos dejar cada pieza en un lugar determinado y que no se puedan pisar
uno al otro a no ser que sea un movimiento "ganador"
*/
function arrastrarDejar(e){
    // Esto es para que no haya duplicidad
    e.stopPropagation();
    e.preventDefault();

    console.log('Objetivo al que apuntamos:',e.target);
   /* console.log('El jugador:',jugadorEmpieza)
    e.target.append(elementoArrastrado); --> Para  mover ficha
    e.target.remove(); --> Borrar la ficha objetivo  */

    console.log(jugadorEmpieza);

    // Obtenemos el movimiento correcto, es decir, que el jugador negro arrastre una ficha negra hacia una blanca o vacia
    const movimientoCorrecto = elementoArrastrado.firstChild.classList.contains(jugadorEmpieza);

    const cogido = e.target.classList.contains('pieza');

    /*
    V
    A
    L
    I
    D
    O
    */

    const valido = revisarSiValido(e.target);

   // console.log('Elemento codigo:',cogido)
    const movimientoOponente = jugadorEmpieza === 'blanco' ? 'negro' : 'blanco';

    const seleccionOponente = e.target.firstChild?.classList.contains(movimientoOponente);

    console.log('Turno oponente:',movimientoOponente);

    if(movimientoCorrecto){
        // Primero debemos de revisar esto
        if(seleccionOponente && valido){
                /*Si existe un elemento y se arrastra... */
                e.target.parentNode.append(elementoArrastrado); // Mover en el tablero
                // Para emplear esto hay que asegurarse de que la pieza es del oponente(Hecho arriba"if")
                e.target.remove(); // Eliminar

                verificarGanador();

                // Si lo que arrastramos tiene exito y es posible hacerlo,pues cambiamos el turno del jugador con el siguiente método
                cambiarTurnoJugador();
                return;
        }

        if(cogido && !seleccionOponente){
        // Esta parte falla
            console.log("Misma ficha");
            despleInfo.textContent="No puedes moverte ahi!";

            // Con temporizador
            setTimeout(() =>despleInfo.textContent= "",2000);
            return;
        }

        if(valido){
         e.target.append(elementoArrastrado);
         verificarGanador();
         cambiarTurnoJugador();
         return;
        }

      }
}

function revisarSiValido(target){
       // console.log('Objetivo:',target)
        /* Necesitamos el Id del cuadrado al que vamos a acceder para confirmar la validez del movimiento.
        Tanto si el target es una pieza o un cuadrado vacio!                es como un if               */
        const cuadradoObjetivoID = Number(target.getAttribute('cuadrado-id')) || Number(target.parentNode.getAttribute('cuadrado-id'));
                // Esto es un parseo a valor numerico Number()
        const IDcomienzo = Number(posicionInicialID);
        const pieza = elementoArrastrado.id;

        console.log('Objetivo:',cuadradoObjetivoID);
        console.log('ID inicio',IDcomienzo);
        console.log('Tipo de pieza:',pieza);
        console.log('Verificación de la formula:',IDcomienzo + ancho * 2);
        console.log('Tope:',cuadradoObjetivoID);

        // Un switch para determinar lo que hace cada pieza, para ahorrarnos if's

        switch(pieza){
            case 'peon':
                // Donde se pueden mover 2 casillas(Piezas negras), las 2 primeras filas
                const filaInicial = [8,9,10,11,12,13,14,15];
                /* Si está en la fila inicial y desde donde empieza + ancho(8) * 2 es igual al cuadradoObjetivo,
                es decir, hasta las 2 primeras filas seria posible el movimiento
                */
                if (
                (filaInicial.includes(IDcomienzo) && IDcomienzo + ancho * 2 === cuadradoObjetivoID )||
                IDcomienzo + ancho === cuadradoObjetivoID ||
                // Cuando está dentro del ancho establecido.(Que no sale del limite de 2 filas,desde donde comienza mas el ancho(8) es igual al cuadrado objetivo)
                IDcomienzo + ancho - 1 === cuadradoObjetivoID
                // El siguiente es para asegurarnos que se pueda mover en diagonal en el momento de que haya una ficha del contrincante PENDIENTE REVISAR!!!!!!

                && document.querySelector(`[cuadrado-id="${IDcomienzo + ancho -1}"]`).firstChild ||
                // Para que contrincante también pueda moverse de la misma manera
                IDcomienzo + ancho + 1 === cuadradoObjetivoID && document.querySelector(`[cuadrado-id="${IDcomienzo + ancho + 1}"]`).firstChild

                ){
                       console.log("He llegado hasta aqui !!!!!");
                       return true;
                }
                break;

            case 'caballo':

            if(
                    IDcomienzo + ancho * 2 - 1 === cuadradoObjetivoID ||
                    IDcomienzo + ancho * 2 + 1 === cuadradoObjetivoID ||
                    IDcomienzo + ancho - 2 === cuadradoObjetivoID ||
                    IDcomienzo + ancho + 2 === cuadradoObjetivoID ||
                    IDcomienzo - ancho * 2 - 1 === cuadradoObjetivoID ||
                    IDcomienzo - ancho * 2 + 1 === cuadradoObjetivoID ||
                    IDcomienzo - ancho - 2 === cuadradoObjetivoID ||
                    IDcomienzo - ancho + 2 === cuadradoObjetivoID
                ){
                    return true;
                }
                break;

            case 'alfil':

                if(
                // Derecha delante
                    IDcomienzo + ancho + 1 === cuadradoObjetivoID ||
                    // Y además nos aseguramos de que nos haya nada en el lugar que nos queremos mover
                    IDcomienzo + ancho * 2 + 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho + 1}"]`).firstChild ||

                    IDcomienzo + ancho * 3 + 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho + 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 + 2}"]`).firstChild ||

                    IDcomienzo + ancho * 4 + 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho + 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 + 3}"]`).firstChild ||

                    IDcomienzo + ancho * 5 + 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho + 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4 + 4}"]`).firstChild ||

                    IDcomienzo + ancho * 6 + 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho + 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4 + 4}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 5 + 5}"]`).firstChild ||

                    IDcomienzo + ancho * 7 + 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho + 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4 + 4}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 5 + 5}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 6 + 6}"]`).firstChild ||

                    // Izquierda delante
                    IDcomienzo - ancho - 1 === cuadradoObjetivoID ||

                    IDcomienzo - ancho * 2 - 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho - 1}"]`).firstChild ||

                    IDcomienzo - ancho * 3 - 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho - 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 - 2}"]`).firstChild ||

                    IDcomienzo - ancho * 4 - 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho - 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 - 3}"]`).firstChild ||

                    IDcomienzo - ancho * 5 - 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho - 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4 - 4}"]`).firstChild ||

                    IDcomienzo - ancho * 6 - 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho - 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4 - 4}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 5 - 5}"]`).firstChild ||

                    IDcomienzo - ancho * 7 - 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho - 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4 - 4}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 5 - 5}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 6 - 6}"]`).firstChild ||

                    // También hay qye mirar que se pueda ir en sentido contrario, es decir, hacia atrás

                    IDcomienzo - ancho + 1 === cuadradoObjetivoID ||

                    IDcomienzo - ancho * 2 + 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho + 1}"]`).firstChild ||

                    IDcomienzo - ancho * 3 + 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho + 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 + 2}"]`).firstChild ||

                    IDcomienzo - ancho * 4 + 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho + 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 + 3}"]`).firstChild ||

                    IDcomienzo - ancho * 5 + 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho + 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4 + 4}"]`).firstChild ||

                    IDcomienzo - ancho * 6 + 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho + 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4 + 4}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 5 + 5}"]`).firstChild ||

                    IDcomienzo - ancho * 7 + 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho + 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 + 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 + 3}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4 + 4}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 5 + 5}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 6 + 6}"]`).firstChild ||

                    //

                    IDcomienzo + ancho - 1 === cuadradoObjetivoID ||

                    IDcomienzo + ancho * 2 - 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho - 1}"]`).firstChild ||

                    IDcomienzo + ancho * 3 - 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho - 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 - 2}"]`).firstChild ||

                    IDcomienzo + ancho * 4 - 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho - 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 - 3}"]`).firstChild ||

                    IDcomienzo + ancho * 5 - 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho - 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4 - 4}"]`).firstChild ||

                    IDcomienzo + ancho * 6 - 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho - 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4 - 4}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 5 - 5}"]`).firstChild ||

                    IDcomienzo + ancho * 7 - 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho - 1}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 - 2}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 - 3}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4 - 4}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 5 - 5}"]`).firstChild &&
                    !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 6 - 6}"]`).firstChild


                ){
                    return true;
                }

                break;


                case 'torre':
                
                        // Hacia delante

                        if( IDcomienzo + ancho === cuadradoObjetivoID ||
                                                    // Además verificamos que no haya nada delante!
                            IDcomienzo + ancho * 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) ||
                            IDcomienzo + ancho * 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2}"]`) ||

                            IDcomienzo + ancho * 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3}"]`) ||


                            IDcomienzo + ancho * 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4}"]`) ||

                            IDcomienzo + ancho * 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 5}"]`) ||

                            IDcomienzo + ancho * 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 5}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 6}"]`) ||

                            // Hacia atrás

                            IDcomienzo - ancho === cuadradoObjetivoID ||
                                                    // Además verificamos que no haya nada delante!
                            IDcomienzo - ancho * 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho}"]`) ||
                            IDcomienzo - ancho * 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2}"]`) ||

                            IDcomienzo - ancho * 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3}"]`) ||


                            IDcomienzo - ancho * 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4}"]`) ||

                            IDcomienzo - ancho * 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 5}"]`) ||

                            IDcomienzo - ancho * 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 5}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 6}"]`) ||
                            
                            // Lado derecho
                            
                            IDcomienzo + 1 === cuadradoObjetivoID ||
                                                    // Además verificamos que no haya nada delante!
                            IDcomienzo + 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + 1}"]`) ||
                            IDcomienzo + 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + 1}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 2}"]`) ||

                            IDcomienzo + 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + 1}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 3}"]`) ||


                            IDcomienzo + 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + 1}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 3}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 4}"]`) ||

                            IDcomienzo + 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + 1}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 3}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 4}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 5}"]`) ||

                            IDcomienzo + 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + 1}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 3}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 4}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 5}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo + 6}"]`) ||
                            
                            // Lado izquierdo
                            
                            IDcomienzo - 1 === cuadradoObjetivoID ||
                                                    // Además verificamos que no haya nada delante!
                            IDcomienzo - 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - 1}"]`) ||
                            IDcomienzo - 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - 1}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 2}"]`) ||

                            IDcomienzo - 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - 1}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 3}"]`) ||


                            IDcomienzo - 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - 1}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 3}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 4}"]`) ||

                            IDcomienzo - 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - 1}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 3}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 4}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 5}"]`) ||

                            IDcomienzo - 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - 1}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 2}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 3}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 4}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 5}"]`) &&
                            !document.querySelector(`[cuadrado-id="${IDcomienzo - 6}"]`)

                        ){
                            return true;
                        }
                        break;

                        case "reina":

                        if(
                        // La reina se mueve como un alfil y una torre, primero pongo el código del alfil y seguido en de la torre

                        // Derecha delante
                        IDcomienzo + ancho + 1 === cuadradoObjetivoID ||
                        // Y además nos aseguramos de que nos haya nada en el lugar que nos queremos mover
                        IDcomienzo + ancho * 2 + 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho + 1}"]`).firstChild ||

                        IDcomienzo + ancho * 3 + 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho + 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 + 2}"]`).firstChild ||

                        IDcomienzo + ancho * 4 + 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho + 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 + 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 + 3}"]`).firstChild ||

                        IDcomienzo + ancho * 5 + 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho + 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 + 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 + 3}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4 + 4}"]`).firstChild ||

                        IDcomienzo + ancho * 6 + 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho + 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 + 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 + 3}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4 + 4}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 5 + 5}"]`).firstChild ||

                        IDcomienzo + ancho * 7 + 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho + 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 + 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 + 3}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4 + 4}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 5 + 5}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 6 + 6}"]`).firstChild ||

                        // Izquierda delante
                        IDcomienzo - ancho - 1 === cuadradoObjetivoID ||

                        IDcomienzo - ancho * 2 - 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho - 1}"]`).firstChild ||

                        IDcomienzo - ancho * 3 - 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho - 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 - 2}"]`).firstChild ||

                        IDcomienzo - ancho * 4 - 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho - 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 - 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 - 3}"]`).firstChild ||

                        IDcomienzo - ancho * 5 - 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho - 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 - 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 - 3}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4 - 4}"]`).firstChild ||

                        IDcomienzo - ancho * 6 - 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho - 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 - 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 - 3}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4 - 4}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 5 - 5}"]`).firstChild ||

                        IDcomienzo - ancho * 7 - 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho - 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 - 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 - 3}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4 - 4}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 5 - 5}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 6 - 6}"]`).firstChild ||

                        // También hay qye mirar que se pueda ir en sentido contrario, es decir, hacia atrás

                        IDcomienzo - ancho + 1 === cuadradoObjetivoID ||

                        IDcomienzo - ancho * 2 + 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho + 1}"]`).firstChild ||

                        IDcomienzo - ancho * 3 + 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho + 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 + 2}"]`).firstChild ||

                        IDcomienzo - ancho * 4 + 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho + 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 + 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 + 3}"]`).firstChild ||

                        IDcomienzo - ancho * 5 + 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho + 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 + 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 + 3}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4 + 4}"]`).firstChild ||

                        IDcomienzo - ancho * 6 + 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho + 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 + 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 + 3}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4 + 4}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 5 + 5}"]`).firstChild ||

                        IDcomienzo - ancho * 7 + 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho + 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2 + 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3 + 3}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4 + 4}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 5 + 5}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 6 + 6}"]`).firstChild ||

                        //

                        IDcomienzo + ancho - 1 === cuadradoObjetivoID ||

                        IDcomienzo + ancho * 2 - 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho - 1}"]`).firstChild ||

                        IDcomienzo + ancho * 3 - 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho - 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 - 2}"]`).firstChild ||

                        IDcomienzo + ancho * 4 - 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho - 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 - 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 - 3}"]`).firstChild ||

                        IDcomienzo + ancho * 5 - 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho - 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 - 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 - 3}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4 - 4}"]`).firstChild ||

                        IDcomienzo + ancho * 6 - 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho - 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 - 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 - 3}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4 - 4}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 5 - 5}"]`).firstChild ||

                        IDcomienzo + ancho * 7 - 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho - 1}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2 - 2}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3 - 3}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4 - 4}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 5 - 5}"]`).firstChild &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 6 - 6}"]`).firstChild ||


                        // Movimientos de la torre


                        IDcomienzo + ancho === cuadradoObjetivoID ||
                                                // Además verificamos que no haya nada delante!
                        IDcomienzo + ancho * 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) ||
                        IDcomienzo + ancho * 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2}"]`) ||

                        IDcomienzo + ancho * 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3}"]`) ||


                        IDcomienzo + ancho * 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4}"]`) ||

                        IDcomienzo + ancho * 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 5}"]`) ||

                        IDcomienzo + ancho * 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 3}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 4}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 5}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho * 6}"]`) ||

                        // Hacia atrás

                        IDcomienzo - ancho === cuadradoObjetivoID ||
                                                // Además verificamos que no haya nada delante!
                        IDcomienzo - ancho * 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho}"]`) ||
                        IDcomienzo - ancho * 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2}"]`) ||

                        IDcomienzo - ancho * 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3}"]`) ||


                        IDcomienzo - ancho * 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4}"]`) ||

                        IDcomienzo - ancho * 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 5}"]`) ||

                        IDcomienzo - ancho * 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + ancho}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 3}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 4}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 5}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - ancho * 6}"]`) ||

                        // Lado derecho

                        IDcomienzo + 1 === cuadradoObjetivoID ||
                                                // Además verificamos que no haya nada delante!
                        IDcomienzo + 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + 1}"]`) ||
                        IDcomienzo + 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + 1}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 2}"]`) ||

                        IDcomienzo + 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + 1}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 3}"]`) ||


                        IDcomienzo + 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + 1}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 3}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 4}"]`) ||

                        IDcomienzo + 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + 1}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 3}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 4}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 5}"]`) ||

                        IDcomienzo + 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo + 1}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 3}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 4}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 5}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo + 6}"]`) ||

                        // Lado izquierdo

                        IDcomienzo - 1 === cuadradoObjetivoID ||
                                                // Además verificamos que no haya nada delante!
                        IDcomienzo - 2 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - 1}"]`) ||
                        IDcomienzo - 3 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - 1}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 2}"]`) ||

                        IDcomienzo - 4 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - 1}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 3}"]`) ||


                        IDcomienzo - 5 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - 1}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 3}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 4}"]`) ||

                        IDcomienzo - 6 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - 1}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 3}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 4}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 5}"]`) ||

                        IDcomienzo - 7 === cuadradoObjetivoID && !document.querySelector(`[cuadrado-id="${IDcomienzo - 1}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 2}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 3}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 4}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 5}"]`) &&
                        !document.querySelector(`[cuadrado-id="${IDcomienzo - 6}"]`)
                        ){
                              return true;
                        }
                        break;
                        case "rey":
                            if(
                                IDcomienzo + 1 === cuadradoObjetivoID ||
                                IDcomienzo - 1 === cuadradoObjetivoID ||
                                IDcomienzo + ancho === cuadradoObjetivoID ||
                                IDcomienzo - ancho === cuadradoObjetivoID ||
                                IDcomienzo + ancho - 1 === cuadradoObjetivoID ||
                                IDcomienzo + ancho + 1 === cuadradoObjetivoID ||
                                IDcomienzo - ancho - 1 === cuadradoObjetivoID ||
                                IDcomienzo - ancho + 1 === cuadradoObjetivoID
                            ){
                                return true;
                            }
        }
}


function cambiarTurnoJugador(){
    if(jugadorEmpieza === 'negro'){
        invertirIDcuadrados();
        jugadorEmpieza = 'blanco';
        jugadorMostrar.textContent = 'blanco';
    }else{
        revertirIDcuadrados();
        jugadorEmpieza = 'negro';
        jugadorMostrar.textContent = 'negro';
    }
}


function invertirIDcuadrados(){
    // Seleccionamos todos los que tengan la clase cuadrado
    const todosCuadrados = document.querySelectorAll(".cuadrado");

    todosCuadrados.forEach((cuadrado,i) =>{
            cuadrado.setAttribute('cuadrado-id',(ancho * ancho -1) -i);
    })
}

function revertirIDcuadrados(){
    const todosCuadrados = document.querySelectorAll(".cuadrado");
    todosCuadrados.forEach((cuadrado,i) => cuadrado.setAttribute('cuadrado-id',i ));

}

function verificarGanador(){
                // Se crea un vector a partir de los reyes que se encuentren
    const reyes = Array.from(document.querySelectorAll('#rey'));

    console.log(reyes);

    if(!reyes.some(rey => reyes.firstChild.classList.contains('blanco'))){
        despleInfo.innerHTML = 'Ha ganado el jugador negro';
        const todosCuadrados = document.querySelectorAll('.cuadrado');

        todosCuadrados.forEach(cuadrado => cuadrado.firstChild?.setAttribute('dragable',false));
    }

    if(!reyes.some(rey => reyes.firstChild.classList.contains('negro'))){
            despleInfo.innerHTML = 'Ha ganado el jugador blanco';
            const todosCuadrados = document.querySelectorAll('.cuadrado');

            todosCuadrados.forEach(cuadrado => cuadrado.firstChild?.setAttribute('dragable',false));
        }

}