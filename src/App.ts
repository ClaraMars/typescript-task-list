import { Fetch, dataObj, dataObjUpdate } from "./Fetch.js";

// interface dataObj {
//   id: string,
//   title: string,
//   done: boolean
// }

export class App {
  alert: HTMLDivElement | null;
  close: HTMLSpanElement | null;
  input: HTMLInputElement | null;
  arrow: HTMLDivElement | null;
  table: HTMLTableSectionElement | null;
  allTasks: dataObj[] | null;
  buttons: NodeListOf<HTMLButtonElement> | null;

  constructor() {
    this.alert = document.querySelector(".alert");
    this.close = this.alert?.firstElementChild as HTMLElement | null;
    this.input = document.querySelector("input");
    this.arrow = document.querySelector(".arrow");
    this.table = document.querySelector("tbody");
    this.allTasks = null;
    this.buttons = document.querySelectorAll(
      "header button"
    ) as NodeListOf<HTMLButtonElement> | null;
  }

  init = async () => {
    //EVENTOS

    //Cerrar la alerta en el botón con la X
    this.close?.addEventListener("click", () => {
      this.alert?.classList.add("dismissible");
    });

    //Impedir la recarga de la página y añadir una nueva tarea
    this.input?.addEventListener(
      "keydown",
      async (e: KeyboardEvent): Promise<void> => {
        if (e.code == "Enter" || e.code == "NumpadEnter") {
          e.preventDefault();
          this.addTask(
            this.input,
            this.idGenerator(),
            this.input!.value,
            this.alert
          );
          // let createTask: dataObj = await Fetch.create({id: this.idGenerator(), title: this.input!.value, isDone: false});
          // this.renderTasks([createTask]);
        }
      }
    );

    //Añadir una nueva tarea
    this.arrow?.addEventListener("click", async (): Promise<void> => {
      this.addTask(
        this.input,
        this.idGenerator(),
        (this.input as HTMLInputElement)?.value,
        this.alert
      );
      // let createTask: dataObj = await Fetch.create({id: this.idGenerator(), title: this.input!.value, isDone: false});
      // this.renderTasks([createTask]);
    });

    //Tarea vacía alerta roja
    this.input?.addEventListener("input", (): void => {
      if (
        this.input?.value !== "" &&
        !this.alert?.classList.contains("dismissible")
      ) {
        this.alert?.classList.add("dismissible");
      }
    });

    this.buttons?.forEach((button: HTMLButtonElement, _, allButtons): void => {
      button.addEventListener("click", async (): Promise<void> => {
        allButtons.forEach((button: HTMLButtonElement): void => {
          if (button.classList.contains("active")) {
            button.classList.remove("active");
          }
        });
        button.classList.add("active");
        switch (button.textContent) {
          case "All":
            if (this.allTasks !== null) {
              this.renderTasks(this.allTasks);
            }
            break;
          case "Done":
            if (this.allTasks !== null) {
              this.renderTasks(
                this.allTasks?.filter((task: dataObj): boolean => task.isDone)
              );
            }
            break;
          case "Undone":
            if (this.allTasks !== null) {
              this.renderTasks(
                this.allTasks?.filter((task: dataObj): boolean => !task.isDone)
              );
            }
            break;
        }
      });
    });

    // Fetch all tasks
    this.allTasks = await Fetch.getAll();
    // Render all tasks
    this.renderTasks(this.allTasks);
  };

  // filterTasks = (): void => {

  //Prepara una plantilla HTML, y la actualiza con contenido dinámico
  generateRow = (
    id: string,
    title: string,
    isDone?: boolean
  ): HTMLTableRowElement => {
    let newRow: HTMLTableRowElement = document.createElement("tr");
    newRow.setAttribute("id", id);
    title = isDone ? `<del>${title}</del>` : title;
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
      async (e: Event) => {
        this.crossOut(e as MouseEvent);
        // await Fetch.update({ id: id, title: title, isDone: true || false });
      }
    );
    //Activar el modo edición desde la tarea
    newRow.firstElementChild?.lastElementChild?.addEventListener(
      "focus",
      async (e: Event) => {
        this.editModeOn(e as FocusEvent, true);

        // let update: dataObj = dataObjtitle;
        // let updateTask: dataObjUpdate = await Fetch.update({id: this.idGenerator()});
        // if (update !== updateTask.title) {
        //   // let updateTask: dataObjUpdate = await Fetch.update({id: this.idGenerator()});
        //   // updateTask.title = update;
        //   // Fetch.update(updateTask);
        // }
        //await Fetch.update({id: id, title: this.input!.value, isDone: isDone});
        //Fetch.getAll();
      }
    );
    //Desactivar el modo edición
    newRow.firstElementChild?.lastElementChild?.addEventListener(
      "blur",
      (e: Event) => {
        this.editModeOff(e as FocusEvent);
      }
    );
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
      async (e: Event) => {
        // this.removeRow(e as MouseEvent, false);
        await Fetch.delete({ id: id });
      }
    );
    return newRow;
  };

  
  
  renderTasks = (tasks: dataObj[]): void => {
    console.log(tasks.length);
    if (this.table !== null) {
      this.table.innerHTML = "";
    }
    tasks.forEach((task: dataObj) => {
      this.table?.appendChild(
        this.generateRow(task.id, task.title, task.isDone)
      ); //Modificado done por isDone
    });
  };

  // //Tachado de tarea
  crossOut = async (e: MouseEvent): Promise<void> => {
    let id: string | null = (
      ((e.target as HTMLElement)?.parentElement as HTMLElement)
        ?.parentElement as HTMLElement
    )?.getAttribute("id");
    let done: boolean = false;
    if (this.allTasks !== null) {
      done =
        !this.allTasks.find((task: dataObj) => task.id === id)?.isDone ?? false;
    }
    if (id !== null) {
      let task: dataObjUpdate | null = {
        id: id,
        isDone: done,
      };
      let updatedTask = await Fetch.update(task);
      if (updatedTask !== null) {
        this.allTasks = await Fetch.getAll();
        this.renderTasks(this.allTasks);
      }
    }
  };
  // crossOut = (e: MouseEvent): void => {
  //   // let target: HTMLElement = e.target;
  //   // let task: HTMLInputElement = target?.nextElementSibling;
  //   let task = (e.target as HTMLElement).nextElementSibling as HTMLSpanElement;
  //   let text = task.innerHTML ?? ""; //Operador de fusión nula para proporcionar un valor predeterminado en caso de que sea null
  //   if (text.includes("<del>")) {
  //     text = (task.firstElementChild as HTMLElement)?.textContent ?? "";
  //     task.innerHTML = text;
  //     task.isDone = true;
  //     //(task.parentNode?.parentNode as HTMLElement).setAttribute("isDone", "false");
  //   } else {
  //     task.innerHTML = `<del>${text}</del>`;
  //     //(task.parentNode?.parentNode as HTMLElement).setAttribute("isDone", "true");
  //   }
  // };
  //Añadir nueva tarea
  addTask = async (
    input: HTMLInputElement | null,
    id: string,
    text: string,
    alert: HTMLDivElement | null
  ) => {
    //Por qué no se pone tipado a la función? Porque no es una función que se vaya a exportar, pero por que? Porque no se va a usar fuera de la clase. Entonces cuando tengo que tipar una función? Cuando la voy a exportar.
    if (input?.value.trim() === "") {
      input.value = "";
      alert?.classList.remove("dismissible");
    } else {
      text = input!.value; //Operador de aserción no nulo para asegurar que no es null
      // id = this.idGenerator();
      // document.querySelector("tbody")?.appendChild(this.generateRow(this.idGenerator(), this.input!.value));
      // input!.value = ""; //Volver a añadir, resetea el input (ahora se resetea por la recarga de la página);
      try {
        let newTask: dataObj = await Fetch.create({
          id: id,
          title: text,
          isDone: false,
        });
        if (newTask) {
          this.allTasks = await Fetch.getAll();
          this.renderTasks(this.allTasks);
        } else {
          throw new Error("No se ha podido añadir la tarea");
        }
      } catch (error: any) {
        if (alert) {
          alert.textContent = error.message;
          alert.classList.remove("dismissible");
        }
      }
    }
  };
  //Modo Edición
  editModeOn = (e: Event, onFocus: boolean): void => {
    e.preventDefault();
    let task: HTMLSpanElement;
    if (onFocus) {
      task = e.currentTarget as HTMLSpanElement;
    } else {
      task = (
        (
          ((e.currentTarget as HTMLElement).parentNode as HTMLSpanElement)
            .parentNode as HTMLTableCellElement
        ).previousElementSibling as HTMLTableCellElement
      ).lastElementChild as HTMLSpanElement;
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
  editModeOff = async (e: Event): Promise<void> => {
    let task = e.currentTarget as HTMLSpanElement;
    task.innerHTML = this.clearWhitespaces(task.innerHTML);
    task.classList.remove("editable");
    if (task?.innerHTML === "") {
      let id: string | null = (
        (task.parentNode as HTMLElement)?.parentNode as HTMLElement
      )?.getAttribute("id");
      // this.removeRow(e, true);
      if (id !== null) {
        await Fetch.delete({ id: id });
      }
    } else {
      let id: string | null = (
        (task.parentNode as HTMLElement)?.parentNode as HTMLElement
      )?.getAttribute("id");
      let text: string = task.innerHTML;
      if (text.includes("<del>")) {
        text = text.replace("<del>", "");
        text = text.replace("</del>", "");
      }
      if (id !== null) {
        let task: dataObjUpdate | null = {
          id: id,
          title: text,
        };
        let updatedTask = await Fetch.update(task);
        if (updatedTask !== null) {
          this.allTasks = await Fetch.getAll();
          this.renderTasks(this.allTasks);
        }
      }
    }
  };
  //Eliminación de tarea
  // removeRow = (e: Event, editionMode: boolean) => {
  //   if (editionMode) {
  //     (
  //       ((e.target as HTMLSpanElement).parentNode as HTMLTableCellElement)
  //         .parentNode as HTMLTableRowElement
  //     ).remove();
  //   } else {
  //     (
  //       (
  //         ((e.target as HTMLElement).parentNode as HTMLSpanElement)
  //           .parentNode as HTMLTableCellElement
  //       ).parentNode as HTMLTableRowElement
  //     ).remove();
  //   }
  // };
  //Eliminación de espacios en blanco
  clearWhitespaces = (text: string) => {
    return text.replace(new RegExp(/&nbsp;/, "g"), "").trim();
  };
  idGenerator = () => {
    // generate random hex string
    let hex = Math.floor(Math.random() * 16777215).toString(16);
    hex += Math.floor(Math.random() * 16777215).toString(16);
    hex += Math.floor(Math.random() * 16777215)
      .toString(16)
      .slice(0, 4);
    return hex;
  };
}
