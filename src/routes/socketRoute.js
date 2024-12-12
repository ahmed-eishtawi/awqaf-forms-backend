import db from "../config/database.js";

/* */

const useSocketIo = (io) => {
  io.on("connection", (socket) => {
    console.log("user connected");

    /*  */
    socket.on("get_all_sides", (data) => {
      const { sides } = data;

      let get_sides;
      if (sides === "all") {
        get_sides = db.prepare(`SELECT * FROM sides;`);
      }
      //
      else if (typeof sides === "number") {
        get_sides = db.prepare(`SELECT * FROM sides WHERE id = ?;`);
      }
      //
      else {
        io.emit("get_all_sides", "invalid side");
        return;
      }

      try {
        const result = sides === "all" ? get_sides.all() : get_sides.all(sides);
        if (result.length > 0) {
          io.emit("get_all_sides", result);
        }
        //
        else {
          io.emit("get_all_sides", "side not found");
        }
      } catch (err) {
        console.error(`Error getting sides: ${err.message}`);
      }
    });

    /*  */
    socket.on("select_side", (data) => {
      const { side_id } = data;

      /* get the forms for specific side */

      let side_forms = [];

      const get_forms = db.prepare(
        `SELECT form_number FROM forms WHERE side_id = ? AND is_selected = FALSE;`
      );
      try {
        const result = get_forms.all(side_id);

        if (result.length > 0) {
          side_forms = result.map((form) => form.form_number);
        }
        //
        else {
          io.emit("get_selected_side", `side not found`);
          return;
        }
      } catch (err) {
        console.error(`Error getting forms: ${side_id} - ${err.message}`);
      }

      io.emit("get_selected_side", {
        side_id,
        side_forms,
      });
    });

    /* */
    socket.on("select_form", (data) => {
      const { side_id, form_number } = data;
      /* update the form to be selected */
      const update_form = db.prepare(
        `UPDATE forms SET is_selected = TRUE WHERE side_id = ? AND form_number = ?`
      );
      try {
        const result = update_form.run(side_id, form_number);

        /* if there is no changes in the database then the form was not found */
        if (result.changes == 0) {
          io.emit(
            "get_selected_form",
            `form not found: ${form_number} for side: ${side_id}`
          );
          return;
        }
      } catch (err) {
        console.error(`Error updating form: ${side_id} - ${err.message}`);
      }

      /* emit the selected form */
      io.emit("get_selected_form", {
        side_id,
        form_number,
      });
    });

    /* */

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

export default useSocketIo;
