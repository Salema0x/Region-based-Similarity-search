import React, {PureComponent, createRef, Fragment} from 'react';
import CropImageSearch from "./CropImageSearch";


class SelectAndCrop extends PureComponent {
    state = {
        isMouseDown         : false, // to decide which action to make "resize or move" on "mousemove or touchmove"
        isMoveDiv           : false, // to move div or not
        isResizeDiv         : false, // to resize div or not
        ratioValue          : "1:1", // resize div based on this value if user controls enabled
        isRatio             : false, // enable/disable ratio resizing
        widthFromRatio      : 0, // width ratio value
        heightFromRatio     : 0, // height ratio value
        minimum_size        : 20, // this is the minimum size of the div so that nodes will not stay on top of each other
        original            : {
            // used to set the original values on any interaction
            width   : 0,
            height  : 0,
            x       : 0,
            y       : 0,
            mouse_x : 0,
            mouse_y : 0
        },
        final               : {
            // used to set the final data which is used to set the dimensions and the position of the resizable div and will be used for cropping the image as well
            width  : 80,
            height : 80,
            x      : 0,
            y      : 0
        },
        overlayN            : {
            // north overlay styles
            right  : 0,
            height : 0,
            left   : 0
        },
        overlayE            : {
            // east overlay styles
            left : 0
        },
        overlayS            : {
            // south overlay styles
            right : 0,
            top   : 0,
            left  : 0
        },
        overlayW            : {
            // west overlay styles
            width : 0
        },
        offset              : [0, 0], // will be used to move the resizable div
        containerMaxWidth   : 0, // width of the image container
        isImg               : false, // show image with resizers
        isLeftEnabled       : false, // enable/disable to left button
        isRightEnabled      : true, // enable/disable to right button
        isTopEnabled        : false, // enable/disable to top button
        isBottomEnabled     : true, // enable/disable to bottom button
        isCropped           : false, // show cropped image or original image with controls
        isTopLeftResize     : false, // resize or not using the top left node
        isTopRightResize    : false, // resize or not using the top right node
        isBottomLeftResize  : false, // resize or not using the bottom left node
        isBottomRightResize : false, // resize or not using the bottom right node
        croppedSrc          : "" // source of the cropped image so that we can send it to the parent component
    };
    // the following 2 lines will be used to solve the race condition issue
    loadTimer;
    img   = new Image();

    // references
    resizeMoveCropContainer = createRef(); // referance to the container div
    resizable               = createRef(); // referance to the resizable div
    element;

    // data
    parentWidth;
    parentHeight;
    parentY;
    parentX;

    componentDidMount() {
        // access resizable div
        this.element = this.resizable.current;

        // check whether to resize based on ratio or no
        this.setRatio(this.state.ratioValue);

        // solve race condition issue
        const {image} = this.props;
        this.img.src  = image;
        this.img.addEventListener("load", this.onImgLoaded);

        // attach event listeners
        window.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("touchmove", this.handleMouseMove);
        window.addEventListener("mouseup", this.handleMouseUp);
        window.addEventListener("touchend", this.handleMouseUp);
        window.addEventListener("resize", this.updateWrapperWidth);
    }

    componentWillUnmount() {
        // remove event listeners
        window.removeEventListener("mousemove", this.handleMouseMove);
        window.removeEventListener("touchmove", this.handleMouseMove);
        window.removeEventListener("mouseup", this.handleMouseUp);
        window.removeEventListener("touchend", this.handleMouseUp);
        window.removeEventListener("resize", this.updateWrapperWidth);
    }

    // if mousedown is true check which action to make (resize or move)
    handleMouseMove = e => {
        if (this.state.isMouseDown) {
            if (this.state.isResizeDiv) {
                //resize logic
                this.resize(e);
            }
            if (this.state.isMoveDiv) {
                //move logic
                this.move(e);
            }
        }
    };

    // set isResizeDiv to true and isMoveDiv to false to trigger the resize method
    handleResizerClick = () => {
        this.setState({
            isMouseDown : true,
            isResizeDiv : true,
            isMoveDiv   : false
        });
    };

    /* *****************event listeners for each resize node***************** */
    // called on mousedown and touchstart on each resizer node
    handleNodeResize = e => {
        e.preventDefault();
        e.stopPropagation();
        this.getDimensionsAndPosition(e);
        this.handleResizerClick();
    };

    onTopLeftResize = e => {
        this.handleNodeResize(e);
        this.setState({
            isTopLeftResize     : true,
            isTopRightResize    : false,
            isBottomLeftResize  : false,
            isBottomRightResize : false
        });
    };

    onTopRightResize = e => {
        this.handleNodeResize(e);
        this.setState({
            isTopLeftResize     : false,
            isTopRightResize    : true,
            isBottomLeftResize  : false,
            isBottomRightResize : false
        });
    };

    onBottomLeftResize = e => {
        this.handleNodeResize(e);
        this.setState({
            isTopLeftResize     : false,
            isTopRightResize    : false,
            isBottomLeftResize  : true,
            isBottomRightResize : false
        });
    };

    onBottomRightResize = e => {
        this.handleNodeResize(e);
        this.setState({
            isTopLeftResize     : false,
            isTopRightResize    : false,
            isBottomLeftResize  : false,
            isBottomRightResize : true
        });
    };

    // set isMoveDiv to true and isResizeDiv to false to trigger the move method and set initial values
    handleMoveClick = e => {
        let newMouseX = e.clientX || e.pageX || (e.touches && e.touches[0].clientX);
        let newMouseY = e.clientY || e.pageY || (e.touches && e.touches[0].clientY);

        this.setState({
            isMouseDown : true,
            isResizeDiv : false,
            isMoveDiv   : true,
            offset      : [
                this.element.offsetLeft - newMouseX,
                this.element.offsetTop - newMouseY
            ]
        });

        this.getDimensionsAndPosition(e);
    };

    // set all boolean properties to false on mouseup
    handleMouseUp = () => {
        this.setState({
            isMouseDown : false,
            isResizeDiv : false,
            isMoveDiv   : false
        });
    };

    // get the dimensions and the position of the resizable div
    getDimensionsAndPosition = e => {
        this.setState({
            original : {
                width   : this.element.offsetWidth,
                height  : this.element.offsetHeight,
                x       : this.element.offsetLeft,
                y       : this.element.offsetTop,
                mouse_x : e.clientX || e.pageX || (e.touches && e.touches[0].clientX),
                mouse_y : e.clientY || e.pageY || (e.touches && e.touches[0].clientY)
            }
        });
    };

    onImgLoaded = () => {
        if (this.loadTimer !== null) {
            clearTimeout(this.loadTimer);
        }

        // if image is not completed call the current method recursively
        if (!this.img.complete) {
            this.loadTimer = setTimeout(() => {
                this.onImgLoaded();
            }, 3);
        } else {
            this.updateWrapperWidth();
            this.setState({isImg : true});
        }
    };

    // resize wrapper container on screen resize
    updateWrapperWidth = () => {
        let containerMaxWidth =
                document.documentElement.clientWidth <= this.img.width
                    ? "100%"
                    : this.img.width + "px";

        this.setState({containerMaxWidth : containerMaxWidth});

        // get data
        this.parentWidth  = this.element.parentNode.getBoundingClientRect().width;
        this.parentHeight = this.element.parentNode.getBoundingClientRect().height;
        this.parentY      = this.element.parentNode.getBoundingClientRect().y;
        this.parentX      = this.element.parentNode.getBoundingClientRect().x;

        this.repositionOverlay();
    };

    // repositioning the overlay
    repositionOverlay = () => {
        const {final : {width, height, x, y}} = this.state;
        if (this.parentWidth) {
            this.setState({
                overlayN : {
                    right  : this.parentWidth - x - width,
                    height : y,
                    left   : x
                },
                overlayE : {
                    left : x + width
                },
                overlayS : {
                    right : this.parentWidth - x - width,
                    top   : y + height,
                    left  : x
                },
                overlayW : {
                    width : x
                }
            });
        }
    };

    // repositioning the overlay for user controls
    repositionOverlayUserControls = (width, height, x, y) => {
        if (this.parentWidth) {
            this.setState({
                overlayN : {
                    right  : this.parentWidth - x - width,
                    height : y,
                    left   : x
                },
                overlayE : {
                    left : x + width
                },
                overlayS : {
                    right : this.parentWidth - x - width,
                    top   : y + height,
                    left  : x
                },
                overlayW : {
                    width : x
                }
            });
        }
    };

    // set ratio based on coming width and height
    setRatio = rValue => {
        const {final : {width}}                            = this.state,
              {ratioWidth, ratioHeight} = this.props;

        // if (developer ratio and not user controls) => use props data to set ratio
        if (ratioWidth && ratioHeight) {
            const updatedFinal = {
                ...this.state.final,
                height : width * (ratioHeight / ratioWidth)
            };
            this.setState({
                final           : updatedFinal,
                isRatio         : true,
                widthFromRatio  : ratioWidth / ratioHeight,
                heightFromRatio : ratioHeight / ratioWidth
            });
        }
        // if (developer ratio and user controls || user controls) => user user controls to set ratio
        else {
            switch (rValue) {
                case "16:9":
                    this.updateWidthHeightRatio(true, 16, 9);
                    break;
                default:
                    this.updateWidthHeightRatio(true, 1, 1);
                    this.setState({isRatio : false});
                    break;
            }
        }
    };

    // update widthFromRatio and heightFromRatio if user click on the ratio buttons
    updateWidthHeightRatio = (isRatio, width, height) => {

        const {final : {x, y}} = this.state,
              rWidth           = width,
              rHeight          = height,
              finalWidth       = this.state.final.width,
              finalHeight      = finalWidth * (height / width),
              updatedFinal     = {
                  ...this.state.final,
                  height : finalHeight
              };
        this.setState({
            final           : updatedFinal,
            isRatio         : isRatio,
            widthFromRatio  : rWidth / rHeight,
            heightFromRatio : rHeight / rWidth
        });

        this.repositionOverlayUserControls(finalWidth, finalHeight, x, y);
    };

    /* *****************flexible resize methods***************** */

    // enable user to set the width of the resizable div when resizing using (top right, bottom right) nodes
    setFullWidthToRight = ({width, final}) => {
        // if current x + current width is less than parent width (means we are in the parent div) => set width to the coming width
        if (final.x + width <= this.parentWidth) {
            const updatedFinal = {...this.state.final, width : width};

            // enable/disable (push to right) button
            this.enableRightButton(final.x, width);

            this.setState({final : updatedFinal});
        } else {
            // opposite => set width to parent width - current x
            const newWidth     = this.parentWidth - final.x,
                  updatedFinal = {
                      ...this.state.final,
                      width : newWidth
                  };

            // enable/disable (push to right) button
            this.enableRightButton(final.x, newWidth);

            this.setState({final : updatedFinal});
        }
    };

    // enable user to set the "width, x" of the resizable div when resizing using (top left, bottom left) nodes
    setFullWidthToLeft = ({width, newMouseX, original, final}) => {
        // if initial x + (current mouse x - initial mouse x) is greater than 0 (means we are in the parent div) => set "width to comming width" and "x to initial x + (current mouse x - initial mouse x)"
        if (original.x + (newMouseX - original.mouse_x) >= 0) {
            const newX         = original.x + (newMouseX - original.mouse_x),
                  updatedFinal = {
                      ...this.state.final,
                      width : width,
                      x     : newX
                  };

            // enable/disable (push to left) button
            this.enableLeftButton(newX);

            // enable/disable (push to right) button
            this.enableRightButton(newX, width);

            this.setState({final : updatedFinal});
        } else {
            // opposite => set "width to current width + current x of current element" and "x to 0"
            const newWidth     = final.width + final.x,
                  updatedFinal = {
                      ...this.state.final,
                      width : newWidth,
                      x     : 0
                  };

            // enable/disable (push to left) button
            this.enableLeftButton(0);

            // enable/disable (push to right) button
            this.enableRightButton(0, newWidth);

            this.setState({final : updatedFinal});
        }
    };

    // enable user to set the "height, y" of the resizable div when resizing using (top left, top right) nodes
    setFullHeightToTop = ({height, newMouseY, original, final}) => {
        // if initial y + (current mouse y - initial mouse y) is greater than 0 (means we are in the parent div) => set "height to coming height" and "y to initial y + (current mouse y - initial mouse y)"
        if (original.y + (newMouseY - original.mouse_y) >= 0) {
            const newY         = original.y + (newMouseY - original.mouse_y),
                  updatedFinal = {
                      ...this.state.final,
                      height : height,
                      y      : newY
                  };

            // enable/disable (push to top) button
            this.enableTopButton(newY);

            this.setState({final : updatedFinal});
        } else {
            // opposite => set "height to current height + current y of current element" and "y to 0"
            const newHeight    = final.height + final.y,
                  updatedFinal = {
                      ...this.state.final,
                      height : newHeight,
                      y      : 0
                  };

            // enable/disable (push to top) button
            this.enableTopButton(0);

            this.setState({final : updatedFinal});
        }
    };

    // enable user to set the "height, y" of the resizable div when resizing using (bottom left, bottom right) nodes
    setFullHeightToBottom = ({height, final}) => {
        // if current y + current height is less than parent height (means we are in the parent div) => set height to the comming height
        if (final.y + height <= this.parentHeight) {
            const updatedFinal = {...this.state.final, height : height};

            // enable/disable (push to bottom) button
            this.enableBottomButton(final.y, height);

            this.setState({final : updatedFinal});
        } else {
            // opposite => set height to parent height - current y
            const newHeight    = this.parentHeight - final.y,
                  updatedFinal = {
                      ...this.state.final,
                      height : newHeight
                  };

            // enable/disable (push to bottom) button
            this.enableBottomButton(final.y, newHeight);

            this.setState({final : updatedFinal});
        }
    };

    /* *****************ratio resize methods***************** */
    // ratio to bottom left
    setRatioToBottomLeft = ({
                                width,
                                newMouseX,
                                minimum_size,
                                original,
                                final
                            }) => {
        const {widthFromRatio, heightFromRatio} = this.state,
              newHeight                         = heightFromRatio * width;
        // if initial x + (current mouse x - initial mouse x) is greater than 0 (means we are in the parent div)
        if (original.x + (newMouseX - original.mouse_x) >= 0) {
            /* if (new height > minimum size) and (new height + current y <= parent div height)
            * set "width to coming width", "height to ratio height" and "x to initial x + (current mouse x - initial mouse x)*/
            if (
                newHeight > minimum_size &&
                newHeight + final.y <= this.parentHeight
            ) {
                const newX         = original.x + (newMouseX - original.mouse_x),
                      finalHeight  = heightFromRatio * width,
                      updatedFinal = {
                          ...this.state.final,
                          width  : width,
                          height : finalHeight,
                          x      : newX
                      };

                // enable/disable (push to left) button
                this.enableLeftButton(newX);

                // enable/disable (push to right) button
                this.enableRightButton(newX, width);

                // enable/disable (push to bottom) button
                this.enableBottomButton(final.y, finalHeight);

                this.setState({final : updatedFinal});
            } else
                if (newHeight + final.y >= this.parentHeight) {
                    /*if ratio height + current y is greater than parent div height =>
                    * set "width to (parent div height - current y) * ratio", "height to parent div height - current y" and "x to (old x + old width) - new width" */
                    const oldOccupiedSpaceX = final.x + final.width,
                          newWidth          = (this.parentHeight - final.y) * widthFromRatio,
                          newX              = oldOccupiedSpaceX - newWidth,
                          finalHeight       = this.parentHeight - final.y,
                          updatedFinal      = {
                              ...this.state.final,
                              width  : newWidth,
                              height : finalHeight,
                              x      : newX
                          };

                    // enable/disable (push to left) button
                    this.enableLeftButton(newX);

                    // enable/disable (push to right) button
                    this.enableRightButton(newX, newWidth);

                    // enable/disable (push to bottom) button
                    this.enableBottomButton(final.y, finalHeight);

                    this.setState({final : updatedFinal});
                }
        } else
            if (newHeight + final.y <= this.parentHeight) {
                /*if new height + current y <= parent div height
                 * set "width to current width + current x", "height to ratio height" and "x to 0" */
                const newWidth     = final.width + final.x,
                      finalHeight  = heightFromRatio * newWidth,
                      updatedFinal = {
                          ...this.state.final,
                          width  : newWidth,
                          height : finalHeight,
                          x      : 0
                      };

                // enable/disable (push to left) button
                this.enableLeftButton(0);

                // enable/disable (push to right) button
                this.enableRightButton(0, newWidth);

                // enable/disable (push to bottom) button
                this.enableBottomButton(final.y, finalHeight);

                this.setState({final : updatedFinal});
            }
    };

    // ratio to bottom right
    setRatioToBottomRight = ({width, minimum_size, final}) => {
        const {widthFromRatio, heightFromRatio} = this.state;
        /* if current x + new width is less than parent width (means we are in the parent div) =>
        * set "width to the new width" and "height to ratio height" */
        if (final.x + width <= this.parentWidth) {
            let newHeight = heightFromRatio * width;
            if (
                newHeight > minimum_size &&
                newHeight + final.y <= this.parentHeight
            ) {
                const updatedFinal = {
                    ...this.state.final,
                    width  : width,
                    height : newHeight
                };

                // enable/disable (push to right) button
                this.enableRightButton(final.x, width);

                // enable/disable (push to bottom) button
                this.enableBottomButton(final.y, newHeight);

                this.setState({final : updatedFinal});
            } else
                if (newHeight + final.y >= this.parentHeight) {
                    /* if ratio height + current y >= parent div height =>
                    * set "width to (parent div height - current y) * width ratio value" and "height to parent div height - current y" */
                    const newWidth     = (this.parentHeight - final.y) * widthFromRatio,
                          finalHeight  = this.parentHeight - final.y,
                          updatedFinal = {
                              ...this.state.final,
                              width  : newWidth,
                              height : finalHeight
                          };

                    // enable/disable (push to right) button
                    this.enableRightButton(final.x, newWidth);

                    // enable/disable (push to bottom) button
                    this.enableBottomButton(final.y, finalHeight);

                    this.setState({final : updatedFinal});
                }
        } else {
            const newHeight = heightFromRatio * (this.parentWidth - final.x);
            if (newHeight + final.y <= this.parentHeight) {
                /* if new height + current y <= parent div height =>
                * set "width to parent div width - current x" and "height to new height" */
                const newWidth     = this.parentWidth - final.x,
                      updatedFinal = {
                          ...this.state.final,
                          width  : newWidth,
                          height : newHeight
                      };

                // enable/disable (push to right) button
                this.enableRightButton(final.x, newWidth);

                // enable/disable (push to bottom) button
                this.enableBottomButton(final.y, newHeight);

                this.setState({final : updatedFinal});
            }
        }
    };

    setRatioToTopRight = ({
                              height,
                              newMouseY,
                              minimum_size,
                              original,
                              final
                          }) => {
        const {widthFromRatio, heightFromRatio} = this.state,
              newWidth                          = widthFromRatio * height;
        // if inside div on y
        if (original.y + (newMouseY - original.mouse_y) >= 0) {
            if (newWidth + final.x <= this.parentWidth && height > minimum_size) {
                /* if (new width + current x <= parent div width) && (height is less than minimum size) =>
                * set "width to new width", "height to coming height" and "y to (initial y + (new mouse y - initial mouse y))"*/
                const newY         = original.y + (newMouseY - original.mouse_y),
                      updatedFinal = {
                          ...this.state.final,
                          width  : newWidth,
                          height : height,
                          y      : newY
                      };

                // enable/disable (push to right) button
                this.enableRightButton(final.x, newWidth);

                // enable/disable (push to top) button
                this.enableTopButton(newY);

                // enable/disable (push to bottom) button
                this.enableBottomButton(newY, height);

                this.setState({final : updatedFinal});
            } else {
                /*opposite =>
                * set "width to parent div width - current x", "height to ratio height based on new width" and "y to (old height + old y) - new height" */
                if (height > minimum_size) {
                    const oldOccupiedSpace = final.height + final.y,
                          newHeight        = heightFromRatio * (this.parentWidth - final.x),
                          newY             = oldOccupiedSpace - newHeight,
                          finalWidth       = this.parentWidth - final.x,
                          updatedFinal     = {
                              ...this.state.final,
                              width  : finalWidth,
                              height : newHeight,
                              y      : newY
                          };

                    // enable/disable (push to right) button
                    this.enableRightButton(final.x, finalWidth);

                    // enable/disable (push to top) button
                    this.enableTopButton(newY);

                    // enable/disable (push to bottom) button
                    this.enableBottomButton(newY, newHeight);

                    this.setState({final : updatedFinal});
                }
            }
        } else {
            if (newWidth + final.x <= this.parentWidth) {
                /* if new width + current x <= parent div width =>
                * set "width to width based on new height", "height to current height + current y" and "y to 0" */
                const finalWidth   = widthFromRatio * (final.height + final.y),
                      finalHeight  = final.height + final.y,
                      updatedFinal = {
                          ...this.state.final,
                          width  : finalWidth,
                          height : finalHeight,
                          y      : 0
                      };

                // enable/disable (push to right) button
                this.enableRightButton(final.x, finalWidth);

                // enable/disable (push to top) button
                this.enableTopButton(0);

                // enable/disable (push to bottom) button
                this.enableBottomButton(0, finalHeight);

                this.setState({final : updatedFinal});
            }
        }
    };

    setRatioToTopLeft = ({
                             height,
                             newMouseY,
                             newMouseX,
                             minimum_size,
                             original,
                             final
                         }) => {
        const {widthFromRatio, heightFromRatio} = this.state,
              newWidth                          = widthFromRatio * height,
              oldOccupiedSpaceX                 = final.x + final.width;
        // if initial y + (current mouse y - initial mouse y) is greater than 0
        if (original.y + (newMouseY - original.mouse_y) >= 0) {
            const newX = oldOccupiedSpaceX - newWidth;
            if (
                newX >= 0 &&
                original.x + (newMouseX - original.mouse_x) >= 0 &&
                height > minimum_size
            ) {
                /* if (new x >= 0) && (initial x + (new mouse x - initial mouse x) >= 0) && (height > minimum size) =>
                 * set "width to ratio width", "x to (old x + old width) - new width", "height to coming height" and "y to initial y + (new mouse y - initial mouse y)" */
                const newY         = original.y + (newMouseY - original.mouse_y),
                      updatedFinal = {
                          ...this.state.final,
                          width  : newWidth,
                          x      : newX,
                          height : height,
                          y      : newY
                      };

                // enable/disable (push to left) button
                this.enableLeftButton(newX);

                // enable/disable (push to right) button
                this.enableRightButton(newX, newWidth);

                // enable/disable (push to top) button
                this.enableTopButton(newY);

                // enable/disable (push to bottom) button
                this.enableBottomButton(newY, height);

                this.setState({final : updatedFinal});
            } else {
                // opposite
                const newHeight         = heightFromRatio * (final.width + final.x),
                      oldOccupiedSpaceY = final.y + final.height,
                      newY              = oldOccupiedSpaceY - newHeight;
                if (
                    newY >= 0 &&
                    newHeight + final.y <= this.parentHeight &&
                    height > minimum_size
                ) {
                    /* if (new y >= 0) && (new height + current y <= parent div height) && (height > minimum size) =>
                     * set "width to current width + current x", "height to new height", "x to 0" and "y to new y" */
                    const finalWidth   = final.width + final.x,
                          updatedFinal = {
                              ...this.state.final,
                              width  : finalWidth,
                              height : newHeight,
                              x      : 0,
                              y      : newY
                          };

                    // enable/disable (push to left) button
                    this.enableLeftButton(0);

                    // enable/disable (push to right) button
                    this.enableRightButton(0, finalWidth);

                    // enable/disable (push to top) button
                    this.enableTopButton(newY);

                    // enable/disable (push to bottom) button
                    this.enableBottomButton(newY, newHeight);

                    this.setState({final : updatedFinal});
                }
            }
        } else {
            // opposite
            const newX =
                      oldOccupiedSpaceX - widthFromRatio * (final.height + final.y);
            if (newX >= 0 && newWidth + final.x <= this.parentWidth) {
                /* if (new x >= 0) && (new width + current x <= prent div width) =>
                 * set "width to ratio width", "x to new x", "height to current height + current y", "y to 0" */
                const finalWidth   = widthFromRatio * (final.height + final.y),
                      finalHeight  = final.height + final.y,
                      updatedFinal = {
                          ...this.state.final,
                          width  : finalWidth,
                          x      : newX,
                          height : finalHeight,
                          y      : 0
                      };

                // enable/disable (push to left) button
                this.enableLeftButton(newX);

                // enable/disable (push to right) button
                this.enableRightButton(newX, finalWidth);

                // enable/disable (push to top) button
                this.enableTopButton(0);

                // enable/disable (push to bottom) button
                this.enableBottomButton(0, finalHeight);

                this.setState({final : updatedFinal});
            }
        }
    };

    resize = e => {
        const {
                  original,
                  final,
                  minimum_size,
                  isResizeDiv,
                  isRatio,
                  isTopLeftResize,
                  isTopRightResize,
                  isBottomLeftResize,
                  isBottomRightResize
              }       = this.state;
        let newMouseX = e.clientX || e.pageX || (e.touches && e.touches[0].clientX),
            newMouseY = e.clientY || e.pageY || (e.touches && e.touches[0].clientY),
            width     = 0,
            height    = 0;

        if (isResizeDiv) {
            if (isBottomRightResize) {
                width  = original.width + (newMouseX - original.mouse_x);
                height = original.height + (newMouseY - original.mouse_y);

                if (width > minimum_size) {
                    if (isRatio) {
                        this.setRatioToBottomRight({
                            width,
                            minimum_size,
                            final
                        });
                    } else {
                        this.setFullWidthToRight({width, final});
                    }
                }
                if (height > minimum_size) {
                    if (isRatio) {
                        this.setRatioToBottomRight({
                            width,
                            minimum_size,
                            final
                        });
                    } else {
                        this.setFullHeightToBottom({height, final});
                    }
                }
            } else
                if (isBottomLeftResize) {
                    height = original.height + (newMouseY - original.mouse_y);
                    width  = original.width - (newMouseX - original.mouse_x);
                    if (height > minimum_size) {
                        if (isRatio) {
                            this.setRatioToBottomLeft({
                                width,
                                newMouseX,
                                minimum_size,
                                original,
                                final
                            });
                        } else {
                            this.setFullHeightToBottom({height, final});
                        }
                    }
                    if (width > minimum_size) {
                        if (isRatio) {
                            this.setRatioToBottomLeft({
                                width,
                                newMouseX,
                                minimum_size,
                                original,
                                final
                            });
                        } else {
                            this.setFullWidthToLeft({
                                width,
                                newMouseX,
                                original,
                                final
                            });
                        }
                    }
                } else
                    if (isTopRightResize) {
                        width  = original.width + (newMouseX - original.mouse_x);
                        height = original.height - (newMouseY - original.mouse_y);

                        if (width > minimum_size) {
                            if (isRatio) {
                                this.setRatioToTopRight({
                                    height,
                                    newMouseY,
                                    minimum_size,
                                    original,
                                    final
                                });
                            } else {
                                this.setFullWidthToRight({width, final});
                            }
                        }
                        if (height > minimum_size) {
                            if (isRatio) {
                                this.setRatioToTopRight({
                                    height,
                                    newMouseY,
                                    minimum_size,
                                    original,
                                    final
                                });
                            } else {
                                this.setFullHeightToTop({
                                    height,
                                    newMouseY,
                                    original,
                                    final
                                });
                            }
                        }
                    } else
                        if (isTopLeftResize) {
                            width  = original.width - (newMouseX - original.mouse_x);
                            height = original.height - (newMouseY - original.mouse_y);

                            if (width > minimum_size) {
                                if (isRatio) {
                                    this.setRatioToTopLeft({
                                        height,
                                        newMouseY,
                                        newMouseX,
                                        minimum_size,
                                        original,
                                        final
                                    });
                                } else {
                                    this.setFullWidthToLeft({
                                        width,
                                        newMouseX,
                                        original,
                                        final
                                    });
                                }
                            }
                            if (height > minimum_size) {
                                if (isRatio) {
                                    this.setRatioToTopLeft({
                                        height,
                                        newMouseY,
                                        newMouseX,
                                        minimum_size,
                                        original,
                                        final
                                    });
                                } else {
                                    this.setFullHeightToTop({
                                        height,
                                        newMouseY,
                                        original,
                                        final
                                    });
                                }
                            }
                        }
        }
        this.repositionOverlay();
    };

    /* *****************move methods***************** */
    move = e => {
        const {offset, original, final} = this.state;
        let newMouseX                   = e.clientX || e.pageX || (e.touches && e.touches[0].clientX),
            newMouseY                   = e.clientY || e.pageY || (e.touches && e.touches[0].clientY);

        if (this.state.isMoveDiv) {
            // if (mouse is inside parent div on y) and (current y + offset y + current div height <= parent height) set y
            if (
                original.y + (newMouseY - original.mouse_y) >= 0 &&
                newMouseY + offset[1] + final.height <= this.parentHeight
            ) {
                const newY         = newMouseY + offset[1],
                      updatedFinal = {
                          ...this.state.final,
                          y : newY
                      };

                // enable/disable (push to top) button
                this.enableTopButton(newY);

                // enable/disable (push to bottom) button
                this.enableBottomButton(newY, final.height);

                this.setState({final : updatedFinal});
            } else
                if (original.y + (newMouseY - original.mouse_y) <= 0) {
                    // if mouse is outside parent div on y => set y to 0
                    const updatedFinal = {
                        ...this.state.final,
                        y : 0
                    };

                    // enable/disable (push to top) button
                    this.enableTopButton(0);

                    // enable/disable (push to bottom) button
                    this.enableBottomButton(0, final.height);

                    this.setState({final : updatedFinal});
                } else
                    if (newMouseY + offset[1] + final.height >= this.parentHeight) {
                        // if current y + offset y + current height >= parent height => set y parent height - current height
                        const newY         = this.parentHeight - final.height,
                              updatedFinal = {
                                  ...this.state.final,
                                  y : newY
                              };

                        // enable/disable (push to top) button
                        this.enableTopButton(newY);

                        // enable/disable (push to bottom) button
                        this.enableBottomButton(newY, final.height);
                        this.setState({final : updatedFinal});
                    }

            // if (mouse is inside parent div on x) and (current x + offset x + current div width <= parent width) set x
            if (
                original.x + (newMouseX - original.mouse_x) >= 0 &&
                newMouseX + offset[0] + final.width <= this.parentWidth
            ) {
                const newX         = newMouseX + offset[0];
                const updatedFinal = {
                    ...this.state.final,
                    x : newX
                };

                // enable/disable (push to left) button
                this.enableLeftButton(newX);

                // enable/disable (push to right) button
                this.enableRightButton(newX, final.width);

                this.setState({final : updatedFinal});
            } else
                if (original.x + (newMouseX - original.mouse_x) <= 0) {
                    // if mouse is outside parent div on x => set x to 0
                    const updatedFinal = {
                        ...this.state.final,
                        x : 0
                    };

                    // enable/disable (push to left) button
                    this.enableLeftButton(0);

                    // enable/disable (push to right) button
                    this.enableRightButton(0, final.width);

                    this.setState({final : updatedFinal});
                } else
                    if (newMouseX + offset[0] + final.width >= this.parentWidth) {
                        // if current x + initial x + current width >= parent width => set x to parent width - current width
                        const newX         = this.parentWidth - final.width,
                              updatedFinal = {
                                  ...this.state.final,
                                  x : newX
                              };

                        // enable/disable (push to left) button
                        this.enableLeftButton(newX);

                        // enable/disable (push to right) button
                        this.enableRightButton(newX, final.width);

                        this.setState({final : updatedFinal});
                    }
        }
        this.repositionOverlay();
    };

    /* *****************user control methods***************** */
    enableLeftButton = x => {
        const isEnabled = x > 0;
        this.setState({isLeftEnabled : isEnabled});
    };

    enableRightButton = (x, width) => {
        const isEnabled = x + width < this.parentWidth;
        this.setState({isRightEnabled : isEnabled});
    };

    enableTopButton = y => {
        const isEnabled = y > 0;
        this.setState({isTopEnabled : isEnabled});
    };

    enableBottomButton = (y, height) => {
        const isEnabled = y + height < this.parentHeight;
        this.setState({isBottomEnabled : isEnabled});
    };

    resetData = () => {
        this.setState({
            ...this.state,
            isMouseDown     : false,
            isMoveDiv       : false,
            isResizeDiv     : false,
            ratioValue      : "1:1",
            isRatio         : true,
            widthFromRatio  : 1,
            heightFromRatio : 1,
            minimum_size    : 20,
            original        : {
                width   : 0,
                height  : 0,
                x       : 0,
                y       : 0,
                mouse_x : 0,
                mouse_y : 0
            },
            final           : {
                width  : 80,
                height : 80,
                x      : 0,
                y      : 0
            },
            offset          : [0, 0],
            isLeftEnabled   : false,
            isRightEnabled  : true,
            isTopEnabled    : false,
            isBottomEnabled : true,
            isCropped       : false,
            croppedSrc      : ""
        });
        this.repositionOverlayUserControls(80, 80, 0, 0);
    };

    /* *****************crop methods***************** */
    setIsCropped = cropped => {
        this.setState({isCropped : cropped});
    };

    getCroppedImg = croppedSrc => {
        this.setState({croppedSrc : croppedSrc});
        this.props.getCroppedImg(croppedSrc);
    };

    render() {
        const {
                  final : {width, height, x, y},
                  containerMaxWidth,
                  isImg,
                  isLeftEnabled,
                  isRightEnabled,
                  isTopEnabled,
                  isBottomEnabled,
                  ratioValue,
                  isCropped,
                  overlayN,
                  overlayE,
                  overlayS,
                  overlayW,
                  croppedSrc
              }                          = this.state,
              {image} = this.props;

        return (
            <Fragment>
                {!isCropped ? (
                    <Fragment>
                        <div
                            className="resize-move-crop-container"
                            style={{
                                width      : containerMaxWidth,
                                visibility : isImg ? "visible" : "hidden"
                            }}
                            ref={this.resizeMoveCropContainer}
                        >
                            <img
                                src={image}
                                alt="image"
                                style={{
                                    transform : `scale("1","2")`
                                }}
                            />
                            <div
                                className="overlay-n"
                                style={{
                                    right  : overlayN.right,
                                    height : overlayN.height,
                                    left   : overlayN.left
                                }}
                            />
                            <div
                                className="overlay-e"
                                style={{
                                    left : overlayE.left
                                }}
                            />
                            <div
                                className="overlay-s"
                                style={{
                                    right : overlayS.right,
                                    top   : overlayS.top,
                                    left  : overlayS.left
                                }}
                            />
                            <div className="overlay-w" style={{width : overlayW.width}}/>
                            <div
                                className="resizable"
                                ref={this.resizable}
                                onMouseDown={this.handleMoveClick}
                                onTouchStart={this.handleMoveClick}
                                style={{width : width, height : height, left : x, top : y}}
                            >
                                <div className="resizers">
                                    <div
                                        className="resizer top-left"
                                        onMouseDown={this.onTopLeftResize}
                                        onTouchStart={this.onTopLeftResize}
                                    />
                                    <div
                                        className="resizer top-right"
                                        onMouseDown={this.onTopRightResize}
                                        onTouchStart={this.onTopRightResize}
                                    />
                                    <div
                                        className="resizer bottom-left"
                                        onMouseDown={this.onBottomLeftResize}
                                        onTouchStart={this.onBottomLeftResize}
                                    />
                                    <div
                                        className="resizer bottom-right"
                                        onMouseDown={this.onBottomRightResize}
                                        onTouchStart={this.onBottomRightResize}
                                    />
                                </div>
                            </div>
                        </div>
                        <CropImageSearch
                            imageSrc={image}
                            width={width}
                            height={height}
                            x={x}
                            y={y}
                            setIsCropped={this.setIsCropped}
                            getCroppedImg={this.getCroppedImg}
                        />
                    </Fragment>
                ) : (
                    <div>
                        <img src={croppedSrc} alt="cropped image"/>
                    </div>
                )}
            </Fragment>
        );
    }
}

export default SelectAndCrop;