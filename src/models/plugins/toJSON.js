const deleteAtPath = (obj, path, index) => {
    if (index === path.length - 1) {
        delete obj[path[index]];
        return;
    }
    deleteAtPath(obj[path[index]], path, index + 1);
};

export const toJSON = (schema, options = { timestamps: false }) => {
    schema.set("toObject", {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id?.toString();
            delete ret._id;
            delete ret.__v;
            if (!options.timestamps) {
                delete ret.updated_at;
                delete ret.created_at;
            }

            // Optionally, include other fields to exclude:
            const fieldsToExclude = options.exclude || [];
            fieldsToExclude.forEach((field) => delete ret[field]);
        },
    });
    schema.set("toJSON", {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
            if (!options.timestamps) {
                delete ret.updated_at;
                delete ret.created_at;
            }

            // Optionally, include other fields to exclude:
            const fieldsToExclude = options.exclude || [];
            fieldsToExclude.forEach((field) => delete ret[field]);
        },
    });
};
// export const toJSON = (schema) => {
//     let transform;
//     if (schema.options.toJSON && schema.options.toJSON.transform) {
//         transform = schema.options.toJSON.transform;
//     }

//     schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
//         transform(doc, ret, options) {
//             Object.keys(schema.paths).forEach((path) => {
//                 if (
//                     schema.paths[path].options &&
//                     schema.paths[path].options.private
//                 ) {
//                     deleteAtPath(ret, path.split("."), 0);
//                 }
//             });

//             ret.id = ret._id.toString();
//             delete ret._id;
//             delete ret.__v;
//             delete ret.created_at;
//             delete ret.updated_at;
//             if (transform) {
//                 return transform(doc, ret, options);
//             }
//         },
//     });
// };
