interface dataObj {
  id: string,
  title: string,
  isDone: boolean
}

interface dataObjUpdate {
  id: string,
  title?: string,
  isDone?: boolean
}

class Fetch {
  static BASE_URL: string = "http://localhost:8000/tasks";
  static async getAll() {
    const response: Response = await fetch("http://localhost:8000/tasks");
    if (!response.ok) {
      throw new Error(
        `Error al obtener las tareas: ${response.status} ${response.statusText}`
      );
    }
    const data: dataObj[] = await response.json();
    return data;
  }

  //Añadir filas nuevas
  static async create(task: dataObj[]) {
    const response: Response = await fetch(this.BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error(
        `Error al crear la tarea: ${response.status} ${response.statusText}`
      );
    }
    const data: dataObj[] = await response.json();
    return data;
  }

  //Tipado parcial para actualizar solo ciertos campos
  static async update(task: dataObjUpdate) {
    const response: Response = await fetch(`${this.BASE_URL}${task.id}`, {
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
    const data: dataObj[] = await response.json();
    return data;
  }

  //Eliminación de filas
  static async delete(id: string) {
    const response: Response = await fetch(`${this.BASE_URL}${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(
        `Error al eliminar la tarea: ${response.status} ${response.statusText}`
      );
    }
  }
}

module.exports = Fetch;
