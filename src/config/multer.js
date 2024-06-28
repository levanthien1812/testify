import multer from "multer";

export const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
            cb(null, true);
        } else {
            cb(null, false);
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "_" + Math.random() + "_" + file.originalname);
    },
});

export const upload = multer({ storage: storage });