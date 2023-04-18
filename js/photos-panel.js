"use strict";
var __importDefault = this && this.__importDefault || function (e) {
    return e && e.__esModule ? e : {default: e}
};
Object.defineProperty(exports, "__esModule", {value: !0}), exports.ImagesGrid = void 0;
const react_1 = __importDefault(require("react")), styled_1 = __importDefault(require("../utils/styled")),
    core_1 = require("@blueprintjs/core"), l10n_1 = require("../utils/l10n"), page_1 = require("../canvas/page"),
    ImagesListContainer = (0, styled_1.default)("div", react_1.default.forwardRef)`
  height: 100%;
  overflow: auto;
`, ImagesRow = (0, styled_1.default)("div")`
  width: 33%;
  float: left;
`, ImgWrapDiv = (0, styled_1.default)("div")`
  padding: 5px;
  width: 100%;
  &:hover .credit {
    opacity: 1;
  }
  @media screen and (max-width: 500px) {
    .credit {
      opacity: 1;
    }
  }
`, ImgContainerDiv = (0, styled_1.default)("div")`
  border-radius: 5px;
  position: relative;
  overflow: hidden;
  box-shadow: ${e => e["data-shadowenabled"] ? "0 0 5px rgba(16, 22, 26, 0.3)" : ""};
`, Img = (0, styled_1.default)("img")`
  width: 100%;
  cursor: pointer;
  display: block;
`, CreditWrap = (0, styled_1.default)("div")`
  position: absolute;
  bottom: 0px;
  left: 0px;
  font-size: 10px;
  padding: 3px;
  padding-top: 10px;
  text-align: center;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.4),
    rgba(0, 0, 0, 0.6)
  );
  width: 100%;
  opacity: 0;
  color: white;
`, NoResults = (0, styled_1.default)("p")`
  text-align: center;
  padding: 30px;
`, Image = ({
                                                                                                                                                                                                                                                                                                                                                                                                                                                               url: e,
                                                                                                                                                                                                                                                                                                                                                                                                                                                               credit: t,
                                                                                                                                                                                                                                                                                                                                                                                                                                                               onSelect: r,
                                                                                                                                                                                                                                                                                                                                                                                                                                                               crossOrigin: a,
                                                                                                                                                                                                                                                                                                                                                                                                                                                               shadowEnabled: l,
                                                                                                                                                                                                                                                                                                                                                                                                                                                               itemHeight: o,
                                                                                                                                                                                                                                                                                                                                                                                                                                                               className: i,
                                                                                                                                                                                                                                                                                                                                                                                                                                                               onLoad: n
                                                                                                                                                                                                                                                                                                                                                                                                                                                           }) => {
        const d = null == l || l;
        return react_1.default.createElement(ImgWrapDiv, {
            onClick: () => {
                r()
            }, className: "polotno-close-panel"
        }, react_1.default.createElement(ImgContainerDiv, {"data-shadowenabled": d}, react_1.default.createElement(Img, {
            className: i,
            style: {height: null != o ? o : "auto"},
            src: e,
            draggable: !0,
            crossOrigin: a,
            onDragStart: () => {
                (0, page_1.registerNextDomDrop)((({x: e, y: t}, a) => {
                    r({x: e, y: t}, a)
                }))
            },
            onDragEnd: () => {
                (0, page_1.registerNextDomDrop)(null)
            },
            onLoad: n
        }), t && react_1.default.createElement(CreditWrap, {className: "credit"}, t)))
    }, ImagesGrid = ({
                         images: e,
                         onSelect: t,
                         isLoading: r,
                         getPreview: a,
                         loadMore: l,
                         getCredit: o,
                         getImageClassName: i,
                         rowsNumber: n,
                         crossOrigin: d = "anonymous",
                         shadowEnabled: s,
                         itemHeight: c,
                         error: u
                     }) => {
        const g = n || 2, m = react_1.default.useRef(null), p = [];
        for (var f = 0; f < g; f++) p.push((e || []).filter(((e, t) => t % g === f)));
        const _ = react_1.default.useRef(null), h = () => {
            var t, a, o;
            const i = (null === (t = m.current) || void 0 === t ? void 0 : t.scrollHeight) > (null === (a = m.current) || void 0 === a ? void 0 : a.offsetHeight) + 5,
                n = e && e.length,
                d = Array.from(null === (o = m.current) || void 0 === o ? void 0 : o.querySelectorAll("img")).every((e => e.complete));
            !i && l && !r && n && d && (_.current || (_.current = window.setTimeout((() => {
                _.current = null, l && l()
            }), 100)))
        }, v = () => {
            h()
        };
        return react_1.default.useEffect((() => (h(), () => {
            window.clearTimeout(_.current), _.current = null
        })), [e && e.length, r]), react_1.default.createElement(ImagesListContainer, {
            onScroll: e => {
                const t = e.target.scrollHeight - e.target.scrollTop - e.target.offsetHeight;
                l && !r && t < 200 && l()
            }, ref: m
        }, p.map(((e, l) => react_1.default.createElement(ImagesRow, {
            key: l,
            style: {width: 100 / g + "%"}
        }, e.map((e => react_1.default.createElement(Image, {
            url: a(e),
            onSelect: (r, a) => t(e, r, a),
            key: a(e),
            credit: o && o(e),
            crossOrigin: d,
            shadowEnabled: s,
            itemHeight: c,
            className: i && i(e),
            onLoad: v
        }))), r && react_1.default.createElement("div", {style: {padding: "30px"}}, react_1.default.createElement(core_1.Spinner, null))))), !r && (!e || !e.length) && !u && react_1.default.createElement(NoResults, null, (0, l10n_1.t)("sidePanel.noResults")), u && react_1.default.createElement(NoResults, null, (0, l10n_1.t)("sidePanel.error")))
    };
exports.ImagesGrid = ImagesGrid;