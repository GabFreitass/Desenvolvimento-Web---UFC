export class Resource extends Image {
    constructor(image_path) {
        super();
        this.isLoaded = false;
        this.src = image_path;
    }

    load() {
        return new Promise((resolve, reject) => {
            this.onload = (event) => {
                this.isLoaded = true;
                resolve(this);
            };
        });
    }
}
