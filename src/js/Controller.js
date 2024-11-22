import Card from "./Card";
import AjaxManager from "./API/AjaxManager";
import Modal from "./Modal";

export default class Controller {
  constructor(listEditor) {
    this.listEditor = listEditor;
    this.api = new AjaxManager();
  }

  init() {
    this.listEditor.bindToDOM();
    this.container = document.querySelector("#container");

    document.addEventListener("DOMContentLoaded", () => {
      this.api.getAllTickets(
        this.renderingStartedList.bind(this) // что-то не то((
      );
    });
    this.addSubscribe(this.container);
  }

  addSubscribe(element) {
    element.addEventListener("click", this.onClickAddCard.bind(this));
    element.addEventListener("click", this.onClickOpenForm.bind(this));
    element.addEventListener("click", this.completionField.bind(this));
    element.addEventListener("input", this.completionField.bind(this));
    element.addEventListener("click", this.onClickDeleteCard.bind(this));
    element.addEventListener("click", this.onClickRemoveCard.bind(this));
    element.addEventListener("click", this.onClickSaveCard.bind(this));
    element.addEventListener("click", this.onClickName.bind(this));
    element.addEventListener("click", this.onClickCheckedStatus.bind(this));
  }

  onClickAddCard(e) {
    // добавление новой карточки
    if (!e.target.classList.contains("ticket__add-button")) {
      return;
    }

    e.preventDefault();

    this.ticketName = document.querySelector(".input__ticket-name");
    this.ticketDescription = document.querySelector(".form-text");

    const isValidName = this.validityFields(this.ticketName);

    if (!isValidName) {
      return;
    }

    const data = {
      name: this.ticketName.value,
      description: this.ticketDescription.value,
    };

    this.api.createTicket(data, (response) => {
      this.renderingCard(response);
    });
    this.modal.closeModalForm();
  }

  onClickCheckedStatus(e) {
    if (
      e.target.classList.contains("checkbox-wrapper") ||
      e.target.classList.contains("status__pic")
    ) {
      this.parentCard = e.target.closest(".tickets__card");

      const data = { id: this.parentCard.dataset.id };
      this.api.isStatuschecked(data.id, (response) => {
        this.isChecked(response, this.parentCard);
      });
    }
  }

  onClickName(e) {
    e.preventDefault();
    if (!e.target.classList.contains("tickets__short-name")) {
      return;
    }
    this.parentCard = e.target.closest(".tickets__card");

    const data = { id: this.parentCard.dataset.id };

    this.api.getIndex(data.id, (response) => {
      this.showDescription(response, this.parentCard);
    });
  }

  showDescription(data, parent) {
    const boxDescription = parent.querySelector(".tickets__full-name");
    if (boxDescription) {
      boxDescription.textContent = data.description;

      boxDescription.parentElement.classList.toggle("visual-none");
      return;
    }
    const form = document.querySelector(".form-text");
    if (form) {
      form.value = data.description;
    }
  }

  isChecked(status, parent) {
    const check = parent.querySelector(".status__pic");

    if (status === true) {
      check.classList.remove("hidden");
      parent.dataset.status = true;
    } else {
      check.classList.add("hidden");
      parent.dataset.status = false;
    }
  }

  renderingStartedList(data = []) {
    if (!data.length) {
      return;
    }

    data.forEach((elem) => {
      const ticket = new Card(elem);
      ticket.init();
      const checkedItem = Array.from(
        document.querySelectorAll(".tickets__short-name")
      ).find((o) => o.textContent === elem.name);

      this.isChecked(elem.status, checkedItem.previousElementSibling);
    });

    if (document.querySelector(".tickets__card")) {
      document.querySelector(".board").classList.remove("hidden");
      document.querySelector(".greeting__title").classList.add("hidden");
    }
  }

  completionField(e) {
    // заполнеие полей и удаление подсказок пр этом
    e.preventDefault();
    if (e.target.classList.contains("form-text"))
      this.newDescription = document.querySelector(".form-text").value;
    if (e.target.classList.contains("input-tooltip"))
      this.newName = document.querySelector(".input__ticket-name");
    if (e.target.parentElement.querySelector(".tooltip-active")) {
      e.target.nextElementSibling.remove();
    }

    if (e.target.parentElement.querySelector(".tooltip-active")) {
      e.target.nextElementSibling.remove();
    }
  }

  validityFields(field) {
    // проверка соответствия шаблону, добавление подсказки
    const templateTooltip = document.createElement("span");
    templateTooltip.textContent = "*Вы пропустили обязательное поле";
    templateTooltip.classList.add("tooltip-active");

    if (
      field.parentElement.lastElementChild.classList.contains("tooltip-active")
    ) {
      return;
    }

    if (field.classList.contains("input__ticket-name") && field.value === "") {
      field.insertAdjacentElement("afterend", templateTooltip);
      templateTooltip.tooltipText = "Заполните поле";
      return false;
    }

    return true;
  }

  onClickOpenForm(e) {
    // открытие формы
    e.preventDefault();

    if (
      // если форма для добавления или редактирования
      e.target.classList.contains("add__button") ||
      e.target.classList.contains("ticket__edit")
    ) {
      Array.from(document.querySelectorAll(".full__name-wrapper")).forEach(
        (elem) => elem.classList.add("visual-none")
      );

      this.modal = new Modal(this.container);
      if (document.querySelector(".modal")) {
        return;
      }
      this.modal.redrawModalForm();
      this.modal.redrawInput();
    }

    if (e.target.classList.contains("ticket__edit")) {
      this.onEditValueButton("Сохранить", "ticket__save-button");

      this.parentCard = e.target.closest(".tickets__card");
      this.name = this.parentCard.querySelector(".tickets__short-name");

      document.querySelector(".input__ticket-name").value =
        this.name.textContent;

      const data = { id: this.parentCard.dataset.id };

      this.api.getIndex(data.id, (response) => {
        this.showDescription(response, document.querySelector(".form-text"));
      });
    }
  }

  onClickSaveCard(e) {
    // сохранить изменение в карточке
    e.preventDefault();
    if (!e.target.classList.contains("ticket__save-button")) {
      // поправить названия классов
      return;
    }

    if (!this.newDescription && !this.newName) {
      this.modal.closeModalForm();
      return;
    }

    if (this.newName) {
      const isValidName = this.validityFields(this.newName);
      if (!isValidName) return;
      this.shortName = this.newName.value;
    }
    if (this.newDescription && !this.newName) {
      this.shortName = this.name.textContent;
    }

    const parent = this.name.parentElement.closest(".tickets__card");
    const fullName = parent.querySelector(".tickets__full-name");

    const data = {
      id: parent.dataset.id,
      name: this.shortName,
      description:
        this.newDescription || document.querySelector(".form-text").value,
    };

    this.api.modification(data, (response) => {
      this.savingChanges(this.name, data.name, fullName, data.description);
    });
  }

  onClickDeleteCard(e) {
    // Удалить карточку из списка
    e.preventDefault();

    if (!e.target.classList.contains("ticket__del")) {
      return;
    }
    Array.from(document.querySelectorAll(".full__name-wrapper")).forEach(
      (elem) => elem.classList.add("visual-none")
    );

    this.modal = new Modal(this.container);
    if (!document.querySelector(".modal")) {
      this.modal.redrawModalForm();
      this.onEditValueButton("Удалить", "ticket__remove-button");
      this.parentCard = e.target.closest(".tickets__card");

      this.modal.showDescription("Удалить задачу  из списка?");
    }
  }

  onClickRemoveCard(e) {
    e.preventDefault();
    if (!e.target.classList.contains("ticket__remove-button")) {
      // поправить названия классов
      return;
    }

    const data = { id: this.parentCard.dataset.id };

    this.api.delete(data.id, (response) => {
      this.removeTicket(this.parentCard);
    });
  }

  onEditValueButton(value, type) {
    // изменение названий кнопок на форме
    const buttonSave = document.querySelector(".ticket__add-button");
    buttonSave.classList.remove("ticket__add-button");
    buttonSave.classList.add(type);
    buttonSave.textContent = value;
  }

  renderingCard(data) {
    // добавление разметки карточки
    const card = new Card(data);
    card.init();

    if (document.querySelector(".tickets__card")) {
      document.querySelector(".board").classList.remove("hidden");
      document.querySelector(".greeting__title").classList.add("hidden");
    }

    return card;
  }

  removeTicket(item) {
    item.remove();
    this.modal.closeModalForm();

    if (!document.querySelector(".tickets__card")) {
      document.querySelector(".board").classList.add("hidden");
      document.querySelector(".greeting__title").classList.remove("hidden");
    }
  }

  savingChanges(nameBox, newName, descriptionBox, newDescription) {
    // сохранение изменений

    nameBox.textContent = newName;
    descriptionBox.textContentt = newDescription;
    this.modal.closeModalForm();
  }
}