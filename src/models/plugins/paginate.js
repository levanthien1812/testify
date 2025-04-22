export const paginate = (schema) => {
    schema.statics.paginate = async function (filter, options) {
        let sort = "";
        if (options.sortBy) {
            let sortCriteria = [];
            const sortOptions = options.sortBy.split(",");
            sortOptions.forEach((option) => {
                const [key, order] = option.split(":");
                sortCriteria.push((order === "asc" ? "" : "-") + key);
            });
            sort = sortCriteria.join(" ");
        } else {
            sort = "-created_at";
        }

        const limit =
            options.limit && parseInt(options.limit, 10) > 0
                ? parseInt(options.limit, 10)
                : 0;
        const page =
            options.page && parseInt(options.page, 10) > 0
                ? parseInt(options.page, 10)
                : 0;
        const skip = page ? (page - 1) * limit : 0;

        const countPromise = this.countDocuments(filter).exec();

        let docsPromise = this.find(filter);
        if (sort) docsPromise.sort(sort);
        if (skip) docsPromise.skip(skip);
        if (limit) docsPromise.limit(limit);

        if (options.populate) {
            options.populate.split(",").forEach((populateOption) => {
                docsPromise = docsPromise.populate(
                    populateOption
                        .split(".")
                        .reverse()
                        .reduce((a, b) => ({ path: b, populate: a }))
                );
            });
        }

        docsPromise = docsPromise.exec();

        return Promise.all([countPromise, docsPromise]).then((values) => {
            const [totalResults, results] = values;
            const totalPages = Math.ceil(totalResults / limit);
            const result = {
                results,
                page,
                limit,
                totalPages,
                totalResults,
            };

            return Promise.resolve(result);
        });
    };
};
