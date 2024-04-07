import React, {Component, createRef, Fragment} from 'react';
import SelectAndCrop from "./SelectAndCrop";

class Uploadbox extends Component {
    state = {
        croppedImgSrc  : "",
        displayImageUrl: "",
        fileInputImage : "",
        fileInputUrl   : "",
        inputUrl       : "",
        isError        : false,
        dragActive     : false
    };
    
    form = createRef();

    onSelectImage = async(event) => {
        event.preventDefault();
        const file = event.target.files[0];
        await new Promise(resolve => setTimeout(resolve, 1));
        this.prepareImg(file, false, event.target.value);
    };

    prepareImg = (file, isFromLink, url) => {
        if ( ["image/jpeg", "image/jpg", "image/png"].includes(file.type) ) {
            this.setState({
                displayImageUrl : "",
                fileInputImage  : ""
            });
            if(isFromLink){
                this.setState({
                    fileInputUrl   : "",
                    fileInputImage : "",
                    displayImageUrl: URL.createObjectURL(file),
                    inputUrl       : url,
                    isError        : false
                });
            } else {
                this.setState({
                    fileInputUrl   : url,
                    fileInputImage : URL.createObjectURL(file),
                    displayImageUrl: URL.createObjectURL(file),
                    inputUrl       : "",
                    isError        : false
                });
            }
        } else {
            this.setState({isError : true});
        }
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

    handleUrlChange = async (event) => {
        event.preventDefault();
        const url = event.target.value;
        this.setState({inputUrl       : url});
        let file = await fetch(url)
                        .then(r => r.blob())
                        .then(blobFile => new File([blobFile], "fileNameGoesHere", { type: blobFile.type }))
        console.log(file);
        this.prepareImg(file, true, url);
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
        const {displayImageUrl, fileInputImage, fileInputUrl, inputUrl, isError, dragActive} = this.state;
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