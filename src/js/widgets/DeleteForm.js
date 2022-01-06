import runRequest from '../api/request';

export default class DeleteForm {
  constructor(parentWidget) {
    this.parentWidget = parentWidget;
  }

  static get ctrlId() {
    return {
      form: 'delete-form',
      title: 'form-title',
      cancel: 'button-cancel',
      ok: 'button-ok',
    };
  }

  static get markup() {
    return `
      <form>
        <label data-id="${this.ctrlId.title}">Удалить тикет</label>
        <label>Вы уверены, что хотите удалить тикет? Это действие необратимо.</label>
        <div class="buttons">
          <button class="help-desk-button" type="reset" data-id="${this.ctrlId.cancel}">Отмена</button>
          <button class="help-desk-button" type="submit" data-id="${this.ctrlId.ok}">Ok</button>
        </div>      
      </form>
    `;
  }

  static get formSelector() {
    return `[data-widget=${this.ctrlId.form}]`;
  }

  static get titleSelector() {
    return `[data-id=${this.ctrlId.title}]`;
  }

  static get cancelSelector() {
    return `[data-id=${this.ctrlId.cancel}]`;
  }

  static get okSelector() {
    return `[data-id=${this.ctrlId.ok}]`;
  }

  bindToDOM() {
    this.container = document.createElement('div');
    this.container.className = 'help-desk-modal-form';
    this.container.dataset.widget = this.constructor.ctrlId.form;
    this.container.innerHTML = this.constructor.markup;

    document.body.appendChild(this.container);

    this.form = this.container.querySelector('form');

    this.title = this.form.querySelector(this.constructor.titleSelector);

    this.form.addEventListener('submit', this.onSubmit.bind(this));
    this.form.addEventListener('reset', this.onReset.bind(this));
  }

  async onSubmit(event) {
    event.preventDefault();

    const params = {
      data: {
        method: 'deleteTicket',
        id: this.id,
      },
      responseType: 'json',
      method: 'POST',
    };

    try {
      this.parentWidget.redraw(await runRequest(params));
    } catch (error) {
      alert(error);
    }

    this.onReset();
  }

  onReset() {
    this.container.classList.remove('modal-active');
  }

  show(ticket) {
    this.id = ticket.dataset.index;
    this.container.classList.add('modal-active');
  }
}
