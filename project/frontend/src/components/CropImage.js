import React, {PureComponent} from 'react';


// crop image component
class CropImage extends PureComponent {
    imageObject = new Image();

    componentDidMount() {
        const {imageSrc}     = this.props;
        this.imageObject.src = imageSrc;
        this.imageObject.setAttribute("crossOrigin", "anonymous");
    }

    getImagePortion = (imgObject, newWidth, newHeight, startX, startY) => {
        // setIsCropped => a method to set a flag whether image is cropped or not
        const {setIsCropped, getCroppedImg} = this.props,
              cropCanvas                                                = document.createElement("canvas"),
              cropCanvasContext                                         = cropCanvas.getContext("2d"),
              originalImage                                             = document.createElement('canvas'),
              originalImageContext                                      = originalImage.getContext('2d'),
              imageWidth                                                = imgObject.width,
              imageHeight                                               = imgObject.height,
              scaleH                                                    = 1, // Set horizontal scale to -1 if flip horizontal
              scaleV                                                    = 1, // Set verical scale to -1 if flip vertical
              posX                                                      = 0, // Set x position to -100% if flip horizontal
              posY                                                      = 0; // Set y position to -100% if flip vertical (imageHeight * -1)
        let scale                                                       = 1;
        cropCanvas.width                                                = newWidth;
        cropCanvas.height                                               = newHeight;

        if (imageWidth > document.documentElement.offsetWidth) {
            scale = imageWidth / document.documentElement.offsetWidth;
        }

        // canvas of original image
        originalImage.width  = imageWidth;
        originalImage.height = imageHeight;
        originalImageContext.drawImage(imgObject, 0, 0);

        originalImageContext.save(); // Save the current state
        originalImageContext.scale(scaleH, scaleV); // Set scale to flip the image
        originalImageContext.drawImage(imgObject, posX, posY, imageWidth, imageHeight); // draw the image
        originalImageContext.restore(); // Restore the last saved state

        cropCanvasContext.drawImage(
            originalImage,
            startX * scale,
            startY * scale,
            newWidth * scale,
            newHeight * scale,
            0,
            0,
            newWidth,
            newHeight
        );
        const croppedSrc = cropCanvas.toDataURL();

        setIsCropped(true);
        getCroppedImg(croppedSrc);
    };

    render() {
        const {width, height, x, y} = this.props;

        return (
            <div className="crop-image-component-wrapper">
                <button
                    className="btn btn-danger"
                    onClick={() =>
                        this.getImagePortion(this.imageObject, width, height, x, y)
                    }
                >
                    Crop
                </button>
            </div>
        );
    }
}

export default CropImage;