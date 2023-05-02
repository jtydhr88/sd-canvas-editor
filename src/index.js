import React from 'react';
import ReactDOM from 'react-dom/client';
import {PolotnoContainer, SidePanelWrap, WorkspaceWrap} from 'polotno';
import {Toolbar} from 'polotno/toolbar/toolbar';
import {ZoomButtons} from 'polotno/toolbar/zoom-buttons';
import {SidePanel} from 'polotno/side-panel';
import {Workspace} from 'polotno/canvas/workspace';
import {getImageSize} from 'polotno/utils/image';
import {createStore} from 'polotno/model/store';
import {ImagesGrid} from 'polotno/side-panel/images-grid';
import {observer} from 'mobx-react-lite';
import {SectionTab} from 'polotno/side-panel';
import {
    TemplatesSection,
    TextSection,
    PhotosSection,
    ElementsSection,
    UploadSection,
    BackgroundSection,
    LayersSection,
    SizeSection,
} from 'polotno/side-panel';
import {DEFAULT_SECTIONS} from "polotno/side-panel/side-panel";
import { DownloadButton } from 'polotno/toolbar/download-button';

let _txt2imgInfoJSON;
let _img2imgInfoJSON;

export const setTxt2imgInfoJSON = (txt2imgInfoJSON) => {
    _txt2imgInfoJSON = txt2imgInfoJSON;
}

export const setImg2imgInfoJSON = (img2imgInfoJSON) => {
    _img2imgInfoJSON = img2imgInfoJSON;
}

let txt2ImgPageNum = 2;
let img2ImgPageNum = 2;

export const Txt2ImgPhotosPanel = observer(({store}) => {
    const [images, setImages] = React.useState([]);

    async function loadImages() {
        setImages(_txt2imgInfoJSON);
        await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    React.useEffect(() => {
            loadImages();
        },
        []
    );

    return (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <p>txt2img Library</p>
            <ImagesGrid
                images={images}
                getPreview={(image) => image.url}
                onSelect={async (image, pos) => {
                    const {width, height} = await getImageSize(image.url);
                    store.activePage.addElement({
                        type: 'image',
                        src: image.url,
                        width,
                        height,
                        x: pos ? pos.x : store.width / 2 - width / 2,
                        y: pos ? pos.y : store.height / 2 - height / 2,
                    });
                }}
                rowsNumber={2}
                isLoading={!images.length}
                loadMore={async () => {
                    let pageInfo = '{"type": "txt2img", "num": pageNum, "size": 15}';

                    pageInfo = pageInfo.replace("pageNum", txt2ImgPageNum.toString());

                    const txt2ImgFilePaths = await _loadMoreFunc('getImgFilePaths', pageInfo)

                    const txt2ImgFilePathsJsonData = JSON.parse(txt2ImgFilePaths);

                    _txt2imgInfoJSON = _txt2imgInfoJSON.concat(txt2ImgFilePathsJsonData);

                    await loadImages();

                    txt2ImgPageNum = txt2ImgPageNum + 1;
                }
                }
            />
        </div>
    );
});

let _loadMoreFunc;

export const setLoadMoreFunc = (loadMoreFunc) => {
    _loadMoreFunc = loadMoreFunc;
}

export const Img2TxtPhotosPanel = observer(({store}) => {
    const [images, setImages] = React.useState([]);

    async function loadImages() {
        // here we should implement your own API requests
        setImages(_img2imgInfoJSON);
        await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    React.useEffect(() => {
        loadImages();
    }, []);

    return (
        <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <p>img2img Library</p>
            <ImagesGrid
                images={images}
                getPreview={(image) => image.url}
                onSelect={async (image, pos) => {
                    const {width, height} = await getImageSize(image.url);
                    store.activePage.addElement({
                        type: 'image',
                        src: image.url,
                        width,
                        height,
                        x: pos ? pos.x : store.width / 2 - width / 2,
                        y: pos ? pos.y : store.height / 2 - height / 2,
                    });
                }}
                rowsNumber={2}
                isLoading={!images.length}
                loadMore={async () => {
                    let pageInfo = '{"type": "img2img", "num": pageNum, "size": 15}';

                    pageInfo = pageInfo.replace("pageNum", img2ImgPageNum.toString());

                    const img2ImgFilePaths = await _loadMoreFunc('getImgFilePaths', pageInfo)

                    const img2ImgFilePathsJsonData = JSON.parse(img2ImgFilePaths);

                    _img2imgInfoJSON = _img2imgInfoJSON.concat(img2ImgFilePathsJsonData);

                    await loadImages();

                    img2ImgPageNum = img2ImgPageNum + 1;
                }
                }
            />
        </div>
    );
});

const Txt2ImgPhotos = {
    name: 'sd-txt2img',
    Tab: (props) => (
        <SectionTab name="Txt2img" {...props}>
        </SectionTab>
    ),
    Panel: Txt2ImgPhotosPanel,
};

const Img2ImgPhotos = {
    name: 'sd-img2img',
    Tab: (props) => (
        <SectionTab name="Img2img" {...props}>
        </SectionTab>
    ),
    // we need observer to update component automatically on any store changes
    Panel: Img2TxtPhotosPanel,
};


const sections = [
    TemplatesSection,
    TextSection,
    PhotosSection,
    ElementsSection,
    UploadSection,
    BackgroundSection,
    LayersSection,
    SizeSection,
    Txt2ImgPhotos,
    Img2ImgPhotos,
];

const ActionControls = ({store}) => {
    return (
        <div>
            <DownloadButton store={store}/>
        </div>
    );
};

const MyToolbar = ({store}) => {
    return (
        <Toolbar
            store={store}
            components={{
                ActionControls,
            }}
        />
    );
};

export const App = ({store}) => {
    return (
        <PolotnoContainer style={{width: '95vw', height: '90vh'}}>
            <SidePanelWrap>
                <SidePanel store={store} sections={sections}/>
            </SidePanelWrap>
            <WorkspaceWrap>
                <MyToolbar store={store}/>
                <Workspace store={store}/>
                <ZoomButtons store={store}/>
            </WorkspaceWrap>
        </PolotnoContainer>
    );
};

let _store;

export const createPolotnoApp = ({key, container, width, height}) => {
    const store = createStore({
        key: key,
        showCredit: true,
    });

    store.addPage();
    store.setSize(Number(width), Number(height), true)

    const root = ReactDOM.createRoot(container);

    root.render(<App store={store}/>);

    _store = store;
};

export const getPolotnoStore = () => {
    return _store;
};

window.createPolotnoApp = createPolotnoApp;
window.getPolotnoStore = getPolotnoStore;
window.setTxt2imgInfoJSON = setTxt2imgInfoJSON;
window.setImg2imgInfoJSON = setImg2imgInfoJSON;
window.setLoadMoreFunc = setLoadMoreFunc;