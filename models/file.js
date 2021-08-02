//https://blog.imagekit.io/@rnanwani

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var fileSchema = new Schema(
  {
    size: { type: Schema.Types.Number, required: true },
    fileType: { type: Schema.Types.String, required: true },
    filePath: { type: Schema.Types.String, required: true },
    referenceToFolder: { type: Schema.Types.ObjectId }, //reference to folderTable
    folderPath: { type: Schema.Types.String, required: true }, //faster search
    fileName: { type: Schema.Types.String, required: true },
  },
  { timestamps: true }
);
// Export the model
module.exports = mongoose.model("File", fileSchema);
