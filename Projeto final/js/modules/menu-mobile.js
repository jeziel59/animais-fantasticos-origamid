import outsideClick from './outsideclick.js';

export default class MenuMobile {
  constructor(menuButton, menuList, events) {
  this.menuButton = document.querySelector(menuButton);
  this.menuList = document.querySelector(menuList);
  this.classActive = 'active'
  if (events === undefined) this.events = ["touchstart", "click"];
  else this.events = events;

  this.openMenu = this.openMenu.bind(this)
  }

  openMenu(event) {
    event.preventDefault()
    this.menuList.classList.add(this.classActive);
    this.menuButton.classList.add(this.classActive);
    outsideClick(this.menuList, this.events, () => { // ativa metodo externo de verificação de clique fora
      this.menuList.classList.remove(this.classActive);// caso seja fora remove as classes
      this.menuButton.classList.remove(this.classActive);
    });
  }

  addEventOpenMenu() {
      if (this.menuButton)this.events.forEach(evento => this.menuButton.addEventListener(evento, this.openMenu))
  }

  init() {
    if(this.menuButton && this.menuList){
    this.addEventOpenMenu()
  }
return this
  }
}
