import Grid from "../models/Grid.js";

const GRID_ID = "default-grid";

// An indexed upsert creates the singleton atomically. A concurrent first request
// can still lose the unique-index race; retry against the document that won.
async function writeGrid(update) {
  const filter = { gridid: GRID_ID };
  const options = { returnDocument: "after", upsert: true, runValidators: true };
  try {
    return await Grid.findOneAndUpdate(filter, update, options);
  } catch (error) {
    if (error.code !== 11000 ||
        !(error.keyPattern?.gridid || error.keyValue?.gridid === GRID_ID)) throw error;
    const grid = await Grid.findOneAndUpdate(filter, update, {
      ...options, upsert: false,
    });
    if (!grid) throw error;
    return grid;
  }
}

export async function getGrid(req, res, next) {
  try {
    const grid = await writeGrid({
      $setOnInsert: { rows: 8, columns: 8, selectedBoxes: [] },
    });
    res.status(200).json({ success: true, data: grid });
  } catch (error) {
    next(error);
  }
}

export async function updateGrid(req, res, next) {
  try {
    const { selectedBoxes } = req.body ?? {};
    if (!Array.isArray(selectedBoxes) ||
        !selectedBoxes.every(id => Number.isInteger(id) && id >= 0 && id < 64)) {
      return res.status(400).json({
        success: false,
        message: "selectedBoxes must be an array of integers from 0 to 63",
      });
    }
    const grid = await writeGrid({
      $set: { selectedBoxes: [...new Set(selectedBoxes)] },
      $setOnInsert: { rows: 8, columns: 8 },
    });
    res.status(200).json({
      success: true, message: "Grid Saved Successfully", data: grid,
    });
  } catch (error) {
    next(error);
  }
}

export async function resetGrid(req, res, next) {
  try {
    const grid = await writeGrid({
      $set: { selectedBoxes: [] },
      $setOnInsert: { rows: 8, columns: 8 },
    });
    res.status(200).json({
      success: true, message: "Grid Reset Successfully", data: grid,
    });
  } catch (error) {
    next(error);
  }
}
