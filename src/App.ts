import { Fetch } from "./Fetch";


interface events {
  click: MouseEvent,
  input: InputEvent,
  blur: FocusEvent;
  focus: FocusEvent;
  change: Event;
  submit: Event;
  keydown: KeyboardEvent;
  keyup: KeyboardEvent;
  load: Event;
};

export class App {

  alert:HTMLElement | null;
  close:HTMLElement | null;
  input:HTMLInputElement | null;
  arrow:HTMLElement | null;
  table:HTMLTableSectionElement | null;
  

  constructor() {
    this.alert = document.querySelector(".alert");
    this.close = this.alert.firstElementChild as HTMLElement | null;
    this.input = document.querySelector("input");
    this.arrow = document.querySelector(".arrow");
    this.table = document.querySelector("tbody");
  }
  init = async () => {
    //eventos
    //Cerrar la alerta en el botón con la X
    this.close.addEventListener("click", () => {
      this.alert.classList.add("dismissible");
    });
    //Impedir la recarga de la página y añadir una nueva tarea
    this.input.addEventListener("keydown", (event: KeyboardEvent) => {
      if (e.code == "Enter" || e.code == "NumpadEnter") {
        e.preventDefault();
        addTask(input, id, text, alert);
      }
    });
    this.input.addEventListener("input", (event: InputEvent) => {
      if (this.input.value !== "" && !this.alert.classList.contains("dismissible")) {
        this.alert.classList.add("dismissible");
      }
    });
    //Añadir una nueva tarea
    this.arrow.addEventListener("click", () => {
      this.addTask(this.input, this.idGenerator(), this.input.value, this.alert);
    });
    // Fetch all tasks
    let tasks = await Fetch.getAll();
    // Render all tasks
    this.renderTasks(tasks);
  };
  // //prepara una plantilla HTML, y la actualiza con contenido dinámico
  generateRow = (id: number, title: string, done: boolean): HTMLTableRowElement => {
    let newRow: HTMLTableRowElement = document.createElement("tr");
    newRow.setAttribute("id", id);
    title = done ? `<del>${title}</del>` : title;
    newRow.innerHTML = `
<td>
  <i class="fa-solid fa-circle-check"></i>
  <span contenteditable="true" class="task">${title}</span>
</td>
<td>
  <span class="fa-stack fa-2x">
    <i class="fa-solid fa-square fa-stack-2x"></i>
    <i class="fa-solid fa-stack-1x fa-pencil fa-inverse"></i>
  </span>
</td>
<td>
  <span class="fa-stack fa-2x">
    <i class="fa-solid fa-square fa-stack-2x"></i>
    <i class="fa-solid fa-stack-1x fa-trash fa-inverse"></i>
  </span>
</td>
  `;
    //Tachar una tarea realizada
    newRow.firstElementChild?.firstElementChild?.addEventListener(
      "click",
      (event: MouseEvent) => {
        this.crossOut(e);
      }
    );
    //Activar el modo edición desde la tarea
    newRow.firstElementChild?.lastElementChild?.addEventListener("focus", (event: FocusEvent) => {
      this.editModeOn(e, true);
    });
    //Desactivar el modo edición
    newRow.firstElementChild?.lastElementChild?.addEventListener("blur", (event: FocusEvent) => {
      this.editModeOff(e);
    });
    //Activar el modo edición desde el icono
    newRow.firstElementChild?.nextElementSibling?.firstElementChild?.lastElementChild?.addEventListener(
      "click",
      (event: MouseEvent) => {
        this.editModeOn(e, false);
      }
    );
    //Eliminar la fila
    newRow.lastElementChild?.firstElementChild?.lastElementChild?.addEventListener(
      "click",
      (event: MouseEvent) => {
        this.removeRow(e, false);
      }
    );
    return newRow;
  };
  renderTasks = (tasks) => {
    console.log(tasks.length);
    tasks.forEach((task) => {
      this.table.appendChild(this.generateRow(task.id, task.title, task.done));
    });
  };
  // //Tachado de tarea
  crossOut = (e) => {
    let task = e.target.nextElementSibling;
    let text = task.innerHTML;
    if (text.includes("<del>")) {
      text = task.firstElementChild.textContent;
      task.innerHTML = text;
      task.parentNode.parentNode.setAttribute("data-completed", "false");
    } else {
      task.innerHTML = `<del>${text}</del>`;
      task.parentNode.parentNode.setAttribute("data-completed", "true");
    }
  };
  //Añadir nueva tarea
  addTask = (input: string, idGenerator: number, text: string, alert: HTMLElement | null) => {
    if (input.value.trim() === "") {
      input.value = "";
      alert.classList.remove("dismissible");
    } else {
      text = input.value;
      id =
        parseInt(
          document.querySelector("tbody")?.lastElementChild?.getAttribute("id")
        ) + 1 || 0;
      document.querySelector("tbody").appendChild(this.generateRow(id, text));
      input.value = "";
    }
  };
  //Modo Edición
  editModeOn = (e, onFocus) => {
    let task;
    if (onFocus) {
      task = e.currentTarget;
    } else {
      task =
        e.currentTarget.parentNode.parentNode.previousElementSibling
          .lastElementChild;
      task.focus();
    }
    // console.log(task);
    task.classList.add("editable");
    document.addEventListener("keydown", (e) => {
      if (e.code == "Enter" || e.code == "NumpadEnter" || e.code == "Escape") {
        task.blur();
      }
    });
  };
  editModeOff = (e) => {
    let task = e.currentTarget;
    if (task.innerHTML === "") {
      this.removeRow(e, true);
    } else {
      task.classList.remove("editable");
      task.innerHTML = this.clearWhitespaces(task.innerHTML);
      if (task.innerHTML === "") {
        this.removeRow(e, true);
      }
    }
  };
  //Eliminación de tarea
  removeRow = (e, editionMode) => {
    if (editionMode) {
      e.target.parentNode.parentNode.remove();
    } else {
      // console.log(e.target.parentNode.parentNode.parentNode);
      e.target.parentNode.parentNode.parentNode.remove();
    }
  };
  //Eliminación de espacios en blanco
  clearWhitespaces = (text: string) => {
    return text.replace(new RegExp(/&nbsp;/, "g"), "").trim();
  };
  idGenerator = () => {
   // generate random hex string
    return Math.floor(Math.random() * 16777215).toString(16);
  }
}