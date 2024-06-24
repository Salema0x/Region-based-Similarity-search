import React, {Component, createRef, Fragment} from 'react';
import SelectAndCrop from "./SelectAndCrop";
import { LoarderBar } from './LoadingAnimation';

class Uploadbox extends Component {
    state = {
        croppedImgSrc  : "",
        displayImageUrl: "",
        fileInputImage : "",
        fileInputUrl   : "",
        inputUrl       : "",
        isError        : false,
        isLoading      : false,
        dragActive     : false
    };
    
    componentDidMount() {
        if(this.props.searchImgUrl){
            this.setState({
                inputUrl : this.props.searchImgUrl,
                isLoading: true
            });
            this.handleUrlSearch();
        }
    }

    form = createRef();

    onSelectImage = async(event) => {
        event.preventDefault();
        const file = event.target.files[0];
        await new Promise(resolve => setTimeout(resolve, 1));
        this.setState({
            isLoading      : true
        });
        this.prepareImg(file, false, event.target.value);

        //update the url in the browser's search bar
        const queryParameters = new URLSearchParams(window.location.search)
        const currentSearchImgUrl = queryParameters.get("imgurl");
        if(currentSearchImgUrl){
            window.history.pushState({}, document.title, "/");
        }
    };


    prepareImg = async (file, isFromLink, url) => {
        if ( ["image/jpeg", "image/jpg", "image/png"].includes(file.type) ) {
            this.setState({
                displayImageUrl : "",
                fileInputImage  : ""
            });
            let preparedImageUrl = await this.getResizedImageSearching(file);            
            if(isFromLink){
                this.setState({
                    fileInputUrl   : "",
                    fileInputImage : "",
                    displayImageUrl: preparedImageUrl,
                    inputUrl       : url,
                    isLoading      : false,
                    isError        : false
                });
            } else {
                this.setState({
                    fileInputUrl   : url,
                    fileInputImage : preparedImageUrl,
                    displayImageUrl: preparedImageUrl,
                    inputUrl       : "",
                    isLoading      : false,
                    isError        : false
                });
            }
        } else {
            this.setState({
                isError  : true, 
                isLoading: false
            });
        }
    };


    getResizedImageSearching = async (file) => {
        let urlImageResized = "";
        let maxTimeImageResize = 30000;
        const maxDimension = 400; //max height 400px and max width 400px
        const reader = new FileReader();
            reader.onload = async function(readerEvent) {
                const image = new Image();
                image.onload = function(imageEvent) {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    let width = image.width;
                    let height = image.height;
                    if (width > height) {
                        if (width > maxDimension) {
                            height *= maxDimension / width;
                            width = maxDimension;
                        }
                    } else {
                        if (height > maxDimension) {
                            width *= maxDimension / height;
                            height = maxDimension;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(image, 0, 0, width, height);
                    canvas.toBlob(function(blob) {
                        urlImageResized = URL.createObjectURL(blob);
                        //URL.revokeObjectURL(urlImageResized);
                    }, 'image/png');
                }
                image.src = readerEvent.target.result;
            }
            reader.readAsDataURL(file);
            while(urlImageResized == "" && maxTimeImageResize>0) {
                await new Promise(resolve => setTimeout(resolve, 500));
                maxTimeImageResize -= 500;
            }
            return urlImageResized == "" ?  URL.createObjectURL(file) : urlImageResized;
    };


    removeImg = () => {
        this.form.current.reset();
        this.setState({
            fileInputImage : "", 
            fileInputUrl : ""
        });
    };

    getCroppedImg = croppedSrc => {
        this.setState({croppedImgSrc : croppedSrc});
    };

    handleUrlSearch = async () => {
        let file = await fetch(this.props.searchImgUrl)
                        .then(r => r.blob())
                        .then(blobFile => new File([blobFile], "fileNameGoesHere", { type: blobFile.type }))
        this.setState({
            isLoading      : true
        });
        this.prepareImg(file, true, this.props.searchImgUrl);
    };

    handleUrlChange = async (event) => {
        event.preventDefault();
        const url = event.target.value;
        this.setState({
            inputUrl       : url,
            isLoading      : true
        });
        let file = await fetch(url)
                        .then(r => r.blob())
                        .then(blobFile => new File([blobFile], "fileNameGoesHere", { type: blobFile.type }))
        this.prepareImg(file, true, url);
        
         //update the url in the browser's search bar
         window.history.pushState({}, document.title, '?imgurl=' + encodeURI(url));
    };

    handleDrag = e => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            this.setState({dragActive : true});
        } else if (e.type === "dragleave") {
            this.setState({dragActive : false});
        }
    };
      
    handleDrop = e => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({dragActive : false});
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            this.setState({
                isLoading      : true
            });
            this.prepareImg(e.target.files[0], false, e.target.value);
        }
    };

    preventDefaultOnEnter = e =>{
        if (e.which === 13) {
            e.preventDefault && e.preventDefault();
            e.stopPropagation && e.stopPropagation();
            return false;
        }
    }

    render() {
        const {displayImageUrl, fileInputImage, fileInputUrl, inputUrl, isError, isLoading, dragActive} = this.state;
        return (
            <div className="container full-display">
                <form ref={this.form}>
                    <section className='section'>
                        <div className="columns">
                            <div className="column">
                                <div className="notification is-link">
                                    <button className="delete"></button>
                                    Please upload your image or enter a URL for it, so I can perform AI-based image similarity analysis.
                                </div>
                                <div className="columns is-mobile"> 
                                    
                                        <div className="column">
                                            <div className="card">
                                                <div className="card-content">
                                                    <div className="file is-boxed">
                                                        <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : "" }>
                                                            <input className="file-input" id="input-file-upload" type="file" name="resume" accept="image/png, image/jpeg" multiple={false} value={fileInputUrl} onChange={this.onSelectImage} />
                                                            <p>Drag and drop your image file here 
                                                                <br/> or  
                                                                <br/> 
                                                                <a className="file-label upload-button">Click to Upload an image file</a>
                                                            </p>
                                                        </label>
                                                        { dragActive && <div id="drag-file-element" onDragEnter={this.handleDrag} onDragLeave={this.handleDrag} onDragOver={this.handleDrag} onDrop={this.handleDrop}></div> }
                                                    </div>
                                                    {isError && (
                                                        <p className="error-message">
                                                            Please upload an image of type: (.png, .jpg, .jpeg).
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="card-footer">
                                                    <div className="card-footer-item">
                                                        <div className=" container field">
                                                            <label className="label"> Enter an external URL instead </label>
                                                            <div className="control">
                                                                <input className="input" type="text" placeholder="Enter URL to image" value={inputUrl} onChange={this.handleUrlChange} onKeyDown={this.preventDefaultOnEnter}/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {displayImageUrl && (
                                                        <Fragment>
                                                            <div className="card-footer">
                                                                <div className="card-footer-item">
                                                                    <div className=" container field">
                                                                    <button className="btn btn-danger remove-image"  onClick={this.removeImg} >
                                                                        Remove image
                                                                    </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Fragment>
                                                    )
                                                }
                                                {isLoading && 
                                                    <> <LoarderBar /> </>
                                                }
                                            </div>
                                        </div>
                                        <div className="column">
                                            <div className="bd-notification is-info">
                                                {displayImageUrl && (
                                                        <Fragment>
                                                            <SelectAndCrop
                                                                getCroppedImg={this.getCroppedImg}
                                                                image={displayImageUrl}
                                                                sendDataToParent={this.props.sendDataToParent}
                                                                setLoaderImages={this.props.setLoaderImages}
                                                            />
                                                        </Fragment>
                                                    )
                                                }
                                            </div>
                                        </div>
                                </div>   
                            </div>
                        </div>
                    </section>
                </form>
            </div>
        );
    }
}

export default Uploadbox;