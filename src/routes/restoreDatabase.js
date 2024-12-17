import db from "../config/database.js";
//

const restoreDatabase = async (req, res) => {
  try {
    db.prepare(`DROP TABLE sides`).run();

    db.prepare(`DROP TABLE forms`).run();

    db.prepare(
      `CREATE TABLE IF NOT EXISTS sides (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL
        )`
    ).run();

    db.prepare(
      `
          CREATE TABLE IF NOT EXISTS forms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          form_number INTEGER NOT NULL,
          side_id INTEGER NOT NULL,
          is_selected BOOLEAN DEFAULT FALSE,
          FOREIGN KEY (side_id) REFERENCES sides(id) ON DELETE CASCADE
        )`
    ).run();

    // Insert sides data
    const insertSide = db.prepare(`INSERT INTO sides (title) VALUES (?)`);
    const sides = [
      "جانب أصول الطيبة كاملا",
      "جانب أصول الطيبة",
      "الشاطبية مع الذرة",
      "جانب المورد",
      "جانب العقيلة",
      "جانب حفظ الشاطبية كاملا",
      "جانب حفظ باب الأصول من الشاطبية",
    ];
    sides.forEach((side) => {
      try {
        insertSide.run(side);
      } catch (err) {
        console.error(`Error inserting side: ${side} - ${err.message}`);
      }
    });

    // Insert forms data
    const insertForm = db.prepare(
      `INSERT INTO forms (form_number, side_id) VALUES (?, ?)`
    );

    const sideFormsData = {
      1: 3,
      2: 10,
      3: 12,
      4: 5,
      5: 20,
      6: 15,
      7: 24,
    };

    Object.entries(sideFormsData).forEach(([sideId, numForms]) => {
      for (let formNumber = 1; formNumber <= numForms; formNumber++) {
        try {
          insertForm.run(formNumber, sideId);
        } catch (err) {
          console.error(
            `Error inserting form for side_id ${sideId} with form_number ${formNumber} - ${err.message}`
          );
        }
      }
    });
    res.status(200).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export default restoreDatabase;
