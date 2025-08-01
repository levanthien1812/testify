import { getLinkPreview } from "link-preview-js";
import { URL_REGEX } from "../config/constants/message.js";
import fse from "fs-extra";

export const getLinksFromMessage = (messageText) => {
    return messageText.match(URL_REGEX);
};

export const generateLinkPreviews = async (messages) => {
    const linkifiedMessages = await Promise.all(
        messages.map(async (msg) => {
            try {
                let linkPreview = null;
                const match = getLinksFromMessage(msg.text);

                if (match) {
                    const url = match[0];
                    const data = await getLinkPreview(url);

                    if (data.images && data.images.length > 0) {
                        linkPreview = data.images[0];
                    }
                }

                return {
                    ...msg.toObject(),
                    ...(msg.text.length > 0
                        ? {
                              link_preview: linkPreview,
                              links: getLinksFromMessage(msg.text),
                          }
                        : {}),
                };
            } catch (err) {
                return msg;
            }
        })
    );
    return linkifiedMessages;
};

export const unlinkImages = (images) => {
    images.forEach((image) => {
        fse.unlinkSync(image, (err) => {
            if (err) {
                if (err.code === "ENOENT") {
                    console.log("The file does not exist");
                } else {
                    console.error(err);
                }
            }
        });
    });
};

export const checkLinkImage = (image) => {
    return new Promise((resolve, reject) => {
        fse.access(image, (err) => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
};
