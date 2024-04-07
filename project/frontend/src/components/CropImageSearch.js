import React, {PureComponent} from 'react';
import ImagesGrid from "./ImagesGrid";

// crop image component
class CropImageSearch extends PureComponent {
    state = {
        radioValue      : 'searchArea',
        numberResults   :  100,
        resultData      : {}
    }

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

    numberResultsChange = e => {
        const enteredNumberResult = e.target.value;
        this.setState({
            numberResults: enteredNumberResult < 1 ? 1 : enteredNumberResult
        });
    }

    handleRadioChange = (e) => {
        this.setState({
          radioValue: e.target.value
        });
    };

    executeApp = async (e) => {
        e.preventDefault();

        const {imageSrc, width, height, x, y} = this.props;

        let bottom_right_x = x + width;
        let bottom_right_y = y + height;
        let boxes = [{
            top_left    : {x, y}, 
            bottom_right: {bottom_right_x, bottom_right_y}
        }];

        let pulledData = [];

        let file = await fetch(imageSrc)
                        .then(r => r.blob())
                        .then(blobFile => new File([blobFile], "fileNameGoesHere", { type: blobFile.type }))
        
        const formData = new FormData();
        formData.append("image", file);

        switch (this.state.radioValue){

            //box prompt: query data from server
            case 'searchArea':
                formData.append("boxes", boxes);
                try{
                    const result = await fetch(window.location.origin + window.location.pathname +'api/draw/',{
                        method: 'POST',
                        body: formData
                    });
                    //pulledData = await result.json();
                    console.log(result);
                } catch (error) {
                    console.error(error);
                }
                break;

            //image query: query data from server
            case 'searchAll':
                try{
                    const result = await fetch(window.location.origin + window.location.pathname + '/api/upload/',{
                        method: 'POST',
                        body: formData
                    });
                    pulledData = await result.json();
                    console.log(pulledData);
                } catch (error) {
                    console.error(error);
                }
                break;

            //just crop the image
            default:
                this.getImagePortion(this.imageObject, width, height, x, y);
        }

        //test data //todo remove all the following instructions from this function
        pulledData = [
            {
                thumbnailSrc    : 'https://picsum.photos/id/234/300/300',
                enlargedSrc     : 'https://picsum.photos/id/234/1024/1024',
                title           : 'Paris',
                author          : 'Georges Pompidouz',
                license         : '<span className="small">This image is listed in <a href="https://storage.googleapis.com/openimages/web/index.html">Open Images Dataset</a> as having a CC BY 2.0 license</span>',
                similarity      : '0.98'
            },
            {
                thumbnailSrc    : 'https://picsum.photos/id/236/300/300',
                enlargedSrc     : 'https://picsum.photos/id/236/1024/1024',
                title           : 'Mountain',
                author          : '#+/&$}3!^_:-',
                license         : 'Youtube license',
                similarity      : '0.98'
            },
            {
                thumbnailSrc    : 'https://picsum.photos/id/237/300/300',
                enlargedSrc     : 'https://picsum.photos/id/237/1024/1024',
                title           : 'Dog',
                author          : 'Skooby Dog',
                license         : '',
                similarity      : '0.9'
            },
            {
                thumbnailSrc    : 'https://picsum.photos/id/238/300/300',
                enlargedSrc     : 'https://picsum.photos/id/238/1024/1024',
                title           : 'Sky crapper',
                author          : 'NYC',
                license         : '<span className="small">This image is listed in <a href="https://storage.googleapis.com/openimages/web/index.html">Open Images Dataset</a> as having a CC BY 2.0 license</span>',
                similarity      : '0.85'
            },
            {
                thumbnailSrc    : 'https://picsum.photos/id/239/300/300',
                enlargedSrc     : 'https://picsum.photos/id/239/1024/1024',
                title           : 'Soft flower',
                author          : 'Angel',
                license         : 'Free Editor License',
                similarity      : '0.8'
            },
            {
                thumbnailSrc    : 'https://picsum.photos/id/106/300/300',
                enlargedSrc     : 'https://picsum.photos/id/106/2048/1024',
                title           : 'Natural flowers tree',
                author          : '<a href="https://www.flickr.com/people/courtbean/">Courtney Boyd Myers</a> (<a href="https://creativecommons.org/licenses/by/2.0/">License</a>)',
                license         : '<span className="small">This image is listed in <a href="https://storage.googleapis.com/openimages/web/index.html">Open Images Dataset</a> as having a CC BY 2.0 license</span>',
                similarity      : '0.77'
            }
        ];
        let datanumber =  "" + Math.round(Math.random() * 10) / 10;
        let dataduration = "" + Math.round(Math.random() * 10) / 10;
        this.props.sendDataToParent(pulledData, datanumber, dataduration);
    };

    render() {
        const {width, height, x, y} = this.props;
        const { radioValue, numberResults, resultData} = this.state;
        return (
            <><div className='form-group'>
                <div className='radio'>
                    <label>
                        <input type='radio' value='searchArea' checked={radioValue === 'searchArea'} onChange={this.handleRadioChange} />
                        Search for similar images for the selected area
                    </label>
                </div><br/>
                <div className='radio'>
                    <label>
                        <input type='radio' value='searchAll' checked={radioValue === 'searchAll'} onChange={this.handleRadioChange} />
                        Search for similar images for the entire image
                    </label>
                </div><br/>
                <div className='radio'>
                    <label>
                        <input type='radio' value='justCrop' checked={radioValue === 'justCrop'} onChange={this.handleRadioChange} />
                        Just crop
                    </label>
                </div><br/>
            </div>
            <div className="crop-image-component-wrapper">
                <center>
                { (radioValue !== 'justCrop') ? 
                    (<table>
                        <tbody>
                            <tr>
                                <td> Number of results </td>
                                <td rowSpan="2">
                                    <button className="button is-success" onClick={this.executeApp}> run </button>
                                </td>
                            </tr>
                            <tr>
                                <td> <input type="number" value={numberResults} placeholder="Enter the number of results" onChange={this.numberResultsChange} /> </td>
                            </tr>
                        </tbody>
                    </table>
                    ) : (
                        <button className="button is-success" onClick={this.executeApp}> run </button>
                    )
                }
                </center>
            </div>
            </>
        );
    }
}

export default CropImageSearch;