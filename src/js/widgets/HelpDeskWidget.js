import EditForm from "./EditForm";
import DeleteForm from "./DeleteForm";
import runRequest from "../api/request";

export default class HelpDeskWidget {
    constructor(parentEl) {
        this.parentEl = parentEl;
        this.productList = [];
    }

    static get ctrlId() {
        return {
            widget: "help-desk-widget",
            add: "button-add",
            tickets: "tickets",
            ticket: "ticket",
            status: "button-status",
            text: "text",
            name: "name",
            description: "description",
            created: "created",
            edit: "button-edit",
            delete: "button-delete",
        };
    }

    static get markup() {
        return `
      <div class="header">
        <button class="help-desk-button" data-id="${this.ctrlId.add}">Добавить тикет</button>
      </div>
      <div data-id="${this.ctrlId.tickets}">
      </div>
    `;
    }

    static get widgetSelector() {
        return `[data-widget=${this.ctrlId.widget}]`;
    }

    static get addSelector() {
        return `[data-id=${this.ctrlId.add}]`;
    }

    static get ticketsSelector() {
        return `[data-id=${this.ctrlId.tickets}]`;
    }

    static get ticketSelector() {
        return `[data-id=${this.ctrlId.ticket}]`;
    }

    static get statusSelector() {
        return `[data-id=${this.ctrlId.status}]`;
    }

    static get textSelector() {
        return `[data-id=${this.ctrlId.text}]`;
    }

    static get nameSelector() {
        return `[data-id=${this.ctrlId.name}]`;
    }

    static get descriptionSelector() {
        return `[data-id=${this.ctrlId.description}]`;
    }

    static get createdSelector() {
        return `[data-id=${this.ctrlId.created}]`;
    }

    static get editSelector() {
        return `[data-id=${this.ctrlId.edit}]`;
    }

    static get deleteSelector() {
        return `[data-id=${this.ctrlId.delete}]`;
    }

    async bindToDOM() {
        this.widget = document.createElement("div");
        this.widget.dataset.widget = this.constructor.ctrlId.widget;
        this.widget.innerHTML = this.constructor.markup;
        this.parentEl.appendChild(this.widget);

        this.addButton = this.widget.querySelector(this.constructor.addSelector);
        this.tickets = this.widget.querySelector(this.constructor.ticketsSelector);

        this.editForm = new EditForm(this);
        this.editForm.bindToDOM();
        this.deleteForm = new DeleteForm(this);
        this.deleteForm.bindToDOM();

        this.addButton.addEventListener("click", this.onAddButtonClick.bind(this));
        this.tickets.addEventListener("click", this.onTicketsClick.bind(this));

        const params = {
            data: {
                method: "allTickets",
            },
            responseType: "json",
            method: "GET",
        };

        try {
            this.redraw(await runRequest(params));
        } catch (error) {
            alert(error);
        }
    }

    async onAddButtonClick(event) {
        event.preventDefault();
        await this.editForm.show();
    }

    async onTicketsClick(event) {
        event.preventDefault();

        const ticket = event.target.closest(this.constructor.ticketSelector);

        switch (event.target.dataset.id) {
            case this.constructor.ctrlId.status:
                await this.invertStatus(ticket);
                break;

            case this.constructor.ctrlId.edit:
                await this.editForm.show(ticket);
                break;

            case this.constructor.ctrlId.delete:
                this.deleteForm.show(ticket);
                break;

            default:
                await this.constructor.invertVisibleDescription(ticket);
        }
    }

    redraw(response) {
        this.tickets.innerHTML = response.reduce(
            (str, { id, status, created }) => `
      ${str}
      <div data-id="${this.constructor.ctrlId.ticket}" data-index="${id}">
        <button class="help-desk-ticket-button" data-id="${
          this.constructor.ctrlId.status
        }">${status ? "&#x2713;" : "&#x00A0;"}</button>
        <div class="text" data-id="${this.constructor.ctrlId.text}">
          <p data-id="${this.constructor.ctrlId.name}"></p>
        </div>
        <p data-id="${
          this.constructor.ctrlId.created
        }">${this.constructor.dateToString(created)}</p>
        <button class="help-desk-ticket-button" data-id="${
          this.constructor.ctrlId.edit
        }">&#x270E;</button>
        <button class="help-desk-ticket-button" data-id="${
          this.constructor.ctrlId.delete
        }">&#x2716;</button>
      </div>
    `,
            ""
        );

        this.tickets
            .querySelectorAll(this.constructor.nameSelector)
            .forEach((item, i) => {
                const name = item;
                name.textContent = response[i].name;
            });
    }

    static dateToString(timestamp) {
        const date = new Date(timestamp);

        const result = `0${date.getDate()}.0${date.getMonth() + 1}.0${
      date.getFullYear() % 100
    } 0${date.getHours()}:0${date.getMinutes()}`;

        return result.replace(/\d(\d{2})/g, "$1");
    }

    static async getDescription(id) {
        const params = {
            data: {
                method: "ticketById",
                id,
            },
            responseType: "text",
            method: "GET",
        };

        try {
            return await runRequest(params);
        } catch (error) {
            alert(error);
            return null;
        }
    }

    async invertStatus(ticket) {
        const id = ticket.dataset.index;
        const status = ticket.querySelector(this.constructor.statusSelector);
        const name = ticket.querySelector(this.constructor.nameSelector);

        const params = {
            data: {
                method: "createTicket",
                id,
                status: status.textContent === "\u2713" ? "" : "1",
                name: name.textContent,
                description: await this.constructor.getDescription(id),
            },
            responseType: "json",
            method: "POST",
        };

        try {
            this.redraw(await runRequest(params));
        } catch (error) {
            alert(error);
        }
    }

    static async invertVisibleDescription(ticket) {
        const textContainer = ticket.querySelector(this.textSelector);
        let description = ticket.querySelector(this.descriptionSelector);

        if (description) {
            textContainer.removeChild(description);
            description = null;
        } else {
            description = document.createElement("p");
            description.dataset.id = this.ctrlId.description;
            textContainer.appendChild(description);

            description.textContent = await this.getDescription(ticket.dataset.index);
        }
    }
}