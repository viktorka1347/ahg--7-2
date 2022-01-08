import runRequest from '../api/request';

export default class EditForm {
    constructor(parentWidget) {
        this.parentWidget = parentWidget;
        this.ticket = {};
    }

    static get ctrlId() {
        return {
            form: 'edit-form',
            title: 'form-title',
            name: 'name',
            description: 'description',
            ok: 'button-ok',
            cancel: 'button-cancel',
        };
    }

    static get markup() {
        return `
      <form>
        <label data-id="${this.ctrlId.title}">Добавить тикет</label>
        <label>Краткое описание<input type="text" name="name" data-id="${this.ctrlId.name}" required></label>
        <label>Подробное описание</label>
        <textarea name="description" data-id="${this.ctrlId.description}" rows="3" required></textarea>
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

    static get nameSelector() {
        return `[data-id=${this.ctrlId.name}]`;
    }

    static get descriptionSelector() {
        return `[data-id=${this.ctrlId.description}]`;
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
        this.name = this.form.querySelector(this.constructor.nameSelector);
        this.description = this.form.querySelector(
            this.constructor.descriptionSelector,
        );
        this.ok = this.form.querySelector(this.constructor.okSelector);

        this.form.addEventListener('submit', this.onSubmit.bind(this));
        this.form.addEventListener('reset', this.onReset.bind(this));
        this.ok.addEventListener('click', this.validation.bind(this));
    }

    async onSubmit(event) {
        event.preventDefault();

        const params = {
            data: {
                method: 'createTicket',
                id: this.id,
                status: this.status,
                name: this.name.value,
                description: this.description.value,
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

    validation() {
        this.name.value = this.name.value.trim();
        this.description.value = this.description.value.trim();
    }

    async show(ticket) {
        if (ticket) {
            this.title.textContent = 'Изменить тикет';
            this.id = ticket.dataset.index;

            const status = ticket.querySelector(
                this.parentWidget.constructor.statusSelector,
            );
            this.status = status.textContent === '\u2713' ? '1' : '';

            const name = ticket.querySelector(
                this.parentWidget.constructor.nameSelector,
            );
            this.name.value = name.textContent;
            this.description.value = await this.parentWidget.constructor.getDescription(this.id);
        } else {
            this.title.textContent = 'Добавить тикет';
            this.id = '';
            this.status = '';
            this.name.value = '';
            this.description.value = '';
        }

        this.container.classList.add('modal-active');
    }
}