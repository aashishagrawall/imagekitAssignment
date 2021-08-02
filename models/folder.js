var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var folderSchema = new Schema(
  {
    folderName: { type: Schema.Types.String },
    referencesToAncestors: { type: Schema.Types.String },
  },
  {
    timestamps: true,
  }
);

// Export the model
module.exports = mongoose.model("Folder", folderSchema);
