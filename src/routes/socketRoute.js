import { get } from "http";
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
        io.emit("get_all_sides", {
          error: "Invalid side",
          code: 400,
        });
        return;
      }

      try {
        const result = sides === "all" ? get_sides.all() : get_sides.all(sides);
        if (result.length > 0) {
          io.emit("get_all_sides", result);
        }
        //
        else {
          io.emit("get_all_sides", {
            error: "side not found",
            code: 404,
          });
        }
      } catch (err) {
        console.error(`Error getting sides: ${err.message}`);
      }
    });

    /*  */
    socket.on("select_side", (data) => {
      const { side_id } = data;

      /* get the forms for specific side */
      const get_forms = db.prepare(
        ` SELECT form_number FROM forms
          WHERE side_id = ? AND is_selected = FALSE;`
      );
      const get_selected_side = db.prepare(`SELECT * FROM sides WHERE id = ?;`);
      try {
        const get_forms_result = get_forms.all(side_id);
        const get_selected_side_result = get_selected_side.all(side_id);

        if (
          get_selected_side_result.length > 0 &&
          get_forms_result.length > 0
        ) {
          io.emit("get_selected_side", {
            selected_side: get_selected_side_result[0],
            result: get_forms_result.map((form) => form.form_number),
          });
        }
        //
        else {
          io.emit("get_selected_side", {
            error: "side or forms not found",
            code: 404,
          });
          return;
        }
      } catch (err) {
        console.error(`Error getting forms: ${side_id} - ${err.message}`);
      }
    });

    /* */
    socket.on("select_form", (data) => {
      const { side_id, form_number } = data;
      /* update the form to be selected */
      const update_form = db.prepare(
        `UPDATE forms SET is_selected = TRUE WHERE side_id = ? AND form_number = ? AND is_selected = FALSE;`
      );

      /* update the form is_selected flag */
      try {
        const result = update_form.run(side_id, form_number);

        /* if there is no changes in the database then the form was not found */
        if (result.changes == 0) {
          io.emit("get_selected_form", {
            error: "side or form not found",
            code: 404,
          });
          return;
        }
      } catch (err) {
        console.error(`Error updating form: ${side_id} - ${err.message}`);
      }

      /* get the selected form */
      const get_selected_form = db.prepare(
        `SELECT forms.form_number FROM forms
          WHERE forms.side_id = ? AND forms.form_number = ?;`
      );

      /* get the selected form to send it to the client */
      try {
        const result = get_selected_form.get(side_id, form_number);

        if (result) {
          io.emit("get_selected_form", result);
        }
        //
        else {
          io.emit("get_selected_form", {
            error: "side or form not found",
            code: 404,
          });
        }
      } catch (err) {
        console.error(
          `Error getting selected form: ${side_id} - ${err.message}`
        );
      }
    });

    /* */
    socket.on("reset_values", () => {
      io.emit("choose_another_student");
    });

    /* */

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

export default useSocketIo;
