import { Fetch } from "./Fetch";


// interface events {
//   click: MouseEvent,
//   input: InputEvent,
//   blur: FocusEvent;
//   focus: FocusEvent;
//   change: Event;
//   submit: Event;
//   keydown: KeyboardEvent;
//   keyup: KeyboardEvent;
//   load: Event;
// };

interface dataObj {
  id: string,
  title: string,
  done: boolean
}

export class App {

  alert: HTMLElement | null;
  close: HTMLElement | null;
  input: HTMLInputElement | null;
  arrow: HTMLElement | null;
  table: HTMLTableSectionElement | null;
  

  constructor() {
    this.alert = document.querySelector(".alert");
    this.close = this.alert?.firstElementChild as HTMLElement | null;
    this.input = document.querySelector("input");
    this.arrow = document.querySelector(".arrow");
    this.table = document.querySelector("tbody");
  };

  init = async () => {
    //eventos
    //Cerrar la alerta en el botón con la X
    this.close?.addEventListener("click", () => {
      this.alert?.classList.add("dismissible");
    });
    //Impedir la recarga de la página y añadir una nueva tarea
    this.input?.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.code == "Enter" || e.code == "NumpadEnter") {
        e.preventDefault();
        this.addTask(this.input, this.idGenerator(), this.input!.value, this.alert);
      }
    });
    this.input?.addEventListener("input", () => {
      if (this.input?.value !== "" && !this.alert?.classList.contains("dismissible")) {
        this.alert?.classList.add("dismissible");
      }
    });
    //Añadir una nueva tarea
    this.arrow?.addEventListener("click", () => {
      this.addTask(this.input, this.idGenerator(), this.input!.value, this.alert);
    });
    // Fetch all tasks
    let tasks = await Fetch.getAll();
    // Render all tasks
    this.renderTasks(tasks as any);
  };

  // //prepara una plantilla HTML, y la actualiza con contenido dinámico
  generateRow = (id: string, title: string, done?: boolean): HTMLTableRowElement => {
    let newRow: HTMLTableRowElement = document.createElement("tr");
    newRow.setAttribute("id", id);
    title = done? `<del>${title}</del>` : title;
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
    newRow.firstElementChild?.firstElementChild?.addEventListener("click", (e: Event) => {
        this.crossOut(e as MouseEvent);
      });
    //Activar el modo edición desde la tarea
    newRow.firstElementChild?.lastElementChild?.addEventListener("focus", (e: Event) => {
      this.editModeOn(e as FocusEvent, true);
    });
    //Desactivar el modo edición
    newRow.firstElementChild?.lastElementChild?.addEventListener("blur", (e: Event) => {
      this.editModeOff(e as FocusEvent);
    });
    //Activar el modo edición desde el icono
    newRow.firstElementChild?.nextElementSibling?.firstElementChild?.lastElementChild?.addEventListener(
      "click",
      (e: Event) => {
        this.editModeOn(e as MouseEvent, false);
      }
    );
    //Eliminar la fila
    newRow.lastElementChild?.firstElementChild?.lastElementChild?.addEventListener(
      "click",
      (e: Event) => {
        this.removeRow(e as MouseEvent, false);
      }
    );
    return newRow;
  };

  renderTasks = (tasks: dataObj[]): void => {
    console.log(tasks.length);
    tasks.forEach((task: dataObj) => {
      this.table?.appendChild(this.generateRow(task.id, task.title, task.done));
    });
  };
  // //Tachado de tarea
  crossOut = (e: MouseEvent): void => {
    // let target: HTMLElement = e.target;
    // let task: HTMLInputElement = target?.nextElementSibling;
    let task = (e.target as HTMLElement).nextElementSibling as HTMLSpanElement;
    let text = task.innerHTML ?? ""; //Operador de fusión nula para proporcionar un valor predeterminado en caso de que sea null
    if (text.includes("<del>")) {
      text = (task.firstElementChild as HTMLElement)?.textContent ?? "";
      task.innerHTML = text;
      (task.parentNode?.parentNode as HTMLElement).setAttribute("data-completed", "false");
    } else {
      task.innerHTML = `<del>${text}</del>`;
      (task.parentNode?.parentNode as HTMLElement).setAttribute("data-completed", "true");
    }
  };
  //Añadir nueva tarea
  addTask = (input: HTMLInputElement | null, id: string, text: string, alert: HTMLElement | null): void => {
    if (input?.value.trim() === "") {
      input.value = "";
      alert?.classList.remove("dismissible");
    } else {
      text = input!.value;
      id = this.idGenerator();
      document.querySelector("tbody")?.appendChild(this.generateRow(this.idGenerator(), this.input!.value));
      input!.value = "";
    }
  };
  //Modo Edición
  editModeOn = (e: Event, onFocus: boolean): void => {
    let task: HTMLElement;
    if (onFocus) {
      task = e.currentTarget as HTMLElement;
    } else {
      task = ((((e.currentTarget as HTMLElement).parentNode as HTMLElement).parentNode as HTMLElement).previousElementSibling as HTMLElement).lastElementChild as HTMLElement;
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
  editModeOff = (e: Event): void => {
    let task = e.currentTarget as HTMLElement;
    if (task?.innerHTML === "") {
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
  removeRow = (e: Event, editionMode: boolean): void => {
    if (editionMode) {
      (((e.target as HTMLElement).parentNode as HTMLElement).parentNode as HTMLElement).remove();
    } else {
      // console.log(e.target.parentNode.parentNode.parentNode);
      ((((e.target as HTMLElement).parentNode as HTMLElement).parentNode as HTMLElement).parentNode as HTMLElement).remove();
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