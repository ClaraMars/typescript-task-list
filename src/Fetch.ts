export interface dataObj {
  id: string,
  title: string,
  isDone: boolean
}

// export type Data = dataObj[];

export interface dataObjUpdate {
  id: string,
  title?: string,
  isDone?: boolean
}

export class Fetch {
  static BASE_URL: string = "http://localhost:8000/tasks";
  static async getAll() {
    const response: Response = await fetch("http://localhost:8000/tasks"); //Método GET por defecto, por eso no se indica
    if (!response.ok) {
      throw new Error(
        `Error al obtener las tareas: ${response.status} ${response.statusText}`
      );
    }
    const data: dataObj[] = await response.json();
    // const data: Data = await response.json();
    return data;
  }

  //Añadir filas nuevas
  static async create(task: dataObj) {
    const response: Response = await fetch(this.BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task), //Contenido a enviar al back-end
    });
    if (!response.ok) {
      throw new Error(
        `Error al crear la tarea: ${response.status} ${response.statusText}`
      );
    }
    const data: dataObj = await response.json(); //Devuelve solo un objeto
    return data;
  }

  //Tipado parcial para actualizar solo ciertos campos
  static async update(task: dataObjUpdate) {
    const response: Response = await fetch(`${this.BASE_URL}/${task.id}`, { //Actualiza el db.json
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(
        `Error al actualizar la tarea: ${response.status} ${response.statusText}`
      );
    }
    const data: dataObjUpdate = await response.json();
    return data;
  }

  //Eliminación de filas
  // static async delete(id: string) {
  static async delete(task: dataObj) {
    const response: Response = await fetch(`${this.BASE_URL}/${task.id}`, {
      method: "DELETE", //
    });
    if (!response.ok) {
      throw new Error(
        `Error al eliminar la tarea: ${response.status} ${response.statusText}`
      );
    }
  }
};
