const multer = require("multer");
const Folder = require("../models/folder");
const File = require("../models/file");
const fse = require("fs-extra");

exports.uploadFile = (req, res, next) => {
  const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadPath = req.body.folderpath;
      if (!/^\/([A-z0-9-_+]+\/)*([A-z0-9]+\/)$/.test(uploadPath)) {
        return cb(
          new Error("Path should be formated correctly example - /home/aaa/"),
          null
        );
      }
      if (uploadPath == "/" || uploadPath == undefined) {
        cb(null, "./public/");
      } else {
        const folders = uploadPath.split("/");
        const lastDir = folders[folders.length - 2];
        let storedFolder;
        try {
          const foldersResult = await Folder.find({ folderName: lastDir });

          storedFolder = foldersResult.find(
            (val) =>
              val.referencesToAncestors ===
              `${folders.slice(0, folders.length - 2).join("/")}/`
          );
          if (storedFolder) {
            cb(null, `./public${uploadPath}`);
          } else {
            const folderModel = new Folder({
              folderName: lastDir,
              referencesToAncestors: `${folders
                .slice(0, folders.length - 2)
                .join("/")}/`,
            });
            const resolvedPromises = await Promise.all([
              fse.ensureDir(`./public${uploadPath}`),
              folderModel.save(),
            ]);
            storedFolder = resolvedPromises[1];
            cb(null, `./public${uploadPath}`);
          }
          req.folderId = storedFolder._id;
        } catch (err) {
          cb(err, null);
        }
      }
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });

  var upload = multer({ storage: storage });
  var cpUpload = upload.fields([{ name: "file", maxCount: 1 }]);
  cpUpload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.json({ status: false, message: err.message });
      // A Multer error occurred when uploading.
    } else if (err) {
      return res.json({ status: false, message: err.message });
      // An unknown error occurred when uploading.
    } else {
      if (Object.keys(req.files).length == 0) {
        return res.json({
          status: false,
          message: "Please provide 1 file",
        });
      }
      try {
        const path = req.body.folderpath ? req.body.folderpath : "/";

        await File.findOneAndUpdate(
          {
            fileName: req.files.file[0].filename,
            folderPath: path,
          },
          {
            $set: {
              fileName: req.files.file[0].filename,
              folderPath: path,
              referenceToFolder: req.folderId,
              filePath: `http://localhost:3000${path}${req.files.file[0].filename}`,
              fileType: req.files.file[0].mimetype,
              size: req.files.file[0].size,
            },
          },
          { upsert: true }
        );
        res.json({
          status: true,
          location: `http://localhost:3000${path}${req.files.file[0].filename}`,
        });
      } catch (err) {
        res.json({ status: false, message: err.message });
      }
    }

    // Everything went fine.
  });
};

exports.searchFile = async (req, res) => {
  const fileName = req.query.filename;
  const folderPath = req.query.folderpath;
  const condition = {};
  if (fileName) {
    condition.fileName = {};
    condition.fileName.$regex = fileName;
  }
  if (folderPath) {
    if (!/^\/([A-z0-9-_+]+\/)*([A-z0-9]+\/)$/.test(folderPath)) {
      return res.json({
        status: false,
        message: "Path should be formated correctly example - /home/aaa/",
      });
    }
    condition.folderPath = {};
    condition.folderPath.$regex = `^${folderPath}`;
  }
  if (Object.keys(condition).length == 0) {
    return res.json({
      status: false,
      message: "Please provide fileName or folderName",
    });
  }

  try {
    let files = await File.find(condition).lean();
    console.log(files);
    files = files.map((file) => file.filePath);
    res.json({ status: true, files: files });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
};

exports.deleteFolder = async (req, res) => {
  const folderPath = req.query.folderpath;
  if (!folderPath) {
    return res.status(422).json({
      status: false,
      message: `Please provide folderpath`,
    });
  }
  if (!/^\/([A-z0-9-_+]+\/)*([A-z0-9]+\/)$/.test(folderPath)) {
    return res.json({
      status: false,
      message: "Path should be formated correctly example - /home/aaa/",
    });
  }
  const folders = folderPath.split("/");
  const folderDBPromise = Folder.deleteMany({
    referencesToAncestors: { $regex: `^${folderPath}` },
  });
  const folderDBPromise2 = Folder.deleteMany({
    folderName: folders[folders.length - 2],
  });
  const fileDBPromise = File.findOneAndDelete({
    folderPath: { $regex: `^${folderPath}` },
  });
  const folderDeletePromise = fse.remove(`./public${folderPath}`);
  try {
    await Promise.all([
      folderDBPromise2,
      folderDBPromise,
      fileDBPromise,
      folderDeletePromise,
    ]);
    res.json({
      status: true,
      message: "success Fully deleted",
    });
  } catch (err) {
    res.json({ status: false, message: "Successfully deleted" });
  }
};
