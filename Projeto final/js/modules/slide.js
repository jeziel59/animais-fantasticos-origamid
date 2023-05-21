import debounce from './debounce.js'

export class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.dist = { finalPosition: 0, startX: 0, movement: 0 }; // objeto que armazena os dados do movimento do mouse
    this.activeClass = "active";
    this.changeEvent = new Event('changeEvent') //criando novo evento
  }
  //Metodo: adiciona transição caso true
  transition(active) {
    this.slide.style.transition = active ? "transform .3s" : ""; // caso true, adiciona o style, caso false passa vazio
  }

  //1° Metodo: Os seguintes eventos, inicia metodo de start ou end 
  addSlideEvent() {
    this.wrapper.addEventListener("mousedown", this.onStart); // 
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
    this.wrapper.addEventListener("touchend", this.onEnd);
  }
  //

  //2° Metodo: metodo que salva no objeto onde foi o clique, e aciona o metodo de medir a distancia de movimento
  onStart(event) {
    let moveType; // variavel que irá receber o tipo de movimento com base da resposta de if e else
    if (event.type === "mousedown") { // caso o tipo de clique..
      event.preventDefault();// previne o padrão
      this.dist.startX = event.clientX; //event.clientX metodo que informa o local horizontal exato do clique // armazena no objeto dist.startX o local do clique
      moveType = "mousemove"; // então o moveType recebe o tipo de movimento de mouse
    } else { // caso o tipo de clique seja touch
      this.dist.startX = event.changedTouches[0].clientX; // no metodo de touch, selecionamos a propriedade correspondente a localização do clique
      moveType = "touchmove"; // então o moveType recebe o tipo de movimento de toque
    }
    this.wrapper.addEventListener(moveType, this.onMove); // então o wrapper(fundo) recebe evento com a variavel como parametro de evento, com callback o metodode movimento
    this.transition(false);
  }
  //

  //3° Metodo: recebe o movimento do mouse, e ativa metodo de calculo da quantidade de movimento
  onMove(event) {// recebendo como parametro mousemove ou touchmove
    const pointerPosition = event.type === "mousemove" ? event.clientX : event.changedTouches[0].clientX; //pointerPosition recebe o local atual do mouse
    const finalPosition = this.updatePosition(pointerPosition); //ativa o metodo updatePosition então finalPosition recebe o resultado de calculo do metodo updatePosition
    this.moveSlide(finalPosition); // Ativa o moveSlide como parametro o movimento feito pelo mouse
  }
   updatePosition(clientX) {// Calcula o movimento do mouse
    this.dist.movement = (this.dist.startX - clientX) * 1.6; //this.dist.startX(clique inical) - clientX(parametro recebuido do movimento do mouse) - algum movimento extra
    return this.dist.finalPosition - this.dist.movement; // retorna para finalPosition a quantidade de movimento
  }
  //

  //4° Metodo: Move o slide de acordo com o movimento do mouse passado como parametro durante o clique
  moveSlide(distX) {
    this.dist.movePosition = distX; // salva o movimento no objeto dist.movePosition
    this.slide.style.transform = `translate3d(${distX}px, 0, 0)`; // adiciona no estilo da class slide o transform translate 3d para movimentar o slide
  }
  //

  //5° Metodo
  onEnd() {
    const moveType = event.type === "mouseup" ? "mousemove" : "touchmove";
    this.wrapper.removeEventListener(moveType, this.onMove);
    this.dist.finalPosition = this.dist.movePosition;
    this.transition(true);
    this.changeSlideOnEnd();
  }

  changeSlideOnEnd() {
    if (this.dist.movement > 120 && this.index.next !== undefined) {
      this.activeNextSlide();
    } else if (this.dist.movement < -120 && this.index.prev !== undefined) {
      this.activePrevSlide();
    } else {
      this.changeSlide(this.index.active);
    }
  }


  //slide config

  slidePosition(slide) {
    // recebe o elemento
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2; // fundo menos a largura do slide dividido por duas margens
    return -(slide.offsetLeft - margin); // retorna o offset left(zero) + a margem(consta como - pois deve ser negativo)
  }

  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      // desestrutura o slide, e passa o map para retornar outra array
      const position = this.slidePosition(element);
      return {
        position,
        element,
      };
    });
  }

  slidesIndexNav(index) {
    const last = this.slideArray.length - 1;
    this.index = {
      prev: index ? index - 1 : undefined, // quando não houver mais index, da undefined
      active: index,
      next: index === last ? undefined : index + 1, // caso for o last(length da array de li, da undefined, caso não, index+1)
    };
  }

  changeSlide(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(activeSlide.position);
    this.slidesIndexNav(index);
    this.dist.finalPosition = activeSlide.position; // salva a posição atual no objeto de posições
    this.changeActiveClass();
    this.wrapper.dispatchEvent(this.changeEvent) //sempre que mudar slide, ativa o metodo
  }

  // navegação

  activePrevSlide() {
    if (this.index.prev !== undefined) {
      this.changeSlide(this.index.prev);
    }
  }
  activeNextSlide() {
    if (this.index.next !== undefined) {
      this.changeSlide(this.index.next);
    }
  }

  changeActiveClass() {
    this.slideArray.forEach((item) =>
      item.element.classList.remove(this.activeClass)
    );
    this.slideArray[this.index.active].element.classList.add(this.activeClass);
  }

  onResize() {
    setTimeout(() => {
    this.slidesConfig();
    this.changeSlide(this.index.active);
    },1000)

  }
  addResizeEvent() {
    window.addEventListener("resize", this.onResize);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onResize = debounce(this.onResize.bind(this)), 200; // debounce, enquanto estiver mexendo não executa, somente ao soltar
    this.activePrevSlide = this.activePrevSlide.bind(this)
    this.activeNextSlide = this.activeNextSlide.bind(this)
  }
  init() {
    this.bindEvents();
    this.transition(true);
    this.addSlideEvent();
    this.slidesConfig();
    this.addResizeEvent()
    this.changeSlide(0)
    return this;
  }
}

export default class SlideNav extends Slide {
  constructor(slide, wrapper){
    super(slide, wrapper)
    this.bindControlEvents()
  }
addArrow(prev, next) {
  this.prevElement = document.querySelector(prev)
  this.nextElement = document.querySelector(next)
  this.addArrowEvent()
}

addArrowEvent() {
  this.prevElement.addEventListener('click', this.activePrevSlide)
  this.nextElement.addEventListener('click', this.activeNextSlide)
}

createControl() {
  const control = document.createElement('ul') //cria uma ul
  control.dataset.control = 'slide' // com a tag data-control
  this.slideArray.forEach((item, index) => { // para ca item do slide
    control.innerHTML += `<li><a href="#slide${index + 1}">${index + 1}</a></li>`  // é criado dentro da ul um li com href contendo o index // o +1 é apenas para começar por 1
  })
  this.wrapper.appendChild(control)
return control
}
eventControl(item,index) {
  item.addEventListener('click', (event) => {
    event.preventDefault()
    this.changeSlide(index)
  })
  this.wrapper.addEventListener('changeEvent', this.activeControlItem) // event é o evento criado, sempre que changeSlide for ativado, ativa esse event, e ativa o callback
}

activeControlItem(){
  this.controlArray.forEach(item => item.classList.remove(this.activeClass))
  this.controlArray[this.index.active].classList.add(this.activeClass)
}

addControl(customControl) {
  this.control = document.querySelector(customControl) || this.createControl() //caso nao seja passado, cria controle
  this.controlArray = [...this.control.children] //desestrutura o nodelist do elemento, e retorna array com as li
  this.controlArray.forEach(this.eventControl)
  this.activeControlItem()
}

bindControlEvents() {
  this.eventControl = this.eventControl.bind(this)
  this.activeControlItem = this.activeControlItem.bind(this)
}
}

