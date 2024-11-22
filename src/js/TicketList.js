export default class TicketsList {
    constructor(container) {
      this.container = container;
    }
  
    static get markup() {
      return `
        <div class="principal__button">
            <button class="add__button">+</button>
        </div>
        <div class="list-wrapper">
            <h2 class="list__title">HelpDesk</h2>
            <span class="greeting__title">Ваш список пока Пруст...</span>
            <div class="board hidden"></board>
        </div>
  `;
    }
  
    bindToDOM() {
      this.container.insertAdjacentHTML("afterbegin", this.constructor.markup);
    }
  }